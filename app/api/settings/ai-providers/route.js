import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { encryptCredentials } from "@/app/lib/crypto";
import { PROVIDER_PRESETS, getProviderPreset } from "@/app/lib/ai/providers";
import { fetchProviderModels } from "@/app/lib/ai/modelDiscovery";
import { getWorkspaceProviderConfigs } from "@/app/lib/ai/modelResolver";

function maskSecret(key = "") {
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;
    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const configs = await getWorkspaceProviderConfigs(session.workspaceId);
    const connectedProviders = Object.values(configs).map((cfg) => ({
      providerId: cfg.providerId,
      label: cfg.label,
      baseUrl: cfg.baseUrl,
      maskedKey: maskSecret(cfg.apiKey),
      modelCount: cfg.syncedModels.length,
      syncedModels: cfg.syncedModels,
    }));

    return Response.json({
      connectedProviders,
      presets: PROVIDER_PRESETS,
      platformGateway: Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN),
    });
  } catch (error) {
    console.error("[AiProviders] GET error:", error);
    return Response.json({ message: "Failed to load AI providers" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;
    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { providerId, apiKey, baseUrl, customName, manualModels } = await req.json();
    const preset = getProviderPreset(providerId);
    if (!preset) return Response.json({ message: "Unknown provider preset" }, { status: 400 });

    const { baseUrl: resolvedBase, models } = await fetchProviderModels({
      providerId,
      apiKey,
      baseUrl: baseUrl || preset.defaultBaseUrl,
      manualModels,
    });

    const col = await dbConnect("ai_provider_configs");
    const wsId = new ObjectId(session.workspaceId);
    const existing = await col.findOne({ workspaceId: wsId });
    const nextProviders = { ...(existing?.providers || {}) };

    nextProviders[providerId] = {
      credentials: encryptCredentials({ apiKey: apiKey.trim(), baseUrl: resolvedBase }),
      baseUrl: resolvedBase,
      customName: customName?.trim() || preset.label,
      syncedModels: models,
      updatedAt: new Date(),
    };

    await col.updateOne(
      { workspaceId: wsId },
      {
        $set: { providers: nextProviders, updatedAt: new Date(), updatedByUserId: new ObjectId(session.userId) },
        $setOnInsert: { workspaceId: wsId, createdAt: new Date() },
      },
      { upsert: true }
    );

    return Response.json({ saved: true, modelCount: models.length, models });
  } catch (error) {
    console.error("[AiProviders] PUT error:", error);
    return Response.json({ message: error.message || "Failed to verify & save API key" }, { status: 400 });
  }
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;
    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { providerId } = await req.json();
    const configs = await getWorkspaceProviderConfigs(session.workspaceId);
    const target = configs[providerId];
    if (!target) return Response.json({ message: "Provider key not found" }, { status: 404 });

    const { models } = await fetchProviderModels({
      providerId,
      apiKey: target.apiKey,
      baseUrl: target.baseUrl,
    });

    const col = await dbConnect("ai_provider_configs");
    await col.updateOne(
      { workspaceId: new ObjectId(session.workspaceId) },
      { $set: { [`providers.${providerId}.syncedModels`]: models, [`providers.${providerId}.updatedAt`]: new Date() } }
    );

    return Response.json({ refreshed: true, modelCount: models.length, models });
  } catch (error) {
    return Response.json({ message: error.message || "Failed to refresh models" }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;
    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");
    if (!providerId) return Response.json({ message: "providerId is required" }, { status: 400 });

    const col = await dbConnect("ai_provider_configs");
    await col.updateOne(
      { workspaceId: new ObjectId(session.workspaceId) },
      { $unset: { [`providers.${providerId}`]: "" } }
    );
    return Response.json({ deleted: true });
  } catch (error) {
    return Response.json({ message: error.message || "Failed to remove provider" }, { status: 500 });
  }
}
