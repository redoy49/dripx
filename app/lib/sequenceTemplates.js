/**
 * Curated Sequence Templates Library for DripX.
 * Pre-built multi-channel outreach playbooks with battle-tested copywriting,
 * delay intervals, and conditional branching (Accepted vs Not Accepted).
 */
export const TEMPLATE_CATEGORIES = [
  "All",
  "Multi-Channel",
  "Cold Email",
  "LinkedIn Outreach",
  "Inbound Nurture",
  "C-Suite & VIP",
];

export const SYSTEM_SEQUENCE_TEMPLATES = [
  {
    id: "tpl_multichannel_classic",
    name: "The B2B Multi-Channel Power Playbook",
    description: "Industry-standard multichannel flow: LinkedIn invite with dual branches. If accepted, send direct messages; if not accepted, find email and launch an email drip.",
    category: "Multi-Channel",
    channels: ["linkedin", "email"],
    estimatedDays: 6,
    isSystem: true,
    badge: "Most Popular",
    steps: [
      {
        tempId: "step_1",
        type: "profile_visit",
        order: 1,
        config: {},
        delayMinutes: 0,
      },
      {
        tempId: "step_2",
        type: "connection_request",
        order: 2,
        config: {
          note: "Hi {{firstName}}, noticed your work leading the team at {{company}}. Would love to connect and share notes on outreach strategies!",
        },
        delayMinutes: 1440, // 1 day
      },
      {
        tempId: "step_3",
        type: "condition",
        order: 3,
        config: {
          label: "Has accepted or replied?",
        },
        delayMinutes: 2880, // 2 days
        branches: {
          yes: "step_accepted_msg",
          no: "step_not_accepted_email1",
        },
      },
      // --- ACCEPTED BRANCH (Green) ---
      {
        tempId: "step_accepted_msg",
        type: "message",
        order: 4,
        config: {
          template: "Thanks for connecting, {{firstName}}! Saw what you're building at {{company}} — curious if multichannel outbound is a focus for your team this quarter?",
        },
        delayMinutes: 1440, // 1 day
        next: "step_accepted_followup",
      },
      {
        tempId: "step_accepted_followup",
        type: "follow_up",
        order: 5,
        config: {
          template: "Hi {{firstName}}, following up on my previous note. We recently helped a similar team double their booked pipeline with zero spam score. Happy to send over a 2-min breakdown if interested?",
        },
        delayMinutes: 4320, // 3 days
        next: null,
      },
      // --- NOT ACCEPTED BRANCH (Coral / Email fallback) ---
      {
        tempId: "step_not_accepted_email1",
        type: "email",
        order: 6,
        config: {
          subject: "Quick question for {{company}}",
          template: "Hi {{firstName}},\n\nI tried connecting with you on LinkedIn earlier this week, but figured your inbox might be easier to reach.\n\nI noticed {{company}} is actively scaling outreach. We've built an all-in-one execution runner that manages LinkedIn and Email outreach in a single sequence.\n\nWould you be open to a 5-minute chat this Thursday?\n\nBest,\n[Your Name]",
        },
        delayMinutes: 1440, // 1 day after condition
        next: "step_not_accepted_email2",
      },
      {
        tempId: "step_not_accepted_email2",
        type: "email",
        order: 7,
        config: {
          subject: "Re: Quick question for {{company}}",
          template: "Hi {{firstName}},\n\nWanted to quickly bump this in case it got buried under other priorities.\n\nHere is how we helped another growth team automate their outbound touches across both channels: [Case Study Link].\n\nWorth a brief conversation?\n\nBest,\n[Your Name]",
        },
        delayMinutes: 4320, // 3 days
        next: null,
      },
    ],
  },
  {
    id: "tpl_csuite_vip",
    name: "C-Suite InMail & Direct Touch Playbook",
    description: "High-touch sequence tailored for VPs, Directors, and C-Suite decision makers using profile warm-up, paid InMails, and targeted executive emails.",
    category: "C-Suite & VIP",
    channels: ["linkedin", "email"],
    estimatedDays: 7,
    isSystem: true,
    badge: "Executive Tier",
    steps: [
      {
        tempId: "cs_1",
        type: "profile_visit",
        order: 1,
        config: {},
        delayMinutes: 0,
      },
      {
        tempId: "cs_2",
        type: "like_post",
        order: 2,
        config: {},
        delayMinutes: 1440, // 1 day
      },
      {
        tempId: "cs_3",
        type: "inmail",
        order: 3,
        config: {
          subject: "Partnership & strategic growth for {{company}}",
          template: "Hi {{firstName}},\n\nAdmiring your recent initiatives at {{company}}. Given your strategic role, I wanted to reach out directly regarding modernizing multichannel outbound.\n\nWe've engineered an enterprise-grade execution platform that safeguards sender health and automates outreach.\n\nWould you have 10 minutes next week for an introductory conversation?\n\nBest regards,\n[Your Name]",
        },
        delayMinutes: 1440, // 1 day
      },
      {
        tempId: "cs_4",
        type: "condition",
        order: 4,
        config: {
          label: "Has replied to InMail?",
        },
        delayMinutes: 4320, // 3 days
        branches: {
          yes: null,
          no: "cs_5_email",
        },
      },
      {
        tempId: "cs_5_email",
        type: "email",
        order: 5,
        config: {
          subject: "Following up on LinkedIn note — {{company}}",
          template: "Hi {{firstName}},\n\nReaching out here in case LinkedIn InMails get cluttered.\n\nWanted to make sure you saw my note regarding streamlining multichannel outbound for {{company}}.\n\nDo you have 5 minutes this Thursday?\n\nBest,\n[Your Name]",
        },
        delayMinutes: 1440,
        next: null,
      },
    ],
  },
  {
    id: "tpl_cold_email_power",
    name: "3-Touch Cold Email Authority Sequence",
    description: "Laser-focused 3-step cold email cadence: value proposition intro, social proof case study follow-up, and the polite closing break-up note.",
    category: "Cold Email",
    channels: ["email"],
    estimatedDays: 8,
    isSystem: true,
    badge: "High Deliverability",
    steps: [
      {
        tempId: "em_1",
        type: "email",
        order: 1,
        config: {
          subject: "Idea for {{company}}'s outbound pipeline",
          template: "Hi {{firstName}},\n\nCame across {{company}} and loved your recent traction.\n\nMost teams in your space struggle with keeping email deliverability high while maintaining active LinkedIn outreach. We solved this with unified hybrid dispatch and automated ramp-up.\n\nOpen to a brief 5-min intro?\n\nBest,\n[Your Name]",
        },
        delayMinutes: 0,
      },
      {
        tempId: "em_2",
        type: "condition",
        order: 2,
        config: {
          label: "Has replied?",
        },
        delayMinutes: 4320, // 3 days
        branches: {
          yes: null,
          no: "em_3_followup",
        },
      },
      {
        tempId: "em_3_followup",
        type: "email",
        order: 3,
        config: {
          subject: "Re: Idea for {{company}}'s outbound pipeline",
          template: "Hi {{firstName}},\n\nWanted to share a quick case study: how one B2B team booked 42 qualified calls in 30 days using DripX's multi-channel sequence engine.\n\nWould it make sense to connect for 10 minutes this week?\n\nBest,\n[Your Name]",
        },
        delayMinutes: 1440,
        next: "em_4_cond2",
      },
      {
        tempId: "em_4_cond2",
        type: "condition",
        order: 4,
        config: {
          label: "Has replied?",
        },
        delayMinutes: 5760, // 4 days
        branches: {
          yes: null,
          no: "em_5_breakup",
        },
      },
      {
        tempId: "em_5_breakup",
        type: "email",
        order: 5,
        config: {
          subject: "Permission to close your file?",
          template: "Hi {{firstName}},\n\nAssuming this isn't a top priority for {{company}} right now, so I won't follow up again.\n\nIf you ever want to explore scaling outreach without risking your sender domain, feel free to reach back out anytime.\n\nBest of luck with your growth!\n\nBest,\n[Your Name]",
        },
        delayMinutes: 1440,
        next: null,
      },
    ],
  },
  {
    id: "tpl_social_selling_warmup",
    name: "LinkedIn Social Selling & Soft Touch",
    description: "Gentle relationship-building sequence on LinkedIn: view profile ➔ like a post ➔ connect with custom note ➔ personalized welcome message.",
    category: "LinkedIn Outreach",
    channels: ["linkedin"],
    estimatedDays: 5,
    isSystem: true,
    badge: "100% LinkedIn",
    steps: [
      {
        tempId: "soc_1",
        type: "profile_visit",
        order: 1,
        config: {},
        delayMinutes: 0,
      },
      {
        tempId: "soc_2",
        type: "like_post",
        order: 2,
        config: {},
        delayMinutes: 1440, // 1 day
      },
      {
        tempId: "soc_3",
        type: "connection_request",
        order: 3,
        config: {
          note: "Hi {{firstName}}, really enjoyed your recent posts on LinkedIn! Would love to connect and keep in touch with your updates at {{company}}.",
        },
        delayMinutes: 1440, // 1 day
      },
      {
        tempId: "soc_4",
        type: "condition",
        order: 4,
        config: {
          label: "Has accepted invite?",
        },
        delayMinutes: 2880, // 2 days
        branches: {
          yes: "soc_5_message",
          no: null,
        },
      },
      {
        tempId: "soc_5_message",
        type: "message",
        order: 5,
        config: {
          template: "Thanks for connecting, {{firstName}}! Always great to link up with fellow leaders in the space. What's the biggest initiative {{company}} is tackling this month?",
        },
        delayMinutes: 1440,
        next: null,
      },
    ],
  },
  {
    id: "tpl_inbound_lead_nurture",
    name: "Rapid Inbound Lead Multi-Touch Nurture",
    description: "Fast-response sequence for inbound demo requests or website signups: immediate email confirmation ➔ LinkedIn invite ➔ video demo follow-up.",
    category: "Inbound Nurture",
    channels: ["email", "linkedin"],
    estimatedDays: 4,
    isSystem: true,
    badge: "Fast Conversion",
    steps: [
      {
        tempId: "inb_1",
        type: "email",
        order: 1,
        config: {
          subject: "Welcome to DripX — here's your onboarding guide",
          template: "Hi {{firstName}},\n\nThanks for reaching out about {{company}}! I wanted to personally welcome you.\n\nHere's a 3-minute video showing how our sequence runner works: [Demo Link].\n\nWhen would be a good time for a 15-minute onboarding walkthrough?\n\nBest,\n[Your Name]",
        },
        delayMinutes: 0,
      },
      {
        tempId: "inb_2",
        type: "connection_request",
        order: 2,
        config: {
          note: "Hi {{firstName}}, welcomed you on email earlier — wanted to connect here as well to make it easy to reach me!",
        },
        delayMinutes: 1440, // 1 day
      },
      {
        tempId: "inb_3",
        type: "condition",
        order: 3,
        config: {
          label: "Has replied or scheduled?",
        },
        delayMinutes: 2880, // 2 days
        branches: {
          yes: null,
          no: "inb_4_email2",
        },
      },
      {
        tempId: "inb_4_email2",
        type: "email",
        order: 4,
        config: {
          subject: "Any questions on your setup for {{company}}?",
          template: "Hi {{firstName}},\n\nChecking in to see if you had any questions getting started.\n\nI can set up a custom campaign simulation for {{company}} whenever you're ready.\n\nGrab a time here: [Calendar Link].\n\nBest,\n[Your Name]",
        },
        delayMinutes: 1440,
        next: null,
      },
    ],
  },
];

/**
 * Clones template steps and generates fresh, unique clientIds,
 * remapping condition branches (`yes`, `no`) and explicit `next` targets.
 */
export function instantiateTemplateSteps(template) {
  if (!template || !Array.isArray(template.steps)) return [];

  const idMap = new Map();
  // 1. Assign fresh clientIds to each step
  template.steps.forEach((step, idx) => {
    const key = step.tempId || step.clientId || `step_${idx + 1}`;
    idMap.set(key, `step_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`);
  });

  // 2. Clone and remap branches and next pointers
  return template.steps.map((step, index) => {
    const originalKey = step.tempId || step.clientId || `step_${index + 1}`;
    const newClientId = idMap.get(originalKey);

    let remappedBranches = null;
    if (step.type === "condition" && step.branches) {
      remappedBranches = {
        yes: step.branches.yes ? idMap.get(step.branches.yes) || null : null,
        no: step.branches.no ? idMap.get(step.branches.no) || null : null,
      };
    }

    let remappedNext = null;
    if (step.next) {
      remappedNext = idMap.get(step.next) || null;
    }

    return {
      clientId: newClientId,
      type: step.type,
      order: index,
      config: { ...(step.config || {}) },
      delayMinutes: step.delayMinutes || 0,
      branches: remappedBranches,
      next: remappedNext,
      position: null, // Let autoLayout compute beautiful positions
    };
  });
}

/**
 * Extracts a high-level summary of steps and channels for UI cards.
 */
export function templateToStepsSummary(template) {
  const steps = template?.steps || [];
  const actionCount = steps.filter((s) => s.type !== "condition" && s.type !== "delay").length;
  const conditionCount = steps.filter((s) => s.type === "condition").length;
  const channels = new Set();

  steps.forEach((s) => {
    if (["connection_request", "message", "follow_up", "profile_visit", "like_post", "inmail"].includes(s.type)) {
      channels.add("linkedin");
    }
    if (s.type === "email") {
      channels.add("email");
    }
  });

  return {
    totalSteps: steps.length,
    actionCount,
    conditionCount,
    channels: Array.from(channels),
    estimatedDays: template.estimatedDays || 5,
  };
}
