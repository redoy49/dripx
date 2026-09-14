import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { STEP_TYPES, BRANCH_END } from "@/app/lib/sequenceEngine";

function serializeStep(step) {
  return {
    id: step._id.toString(),
    order: step.order,
    type: step.type,
    config: step.config || {},
    branches: step.branches
      ? {
          yes: step.branches.yes ? step.branches.yes.toString() : null,
          no: step.branches.no ? step.branches.no.toString() : null,
        }
      : null,
    // Explicit continuation (see sequenceEngine.js resolveContinuation); falls back to
    // positional order when unset.
    next: step.next ? step.next.toString() : null,
    // Canvas node position — cosmetic only, never read by the execution engine.
    position:
      step.position && typeof step.position.x === "number" && typeof step.position.y === "number"
        ? { x: step.position.x, y: step.position.y }
        : null,
  };
}

async function loadCampaign(id, workspaceId) {
  const campaigns = await dbConnect("campaigns");
  return campaigns.findOne({ _id: new ObjectId(id), workspaceId: new ObjectId(workspaceId) });
}

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const campaign = await loadCampaign(id, session.workspaceId);
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    const sequenceSteps = await dbConnect("sequence_steps");
    const steps = await sequenceSteps
      .find({ campaignId: campaign._id })
      .sort({ order: 1 })
      .toArray();

    return Response.json({ items: steps.map(serializeStep) });
  } catch (error) {
    console.error("Fetching sequence steps failed:", error);

    return Response.json({ message: "Failed to fetch sequence steps" }, { status: 500 });
  }
}

// Replaces the whole ordered step array in one call (the builder edits the sequence
// client-side, then saves). Only allowed while the campaign is still a draft — once
// active, enrolled leads' campaign_leads.currentStepId points into this graph, so
// structural edits are blocked to avoid orphaning leads mid-sequence.
export async function PUT(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const campaign = await loadCampaign(id, session.workspaceId);
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    if (campaign.status !== "draft") {
      return Response.json(
        { message: "Pause the campaign and set it back to draft before editing its sequence" },
        { status: 409 },
      );
    }

    const body = await req.json();
    const incoming = Array.isArray(body.steps) ? body.steps : [];

    for (const step of incoming) {
      if (!STEP_TYPES[step.type]) {
        return Response.json({ message: `Unknown step type: ${step.type}` }, { status: 400 });
      }
    }

    // Assign a stable ObjectId to every incoming step (keyed by the client's temp id) so
    // branch references (which point at other steps in this same payload) can be resolved.
    const idMap = new Map();
    for (const step of incoming) {
      idMap.set(step.clientId, new ObjectId());
    }

    // A branch/next target is either BRANCH_END (explicit stop), a temp clientId
    // resolved via idMap, or absent/unrecognized (treated as null — falls through to
    // the next step in order).
    function resolveTarget(value) {
      if (value === BRANCH_END) return BRANCH_END;
      if (value) return idMap.get(value) || null;
      return null;
    }

    const docs = incoming.map((step, index) => ({
      _id: idMap.get(step.clientId),
      campaignId: campaign._id,
      order: index,
      type: step.type,
      config: step.config || {},
      branches:
        step.type === "condition"
          ? {
              yes: resolveTarget(step.branches?.yes),
              no: resolveTarget(step.branches?.no),
            }
          : null,
      next: resolveTarget(step.next),
      position:
        step.position && typeof step.position.x === "number" && typeof step.position.y === "number"
          ? { x: step.position.x, y: step.position.y }
          : null,
    }));

    const sequenceSteps = await dbConnect("sequence_steps");
    await sequenceSteps.deleteMany({ campaignId: campaign._id });
    if (docs.length > 0) await sequenceSteps.insertMany(docs);

    return Response.json({ items: docs.map(serializeStep) });
  } catch (error) {
    console.error("Saving sequence steps failed:", error);

    return Response.json({ message: "Failed to save sequence steps" }, { status: 500 });
  }
}
