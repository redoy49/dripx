import crypto from "crypto";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

const DELIVERY_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 5;

function signPayload(secret, body) {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

async function attemptDelivery(webhook, delivery) {
  const body = JSON.stringify(delivery.payload);
  const signature = signPayload(webhook.secret, body);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DELIVERY_TIMEOUT_MS);

    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DripX-Event": delivery.event,
        "X-DripX-Signature": signature,
      },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return { success: res.ok, responseStatus: res.status };
  } catch (error) {
    return { success: false, responseStatus: null, error: error.message };
  }
}

// Dispatches an event to every active webhook in the workspace subscribed to it.
// Fires the delivery immediately and logs the outcome; failed deliveries stay "pending"
// (up to MAX_ATTEMPTS) so retryPendingDeliveries() can retry them on a later scheduler tick.
export async function dispatchWebhookEvent(workspaceId, event, payload) {
  try {
    const webhooks = await dbConnect("webhooks");
    const subscribed = await webhooks
      .find({ workspaceId: new ObjectId(workspaceId), status: "active", events: event })
      .toArray();

    if (subscribed.length === 0) return;

    const deliveries = await dbConnect("webhook_deliveries");

    for (const webhook of subscribed) {
      const deliveryDoc = {
        webhookId: webhook._id,
        event,
        payload,
        status: "pending",
        attempts: 0,
        lastAttemptAt: null,
        responseStatus: null,
      };
      const { insertedId } = await deliveries.insertOne(deliveryDoc);
      const result = await attemptDelivery(webhook, deliveryDoc);

      await deliveries.updateOne(
        { _id: insertedId },
        {
          $set: {
            status: result.success ? "success" : "pending",
            responseStatus: result.responseStatus,
            lastAttemptAt: new Date(),
          },
          $inc: { attempts: 1 },
        },
      );
    }
  } catch (error) {
    console.error("dispatchWebhookEvent failed:", error);
  }
}

// Retries deliveries still marked "pending" after a failed first attempt. Called from the
// cron scheduler route alongside job processing.
export async function retryPendingDeliveries(batchSize = 20) {
  const deliveries = await dbConnect("webhook_deliveries");
  const webhooks = await dbConnect("webhooks");

  const due = await deliveries
    .find({ status: "pending", attempts: { $lt: MAX_ATTEMPTS } })
    .limit(batchSize)
    .toArray();

  let retried = 0;

  for (const delivery of due) {
    const webhook = await webhooks.findOne({ _id: delivery.webhookId });
    if (!webhook || webhook.status !== "active") {
      await deliveries.updateOne({ _id: delivery._id }, { $set: { status: "failed" } });
      continue;
    }

    const result = await attemptDelivery(webhook, delivery);
    retried++;

    await deliveries.updateOne(
      { _id: delivery._id },
      {
        $set: {
          status: result.success
            ? "success"
            : delivery.attempts + 1 >= MAX_ATTEMPTS
              ? "failed"
              : "pending",
          responseStatus: result.responseStatus,
          lastAttemptAt: new Date(),
        },
        $inc: { attempts: 1 },
      },
    );
  }

  return { retried };
}
