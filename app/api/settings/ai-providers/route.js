import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { encryptCredentials } from "@/app/lib/crypto";
import { AI_PROVIDERS } from "@/app/lib/ai/models";
import { getWorkspaceAiKeys } from "@/app/lib/ai/modelResolver";

function maskSecret(key) {
  if (!key || typeof key !== "string") return "";
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const byokKeys = await getWorkspaceAiKeys(session.workspaceId);

    const status = AI_PROVIDERS.map((p) => {
      const hasByok = Boolean(byokKeys[p.id]);
      const hasEnv =
        p.id === "gateway"
          ? Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)
          : Boolean(process.env[p.envHint]);

      return {
        id: p.id,
        label: p.label,
        configured: hasByok || hasEnv,
        source: hasByok ? "byok" : hasEnv ? "platform" : "none",
        maskedKey: hasByok ? maskSecret(byokKeys[p.id]) : null,
      };
    });

    return Response.json({ providers: status });
  } catch (error) {
    console.error("[AiProviders] GET error:", error);
    return Response.json({ message: "Failed to fetch AI provider settings" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const body = await req.json();
    const updates = body?.keys || {};
    const validIds = new Set(AI_PROVIDERS.map((p) => p.id));

    const col = await dbConnect("ai_provider_configs");
    const wsId = new ObjectId(session.workspaceId);
    const existing = await col.findOne({ workspaceId: wsId });
    const nextProviders = { ...(existing?.providers || {}) };

    for (const [providerId, rawValue] of Object.entries(updates)) {
      if (!validIds.has(providerId)) continue;
      if (rawValue === null || rawValue === "") {
        delete nextProviders[providerId];
      } else if (typeof rawValue === "string" && rawValue.trim()) {
        nextProviders[providerId] = encryptCredentials(rawValue.trim());
      }
    }

    await col.updateOne(
      { workspaceId: wsId },
      {
        $set: {
          providers: nextProviders,
          updatedAt: new Date(),
          updatedByUserId: new ObjectId(session.userId),
        },
        $setOnInsert: { workspaceId: wsId, createdAt: new Date() },
      },
      { upsert: true }
    );

    return Response.json({ saved: true });
  } catch (error) {
    console.error("[AiProviders] PUT error:", error);
    return Response.json({ message: "Failed to save AI provider keys" }, { status: 500 });
  }
}
