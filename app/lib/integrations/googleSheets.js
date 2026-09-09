import { google } from "googleapis";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

export async function getGoogleSheetsIntegration(workspaceId) {
  const integrations = await dbConnect("integrations");
  return integrations.findOne({ workspaceId: new ObjectId(workspaceId), type: "google_sheets" });
}

// Appends lead rows to the workspace's configured spreadsheet using a service account.
// Inert (returns a clear "not configured" result, never throws) unless both
// GOOGLE_SERVICE_ACCOUNT_KEY is set AND the workspace has a spreadsheetId configured.
export async function exportLeadsToGoogleSheet(workspaceId, leads) {
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const integration = await getGoogleSheetsIntegration(workspaceId);
  const spreadsheetId = integration?.config?.spreadsheetId;

  if (!rawKey) {
    return { success: false, skipped: true, message: "GOOGLE_SERVICE_ACCOUNT_KEY is not configured" };
  }
  if (!spreadsheetId) {
    return { success: false, skipped: true, message: "No spreadsheet configured for this workspace" };
  }

  try {
    const credentials = JSON.parse(rawKey);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    const values = leads.map((lead) => [
      lead.firstName,
      lead.lastName,
      lead.company,
      lead.jobTitle,
      lead.email,
      lead.linkedinUrl,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });

    return { success: true, exported: values.length };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
