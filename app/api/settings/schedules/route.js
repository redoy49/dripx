import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { DEFAULT_SENDING_SCHEDULE, parseTimeToMinutes } from "@/app/lib/scheduleEngine";

function serializeSchedule(doc) {
  return {
    id: doc._id?.toString(),
    timezone: doc.timezone || DEFAULT_SENDING_SCHEDULE.timezone,
    days: Array.isArray(doc.days) ? doc.days : DEFAULT_SENDING_SCHEDULE.days,
    startTime: doc.startTime || DEFAULT_SENDING_SCHEDULE.startTime,
    endTime: doc.endTime || DEFAULT_SENDING_SCHEDULE.endTime,
    leadTimezoneOptimization: Boolean(doc.leadTimezoneOptimization),
    updatedAt: doc.updatedAt || doc.createdAt,
  };
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const schedulesCol = await dbConnect("sending_schedules");
    let doc = await schedulesCol.findOne({ workspaceId: new ObjectId(session.workspaceId) });

    if (!doc) {
      doc = {
        workspaceId: new ObjectId(session.workspaceId),
        ...DEFAULT_SENDING_SCHEDULE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await schedulesCol.insertOne(doc);
    }

    return Response.json(serializeSchedule(doc));
  } catch (error) {
    console.error("Fetching sending schedule failed:", error);
    return Response.json({ message: "Failed to fetch sending schedule" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const body = await req.json();
    const update = {};

    if (body.timezone && typeof body.timezone === "string") {
      try {
        // Test valid IANA timezone
        Intl.DateTimeFormat(undefined, { timeZone: body.timezone });
        update.timezone = body.timezone;
      } catch {
        return Response.json({ message: "Invalid IANA timezone" }, { status: 400 });
      }
    }

    if (Array.isArray(body.days)) {
      const validDays = body.days
        .map((d) => parseInt(d, 10))
        .filter((d) => d >= 1 && d <= 7);
      if (validDays.length === 0) {
        return Response.json({ message: "At least one active sending day must be selected" }, { status: 400 });
      }
      update.days = [...new Set(validDays)].sort((a, b) => a - b);
    }

    if (body.startTime && typeof body.startTime === "string") {
      update.startTime = body.startTime;
    }

    if (body.endTime && typeof body.endTime === "string") {
      update.endTime = body.endTime;
    }

    if (update.startTime && update.endTime) {
      const startMin = parseTimeToMinutes(update.startTime);
      const endMin = parseTimeToMinutes(update.endTime);
      if (startMin >= endMin) {
        return Response.json({ message: "End time must be after start time" }, { status: 400 });
      }
    }

    if (body.leadTimezoneOptimization !== undefined) {
      update.leadTimezoneOptimization = Boolean(body.leadTimezoneOptimization);
    }

    update.updatedAt = new Date();

    const schedulesCol = await dbConnect("sending_schedules");
    const result = await schedulesCol.findOneAndUpdate(
      { workspaceId: new ObjectId(session.workspaceId) },
      { $set: update, $setOnInsert: { createdAt: new Date() } },
      { upsert: true, returnDocument: "after" },
    );

    return Response.json(serializeSchedule(result));
  } catch (error) {
    console.error("Updating sending schedule failed:", error);
    return Response.json({ message: "Failed to update sending schedule" }, { status: 500 });
  }
}
