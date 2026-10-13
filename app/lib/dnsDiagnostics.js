import dns from "node:dns/promises";

/**
 * Resolves and evaluates DNS deliverability records (SPF, DKIM, DMARC, MX)
 * for a sender email domain.
 */

const DNS_TIMEOUT_MS = 3500;

async function resolveWithTimeout(fn, fallbackValue = null) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallbackValue), DNS_TIMEOUT_MS);
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch {
    clearTimeout(timer);
    return fallbackValue;
  }
}

/**
 * Extracts the root/apex domain from an email address or host.
 */
export function extractDomainFromEmail(email) {
  if (!email || typeof email !== "string") return "";
  const parts = email.trim().split("@");
  return (parts.length > 1 ? parts[1] : parts[0]).toLowerCase();
}

/**
 * Evaluates SPF records for a domain.
 */
export async function checkSpf(domain) {
  try {
    const txtRecords = await resolveWithTimeout(() => dns.resolveTxt(domain), []);
    const flatRecords = (txtRecords || []).map((chunks) => chunks.join(""));
    const spfRecords = flatRecords.filter((txt) => txt.toLowerCase().startsWith("v=spf1"));

    if (spfRecords.length === 0) {
      return {
        status: "missing",
        score: 0,
        record: null,
        message: "No SPF record found. Outreach emails will likely be flagged as spam.",
        recommendation: "Add a TXT record for SPF: v=spf1 include:_spf.google.com ~all (or your mail provider's SPF)",
      };
    }

    if (spfRecords.length > 1) {
      return {
        status: "invalid",
        score: 10,
        record: spfRecords.join(" | "),
        message: "Multiple SPF records detected. RFC 7208 strictly forbids having more than one SPF TXT record.",
        recommendation: "Merge all SPF mechanisms into a single TXT record.",
      };
    }

    const raw = spfRecords[0];
    const lower = raw.toLowerCase();

    if (lower.includes("+all")) {
      return {
        status: "warning",
        score: 15,
        record: raw,
        message: "SPF record uses '+all', which permits anyone on the internet to spoof your domain.",
        recommendation: "Change '+all' to '~all' (softfail) or '-all' (hardfail).",
      };
    }

    const isHardFail = lower.includes("-all");
    const isSoftFail = lower.includes("~all");
    const isNeutral = lower.includes("?all");

    return {
      status: isNeutral ? "warning" : "valid",
      score: isHardFail ? 30 : isSoftFail ? 28 : 20,
      record: raw,
      message: isHardFail
        ? "Optimal strict SPF record with hardfail (-all)."
        : isSoftFail
          ? "Standard recommended SPF record with softfail (~all)."
          : "SPF record configured with neutral policy (?all).",
      recommendation: null,
    };
  } catch (error) {
    return {
      status: "error",
      score: 0,
      record: null,
      message: `Failed to query SPF records: ${error.message || "DNS lookup error"}`,
      recommendation: "Verify your domain DNS settings and connectivity.",
    };
  }
}

/**
 * Evaluates DKIM record for a domain given a selector.
 * If selector is omitted, checks known common provider selectors.
 */
export async function checkDkim(domain, preferredSelector = null, provider = "generic") {
  const commonSelectors = preferredSelector
    ? [preferredSelector]
    : provider === "google"
      ? ["google", "default"]
      : provider === "microsoft"
        ? ["selector1", "s1", "selector2"]
        : ["default", "google", "selector1", "k1", "smtp", "mail"];

  for (const selector of commonSelectors) {
    try {
      const dkimHost = `${selector}._domainkey.${domain}`;
      const txtRecords = await resolveWithTimeout(() => dns.resolveTxt(dkimHost), null);

      if (txtRecords && txtRecords.length > 0) {
        const raw = txtRecords.map((c) => c.join("")).join("");
        const hasKey = raw.includes("p=") || raw.toLowerCase().includes("v=dkim1");

        if (hasKey) {
          return {
            status: "valid",
            score: 25,
            selector,
            record: raw,
            message: `DKIM is properly configured and verified using selector '${selector}'.`,
            recommendation: null,
          };
        }
      }
    } catch {
      // Continue to next selector
    }
  }

  return {
    status: "missing",
    score: 0,
    selector: preferredSelector || commonSelectors[0],
    record: null,
    message: `DKIM record not found on checked selectors (${commonSelectors.join(", ")}).`,
    recommendation: `Publish your public DKIM key at '${preferredSelector || commonSelectors[0]}._domainkey.${domain}'.`,
  };
}

/**
 * Evaluates DMARC policy for a domain.
 */
export async function checkDmarc(domain) {
  try {
    const dmarcHost = `_dmarc.${domain}`;
    const txtRecords = await resolveWithTimeout(() => dns.resolveTxt(dmarcHost), []);
    const flatRecords = (txtRecords || []).map((chunks) => chunks.join(""));
    const dmarcRecords = flatRecords.filter((txt) => txt.toLowerCase().startsWith("v=dmarc1"));

    if (dmarcRecords.length === 0) {
      return {
        status: "missing",
        score: 0,
        record: null,
        policy: null,
        message: "No DMARC record found. Major providers (Google & Yahoo) require DMARC for inbox placement.",
        recommendation: `Add a TXT record at '_dmarc.${domain}': v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@${domain}`,
      };
    }

    const raw = dmarcRecords[0];
    const match = raw.match(/p=([a-zA-Z]+)/i);
    const policy = match ? match[1].toLowerCase() : "none";

    let score = 15;
    let message = "DMARC record found with monitoring policy (p=none).";
    if (policy === "quarantine") {
      score = 23;
      message = "Strict DMARC policy (p=quarantine) protects your domain from spoofing.";
    } else if (policy === "reject") {
      score = 25;
      message = "Maximum enforcement DMARC policy (p=reject). Optimal deliverability protection.";
    }

    return {
      status: policy === "none" ? "warning" : "valid",
      score,
      record: raw,
      policy,
      message,
      recommendation: policy === "none" ? "Upgrade policy to 'p=quarantine' or 'p=reject' once warmup is established." : null,
    };
  } catch (error) {
    return {
      status: "error",
      score: 0,
      record: null,
      policy: null,
      message: `Failed to query DMARC record: ${error.message || "DNS lookup error"}`,
      recommendation: "Ensure DNS nameservers are reachable.",
    };
  }
}

/**
 * Evaluates MX records for a domain.
 */
export async function checkMx(domain) {
  try {
    const mxRecords = await resolveWithTimeout(() => dns.resolveMx(domain), []);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        status: "missing",
        score: 0,
        records: [],
        message: "No MX records found. Your domain cannot receive reply emails or deliverability bounces.",
        recommendation: "Configure MX records pointing to your email service provider.",
      };
    }

    // Sort by priority
    const sorted = [...mxRecords].sort((a, b) => a.priority - b.priority);

    return {
      status: "valid",
      score: 20,
      records: sorted.map((r) => `${r.priority} ${r.exchange}`),
      message: `Found ${sorted.length} active MX mail exchange servers.`,
      recommendation: null,
    };
  } catch (error) {
    return {
      status: "error",
      score: 0,
      records: [],
      message: `Failed to query MX records: ${error.message || "DNS lookup error"}`,
      recommendation: "Verify domain DNS resolution.",
    };
  }
}

/**
 * Comprehensive DNS Diagnostics Suite for an Email Account.
 */
export async function runDnsDiagnostics({ email, domain: customDomain, provider = "generic", selector = null }) {
  const domain = customDomain || extractDomainFromEmail(email);

  if (!domain) {
    return {
      domain: "",
      score: 0,
      rating: "critical",
      evaluatedAt: new Date(),
      error: "Invalid or empty domain",
      spf: { status: "missing", score: 0 },
      dkim: { status: "missing", score: 0 },
      dmarc: { status: "missing", score: 0 },
      mx: { status: "missing", score: 0 },
    };
  }

  const [spf, dkim, dmarc, mx] = await Promise.all([
    checkSpf(domain),
    checkDkim(domain, selector, provider),
    checkDmarc(domain),
    checkMx(domain),
  ]);

  const totalScore = Math.min(100, Math.round(spf.score + dkim.score + dmarc.score + mx.score));

  let rating = "critical";
  if (totalScore >= 90) rating = "optimal";
  else if (totalScore >= 70) rating = "good";
  else if (totalScore >= 50) rating = "warning";

  return {
    domain,
    score: totalScore,
    rating,
    evaluatedAt: new Date(),
    spf,
    dkim,
    dmarc,
    mx,
    remediationGuides: generateRemediationSnippets(domain, provider),
  };
}

/**
 * Generates copy-paste ready DNS configuration snippets tailored to provider.
 */
export function generateRemediationSnippets(domain, provider = "generic") {
  const isGoogle = provider === "google";
  const isMicrosoft = provider === "microsoft";

  return [
    {
      type: "TXT",
      name: "@ (or root)",
      purpose: "SPF (Sender Policy Framework)",
      value: isGoogle
        ? "v=spf1 include:_spf.google.com ~all"
        : isMicrosoft
          ? "v=spf1 include:spf.protection.outlook.com ~all"
          : "v=spf1 include:mailgun.org include:_spf.google.com ~all",
    },
    {
      type: "TXT",
      name: "_dmarc",
      purpose: "DMARC (Domain-based Message Authentication)",
      value: `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc-reports@${domain}`,
    },
    {
      type: isMicrosoft ? "CNAME" : "TXT",
      name: isGoogle ? "google._domainkey" : isMicrosoft ? "selector1._domainkey" : "default._domainkey",
      purpose: "DKIM (DomainKeys Identified Mail)",
      value: isGoogle
        ? "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCg..."
        : isMicrosoft
          ? `selector1-${domain.replace(/\./g, "-")}._domainkey.onmicrosoft.com`
          : "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE",
    },
    {
      type: "MX",
      name: "@ (or root)",
      purpose: "MX (Mail Exchange Routing)",
      value: isGoogle
        ? "1 aspmx.l.google.com (Priority: 1)"
        : isMicrosoft
          ? `0 ${domain.replace(/\./g, "-")}.mail.protection.outlook.com (Priority: 0)`
          : "10 mail.yourdomain.com (Priority: 10)",
    },
  ];
}
