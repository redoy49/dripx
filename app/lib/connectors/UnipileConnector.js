import { ObjectId } from "mongodb";
import { LinkedInConnector } from "@/app/lib/connectors/LinkedInConnector";
import { dbConnect } from "@/app/lib/mongoDb";
import * as unipile from "@/app/lib/integrations/unipile";

async function getConnectedAccountId(workspaceId) {
  const integrations = await dbConnect("integrations");
  const doc = await integrations.findOne({ workspaceId: new ObjectId(workspaceId), type: "unipile" });

  if (!doc || doc.status !== "connected" || !doc.accountId) {
    throw new Error("LinkedIn account is not connected for this workspace (Settings > Integrations)");
  }
  return doc.accountId;
}

function linkedinIdentifier(lead) {
  const slug = unipile.slugFromLinkedinUrl(lead.linkedinUrl);
  if (!slug) throw new Error("Lead has no LinkedIn URL");
  return slug;
}

// Resolves and caches the person's Unipile provider_id (needed for every action) so
// later steps in the same sequence don't re-resolve it.
async function resolveProviderId(lead, accountId) {
  if (lead.unipile?.providerId) return lead.unipile.providerId;

  const profile = await unipile.getProfile({ accountId, identifier: linkedinIdentifier(lead) });
  const providerId = profile.provider_id;
  if (!providerId) throw new Error("Unipile did not return a provider_id for this profile");

  const leads = await dbConnect("leads");
  await leads.updateOne({ _id: lead._id }, { $set: { "unipile.providerId": providerId } });

  return providerId;
}

async function rememberChatId(lead, chatId) {
  if (!chatId) return;
  const leads = await dbConnect("leads");
  await leads.updateOne({ _id: lead._id }, { $set: { "unipile.chatId": chatId } });
}

// Real LinkedIn provider backed by Unipile. Holds no per-workspace state — every method
// resolves the lead's workspace to a connected account, so getLinkedInConnector() can
// keep caching a single shared instance.
export class UnipileConnector extends LinkedInConnector {
  async sendConnectionRequest(lead, message) {
    try {
      const accountId = await getConnectedAccountId(lead.workspaceId);
      const providerId = await resolveProviderId(lead, accountId);
      const res = await unipile.sendInvitation({ accountId, providerId, message });
      return { success: true, providerMessageId: res.invitation_id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendMessage(lead, message) {
    return this.#sendText(lead, message, { inmail: false });
  }

  async sendInMail(lead, subject, message) {
    return this.#sendText(lead, message, { inmail: true, subject });
  }

  async #sendText(lead, text, { inmail, subject }) {
    try {
      const accountId = await getConnectedAccountId(lead.workspaceId);

      // Once we already have a chat with this lead, keep using it instead of starting a
      // new one each time a later "message"/"follow_up" step runs.
      if (lead.unipile?.chatId && !inmail) {
        const res = await unipile.sendMessageInChat({ accountId, chatId: lead.unipile.chatId, text });
        return { success: true, providerMessageId: res?.message_id };
      }

      const providerId = await resolveProviderId(lead, accountId);
      const res = await unipile.startChat({ accountId, attendeeProviderId: providerId, text, subject, inmail });
      await rememberChatId(lead, res.chat_id);
      return { success: true, providerMessageId: res.message_id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async visitProfile(lead) {
    try {
      const accountId = await getConnectedAccountId(lead.workspaceId);
      await unipile.getProfile({ accountId, identifier: linkedinIdentifier(lead), notify: true });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Needs a "find their latest post" lookup that isn't wired up yet — fails clearly
  // rather than pretending to succeed.
  async likeRecentPost() {
    return { success: false, error: "Like Post is not implemented for the Unipile connector yet" };
  }

  async followProfile() {
    return { success: false, error: "Follow is not implemented for the Unipile connector yet" };
  }

  // LinkedIn search import isn't wired up — use CSV upload or paste-URLs instead.
  async fetchProfiles() {
    throw new Error("LinkedIn search import isn't wired up yet — use CSV upload or paste LinkedIn URLs instead");
  }
}

// Best-effort name/headline lookup for a lead that only has a LinkedIn URL. Returns null
// on any failure so a bad lookup never blocks the import.
export async function previewLinkedInProfile(workspaceId, linkedinUrl) {
  try {
    const accountId = await getConnectedAccountId(workspaceId);
    const slug = unipile.slugFromLinkedinUrl(linkedinUrl);
    if (!slug) return null;

    const profile = await unipile.getProfile({ accountId, identifier: slug });

    return {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      headline: profile.headline || "",
      providerId: profile.provider_id || null,
    };
  } catch {
    return null;
  }
}
