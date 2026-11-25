import { ObjectId } from "mongodb";
import { tool } from "ai";
import { z } from "zod";
import { dbConnect } from "@/app/lib/mongoDb";
import { serializeCampaign } from "@/app/api/campaigns/route";
import { getTimeRangeBounds, computePipelineMetrics } from "@/app/lib/dashboardAnalytics";

export function createReadTools(workspaceId) {
  const wsId = new ObjectId(workspaceId);

  return {
    getDashboardOverview: tool({
      description: "Get workspace outreach overview metrics: total leads, enrolled leads, reply rate, active campaigns, unread inbox count, and failed jobs.",
      inputSchema: z.object({
        range: z.enum(["today", "7d", "30d", "90d"]).default("7d"),
      }),
      execute: async ({ range }) => {
        const { startTime } = getTimeRangeBounds(range);
        const [leadsCol, campaignsCol, campaignLeadsCol, convosCol, jobsCol] = await Promise.all([
          dbConnect("leads"),
          dbConnect("campaigns"),
          dbConnect("campaign_leads"),
          dbConnect("conversations"),
          dbConnect("jobs"),
        ]);

        const [totalLeads, activeCampaigns, totalCampaigns, unreadInbox, recentSentJobs, failedJobs, enrolledIds, repliedIds] =
          await Promise.all([
            leadsCol.countDocuments({ workspaceId: wsId }),
            campaignsCol.countDocuments({ workspaceId: wsId, status: "active" }),
            campaignsCol.countDocuments({ workspaceId: wsId }),
            convosCol.countDocuments({ workspaceId: wsId, unreadCount: { $gt: 0 } }),
            jobsCol.countDocuments({ workspaceId: wsId, status: "completed", executedAt: { $gte: startTime } }),
            jobsCol.countDocuments({ workspaceId: wsId, status: "failed", createdAt: { $gte: startTime } }),
            campaignLeadsCol.distinct("leadId", { campaignId: { $in: await campaignsCol.distinct("_id", { workspaceId: wsId }) } }),
            campaignLeadsCol.distinct("leadId", {
              campaignId: { $in: await campaignsCol.distinct("_id", { workspaceId: wsId }) },
              status: "replied",
            }),
          ]);

        return {
          range,
          pipeline: computePipelineMetrics(totalLeads, enrolledIds.length, repliedIds.length),
          activeCampaigns,
          totalCampaigns,
          unreadInbox,
          recentSentJobs,
          failedJobs,
        };
      },
    }),

    listCampaigns: tool({
      description: "List campaigns in this workspace with status, channels, lead counts, and reply stats.",
      inputSchema: z.object({
        statusFilter: z.enum(["all", "active", "paused", "draft", "completed"]).default("all"),
      }),
      execute: async ({ statusFilter }) => {
        const campaignsCol = await dbConnect("campaigns");
        const campaignLeadsCol = await dbConnect("campaign_leads");
        const query = { workspaceId: wsId };
        if (statusFilter !== "all") query.status = statusFilter;

        const docs = await campaignsCol.find(query).sort({ createdAt: -1 }).limit(30).toArray();
        const items = await Promise.all(docs.map((d) => serializeCampaign(d, campaignLeadsCol)));
        return { total: items.length, campaigns: items };
      },
    }),

    getCampaignDetails: tool({
      description: "Inspect a campaign's sequence steps, status breakdown, and recent job queue state.",
      inputSchema: z.object({
        campaignId: z.string().describe("MongoDB ObjectId string of the campaign"),
      }),
      execute: async ({ campaignId }) => {
        if (!ObjectId.isValid(campaignId)) return { error: "Invalid campaignId" };
        const campaignsCol = await dbConnect("campaigns");
        const campaignLeadsCol = await dbConnect("campaign_leads");
        const stepsCol = await dbConnect("sequence_steps");
        const jobsCol = await dbConnect("jobs");

        const camp = await campaignsCol.findOne({ _id: new ObjectId(campaignId), workspaceId: wsId });
        if (!camp) return { error: "Campaign not found" };

        const [serialized, steps, queuedJobs, failedJobs] = await Promise.all([
          serializeCampaign(camp, campaignLeadsCol),
          stepsCol.find({ campaignId: camp._id }).sort({ order: 1 }).toArray(),
          jobsCol.countDocuments({ campaignId: camp._id, status: "queued" }),
          jobsCol.countDocuments({ campaignId: camp._id, status: "failed" }),
        ]);

        return {
          campaign: serialized,
          steps: steps.map((s) => ({
            id: s._id.toString(),
            order: s.order,
            type: s.type,
            config: s.config || {},
          })),
          queue: { queuedJobs, failedJobs },
        };
      },
    }),

    searchLeads: tool({
      description: "Search workspace leads by keyword (name, email, company, title) or tag.",
      inputSchema: z.object({
        search: z.string().optional(),
        tag: z.string().optional(),
        limit: z.number().int().min(1).max(25).default(15),
      }),
      execute: async ({ search, tag, limit }) => {
        const leadsCol = await dbConnect("leads");
        const query = { workspaceId: wsId };
        if (tag) query.tags = tag;
        if (search?.trim()) {
          const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          query.$or = [{ firstName: re }, { lastName: re }, { email: re }, { company: re }, { jobTitle: re }];
        }

        const [total, items] = await Promise.all([
          leadsCol.countDocuments(query),
          leadsCol.find(query).sort({ createdAt: -1 }).limit(limit).toArray(),
        ]);

        return {
          totalMatches: total,
          leads: items.map((l) => ({
            id: l._id.toString(),
            name: `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.email,
            email: l.email,
            company: l.company,
            jobTitle: l.jobTitle,
            tags: l.tags || [],
          })),
        };
      },
    }),

    listInboxThreads: tool({
      description: "Fetch Unified Inbox conversations (all, unread, or important) with lead details and latest messages.",
      inputSchema: z.object({
        filter: z.enum(["all", "unread", "important"]).default("unread"),
        limit: z.number().int().min(1).max(20).default(10),
      }),
      execute: async ({ filter, limit }) => {
        const convosCol = await dbConnect("conversations");
        const leadsCol = await dbConnect("leads");
        const msgsCol = await dbConnect("messages");

        const query = { workspaceId: wsId, status: { $ne: "archived" } };
        if (filter === "unread") query.unreadCount = { $gt: 0 };
        if (filter === "important") query.status = "important";

        const convos = await convosCol.find(query).sort({ lastMessageAt: -1 }).limit(limit).toArray();
        const leadIds = convos.map((c) => c.leadId).filter(Boolean);
        const leadDocs = leadIds.length ? await leadsCol.find({ _id: { $in: leadIds } }).toArray() : [];
        const leadMap = new Map(leadDocs.map((l) => [l._id.toString(), l]));

        const enriched = await Promise.all(
          convos.map(async (c) => {
            const lead = c.leadId ? leadMap.get(c.leadId.toString()) : null;
            const latest = await msgsCol.find({ conversationId: c._id }).sort({ sentAt: -1 }).limit(2).toArray();
            return {
              conversationId: c._id.toString(),
              channel: c.channel,
              subject: c.subject || null,
              unreadCount: c.unreadCount || 0,
              leadName: lead ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim() : "Unknown",
              leadEmail: lead?.email || null,
              company: lead?.company || null,
              recentMessages: latest.reverse().map((m) => ({
                direction: m.direction,
                body: (m.body || "").slice(0, 400),
                sentAt: m.sentAt,
              })),
            };
          })
        );

        return { count: enriched.length, threads: enriched };
      },
    }),

    getMailboxHealth: tool({
      description: "Check connected Email sender accounts (status, daily limits, warm-up/ramp-up) and LinkedIn status.",
      inputSchema: z.object({}),
      execute: async () => {
        const emailAccountsCol = await dbConnect("email_accounts");
        const accounts = await emailAccountsCol.find({ workspaceId: wsId }).toArray();
        return {
          emailAccounts: accounts.map((a) => ({
            id: a._id.toString(),
            email: a.email,
            provider: a.provider,
            status: a.status,
            dailyLimit: a.dailyLimit,
            sentToday: a.sentToday || 0,
            warmupEnabled: !!a.warmupEnabled,
          })),
        };
      },
    }),
  };
}
