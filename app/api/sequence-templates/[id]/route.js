import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { SYSTEM_SEQUENCE_TEMPLATES, templateToStepsSummary } from "@/app/lib/sequenceTemplates";

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;

    // Check system templates first
    const system = SYSTEM_SEQUENCE_TEMPLATES.find((t) => t.id === id);
    if (system) {
      return Response.json(system);
    }

    // Check workspace custom templates
    if (ObjectId.isValid(id)) {
      const templatesCol = await dbConnect("sequence_templates");
      const doc = await templatesCol.findOne({
        _id: new ObjectId(id),
        workspaceId: new ObjectId(session.workspaceId),
      });

      if (doc) {
        const summary = templateToStepsSummary(doc);
        return Response.json({
          id: doc._id.toString(),
          name: doc.name,
          description: doc.description || "",
          category: doc.category || "Custom",
          channels: doc.channels || summary.channels,
          estimatedDays: doc.estimatedDays || summary.estimatedDays,
          isSystem: false,
          badge: "Custom",
          steps: doc.steps || [],
        });
      }
    }

    return Response.json({ message: "Template not found" }, { status: 404 });
  } catch (error) {
    console.error("Fetching template failed:", error);
    return Response.json({ message: "Failed to fetch template" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;

    // Prevent deletion of system templates
    const system = SYSTEM_SEQUENCE_TEMPLATES.find((t) => t.id === id);
    if (system) {
      return Response.json({ message: "System templates cannot be deleted" }, { status: 403 });
    }

    if (!ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid template ID" }, { status: 400 });
    }

    const templatesCol = await dbConnect("sequence_templates");
    const result = await templatesCol.deleteOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (result.deletedCount === 0) {
      return Response.json({ message: "Template not found" }, { status: 404 });
    }

    return Response.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Deleting template failed:", error);
    return Response.json({ message: "Failed to delete template" }, { status: 500 });
  }
}
