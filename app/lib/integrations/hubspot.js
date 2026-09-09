import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

export async function getHubspotIntegration(workspaceId) {
  const integrations = await dbConnect("integrations");
  return integrations.findOne({ workspaceId: new ObjectId(workspaceId), type: "hubspot" });
}

// Real HubSpot API call, but always checks for stored credentials first and no-ops with a
// clear "not connected" result if the workspace hasn't connected HubSpot — so the rest of
// the app never has to guard against this integration being unconfigured.
export async function syncLeadToHubSpotContact(workspaceId, lead) {
  const integration = await getHubspotIntegration(workspaceId);

  if (!integration || integration.status !== "connected" || !integration.credentials?.accessToken) {
    return { success: false, skipped: true, message: "HubSpot is not connected for this workspace" };
  }

  try {
    const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${integration.credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          email: lead.email || undefined,
          firstname: lead.firstName || undefined,
          lastname: lead.lastName || undefined,
          jobtitle: lead.jobTitle || undefined,
          company: lead.company || undefined,
        },
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      return { success: false, error: `HubSpot API error ${res.status}: ${errorBody}` };
    }

    const data = await res.json();
    return { success: true, hubspotContactId: data.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
