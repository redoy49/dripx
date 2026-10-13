import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { SYSTEM_SEQUENCE_TEMPLATES, templateToStepsSummary } from "@/app/lib/sequenceTemplates";

function serializeCustomTemplate(doc) {
  const summary = templateToStepsSummary(doc);
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || "",
    category: doc.category || "Custom",
    channels: doc.channels || summary.channels || ["email"],
    estimatedDays: doc.estimatedDays || summary.estimatedDays || 5,
    isSystem: false,
    badge: "Custom",
    stepsCount: doc.steps?.length || 0,
    steps: doc.steps || [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const templatesCol = await dbConnect("sequence_templates");
    const customDocs = await templatesCol
      .find({ workspaceId: new ObjectId(session.workspaceId) })
      .sort({ createdAt: -1 })
      .toArray();

    const customTemplates = customDocs.map(serializeCustomTemplate);

    let all = [
      ...SYSTEM_SEQUENCE_TEMPLATES.map((t) => ({
        ...t,
        stepsCount: t.steps.length,
      })),
      ...customTemplates,
    ];

    if (category && category !== "All") {
      all = all.filter((t) => t.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      all = all.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    return Response.json({
      items: all,
      totalCount: all.length,
      systemCount: SYSTEM_SEQUENCE_TEMPLATES.length,
      customCount: customTemplates.length,
    });
  } catch (error) {
    console.error("Fetching sequence templates failed:", error);
    return Response.json({ message: "Failed to fetch sequence templates" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();

    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return Response.json({ message: "Template name is required" }, { status: 400 });
    }

    if (!Array.isArray(body.steps) || body.steps.length === 0) {
      return Response.json({ message: "Template must contain at least one sequence step" }, { status: 400 });
    }

    const summary = templateToStepsSummary({ steps: body.steps });

    const newTemplate = {
      workspaceId: new ObjectId(session.workspaceId),
      createdByUserId: new ObjectId(session.user.id),
      name: body.name.trim(),
      description: body.description?.trim() || "",
      category: body.category || "Custom",
      channels: summary.channels,
      estimatedDays: body.estimatedDays || summary.estimatedDays || 5,
      isSystem: false,
      steps: body.steps,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const templatesCol = await dbConnect("sequence_templates");
    const result = await templatesCol.insertOne(newTemplate);

    return Response.json(
      serializeCustomTemplate({ _id: result.insertedId, ...newTemplate }),
      { status: 201 },
    );
  } catch (error) {
    console.error("Saving sequence template failed:", error);
    return Response.json({ message: "Failed to save sequence template" }, { status: 500 });
  }
}
