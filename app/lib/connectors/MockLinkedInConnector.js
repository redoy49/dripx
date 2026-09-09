import { LinkedInConnector } from "@/app/lib/connectors/LinkedInConnector";

const FIRST_NAMES = [
  "Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Avery",
  "Cameron", "Drew", "Elliot", "Sam", "Reese", "Quinn", "Harper", "Rowan",
];
const LAST_NAMES = [
  "Bennett", "Carter", "Diaz", "Ellis", "Foster", "Grant", "Hayes", "Irwin",
  "Jensen", "Kim", "Lopez", "Mitchell", "Nguyen", "Ortiz", "Parker", "Reyes",
];
const COMPANIES = [
  "Acme Corp", "Northwind Traders", "Globex", "Initech", "Umbrella Group",
  "Stark Industries", "Wayne Enterprises", "Hooli", "Soylent Co", "Vandelay Industries",
];
const TITLES = [
  "VP of Sales", "Marketing Director", "Head of Growth", "Founder & CEO",
  "Product Manager", "Talent Acquisition Lead", "Business Development Manager",
  "Chief Revenue Officer",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function simulatedDelay(min = 150, max = 600) {
  const ms = Math.floor(Math.random() * (max - min)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe default LinkedInConnector: simulates every action, logs it, and never touches
 * real LinkedIn. Randomly fails ~2% of actions to emulate real-world flakiness. Swap
 * app/lib/connectors/index.js's factory to a real provider (e.g. Unipile) when ready to
 * go live — every call site is written against this same interface, so nothing else changes.
 */
export class MockLinkedInConnector extends LinkedInConnector {
  async #simulate(actionLabel, lead) {
    await simulatedDelay();
    const failed = Math.random() < 0.02;

    console.log(
      `[MockLinkedInConnector] ${actionLabel} -> ${lead?.firstName || "lead"} ${
        lead?.lastName || ""
      } ${failed ? "(simulated failure)" : "(ok)"}`,
    );

    if (failed) {
      return { success: false, error: "Simulated provider error" };
    }

    return { success: true, providerMessageId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
  }

  async sendConnectionRequest(lead, message) {
    return this.#simulate(`connection request${message ? " (with note)" : ""}`, lead);
  }

  async sendMessage(lead, _message) {
    return this.#simulate("message", lead);
  }

  async sendInMail(lead, _subject, _message) {
    return this.#simulate("InMail", lead);
  }

  async visitProfile(lead) {
    return this.#simulate("profile visit", lead);
  }

  async likeRecentPost(lead) {
    return this.#simulate("like recent post", lead);
  }

  async followProfile(lead) {
    return this.#simulate("follow", lead);
  }

  async fetchProfiles(sourceType, options = {}) {
    await simulatedDelay(300, 900);
    const limit = Math.min(50, Math.max(1, options.limit || 10));

    const profiles = Array.from({ length: limit }, () => {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const slug = `${firstName}-${lastName}-${Math.random().toString(36).slice(2, 7)}`.toLowerCase();

      return {
        firstName,
        lastName,
        company: pick(COMPANIES),
        jobTitle: pick(TITLES),
        headline: `${pick(TITLES)} at ${pick(COMPANIES)}`,
        linkedinUrl: `https://www.linkedin.com/in/${slug}`,
        email: "",
        source: sourceType,
      };
    });

    console.log(
      `[MockLinkedInConnector] fetchProfiles(${sourceType}) -> ${profiles.length} simulated profiles`,
    );

    return profiles;
  }
}
