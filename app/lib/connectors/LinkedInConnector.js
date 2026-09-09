/**
 * LinkedInConnector — the interface every LinkedIn automation provider must implement.
 *
 * DripX never talks to LinkedIn directly from application code; every action funnels
 * through one of these methods so the actual provider is a one-file swap
 * (see app/lib/connectors/index.js). Real LinkedIn browser automation requires external
 * infrastructure (a headless browser, LinkedIn session cookies, IP-rotating proxies) and
 * carries real account-ban/ToS risk — this repo ships only the safe MockLinkedInConnector.
 *
 * Every method returns { success, providerMessageId?, error? } (or an array of leads for
 * fetchProfiles) so callers never need to know which provider is behind the interface.
 */
export class LinkedInConnector {
  async sendConnectionRequest(_lead, _message) {
    throw new Error("sendConnectionRequest not implemented");
  }

  async sendMessage(_lead, _message) {
    throw new Error("sendMessage not implemented");
  }

  async sendInMail(_lead, _subject, _message) {
    throw new Error("sendInMail not implemented");
  }

  async visitProfile(_lead) {
    throw new Error("visitProfile not implemented");
  }

  async likeRecentPost(_lead) {
    throw new Error("likeRecentPost not implemented");
  }

  async followProfile(_lead) {
    throw new Error("followProfile not implemented");
  }

  // sourceType: "sales_navigator" | "recruiter_search" | "event_members" | "group_members" | "my_network"
  async fetchProfiles(_sourceType, _options) {
    throw new Error("fetchProfiles not implemented");
  }
}
