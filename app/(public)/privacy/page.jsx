import Link from "next/link";
import { Shield, Lock, FileText, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DripX Cloud Outbound",
  description:
    "Learn how DripX protects your data, session tokens, prospect lists, and personal information with enterprise encryption and GDPR compliance.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center pb-12 border-b border-gray-200/90">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/80 shadow-2xs mb-4">
            <Lock size={12} className="text-indigo-500" />
            <span>Legal Documentation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Privacy Policy
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-gray-500">
            Last Updated: November 22, 2026 · Effective Date: November 22, 2026
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>We never sell your prospect data or personal information. Your data remains strictly yours.</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-12 space-y-12 text-gray-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section id="introduction">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. Introduction & Scope
            </h2>
            <p>
              DripX Inc. (&quot;DripX&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) provides a cloud-native multi-channel outbound sequencing and inbox platform. This Privacy Policy describes how we collect, use, store, and safeguard your personal information and any prospect data you upload when using our websites, cloud micro-containers, and software services (&quot;Service&quot;).
            </p>
            <p className="mt-3">
              By registering for an account or using DripX, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </section>

          {/* Section 2 */}
          <section id="data-collected">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Information We Collect
            </h2>
            <p>We collect information in the following categories:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong>Account Information:</strong> Name, work email address, company name, billing address, and authentication credentials when creating an account.
              </li>
              <li>
                <strong>Sender Credentials & Session Tokens:</strong> OAuth tokens and encrypted session identifiers required to execute automated cloud sequences on your behalf. All credentials are encrypted using AES-256 before storage.
              </li>
              <li>
                <strong>Customer Prospect Data:</strong> Contact lists, names, LinkedIn profile URLs, email addresses, and custom attributes imported via CSV or CRM synchronization.
              </li>
              <li>
                <strong>Usage & Technical Telemetry:</strong> Anonymized log data including IP addresses, browser user-agent signatures, sequence execution status, error events, and delivery timestamps.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="how-we-use">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use your data solely for the following business purposes:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Executing your automated outbound drip sequences across LinkedIn and cold email mailboxes.</li>
              <li>Assigning dedicated static residential IP proxies and enforcing safety limits and humanized delays.</li>
              <li>Consolidating incoming replies within your Unified Team Inbox and locking threads to prevent collisions.</li>
              <li>Providing technical customer support, debugging campaign errors, and issuing billing statements.</li>
              <li>Maintaining system security, preventing abuse, and ensuring platform reliability.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="data-security">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Data Storage, Encryption & Security Architecture
            </h2>
            <p>
              We treat the security of your data and your sender accounts with highest engineering rigor:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong>Encryption at Rest:</strong> All database stores, lead tables, and tokens are encrypted using industry-standard AES-256 encryption.
              </li>
              <li>
                <strong>Encryption in Transit:</strong> All communication between your client browser, our cloud containers, and third-party APIs is encrypted via TLS 1.3.
              </li>
              <li>
                <strong>Container Isolation:</strong> Each customer workspace and connected account runs inside an isolated micro-container environment with dedicated proxy routing.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="subprocessors">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Third-Party Integrations & Subprocessors
            </h2>
            <p>
              To deliver our cloud services, DripX works with trusted infrastructure subprocessors:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <strong>Cloud Hosting & Compute:</strong> Amazon Web Services (AWS) and Vercel for serverless micro-worker execution.
              </li>
              <li>
                <strong>Payment Processing:</strong> Stripe Inc. (we never store raw credit card numbers on our servers).
              </li>
              <li>
                <strong>Email Delivery:</strong> Resend, Google Workspace API, and Microsoft Graph API solely for dispatching authorized email steps.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section id="retention-erasure">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Data Retention & Right to Erasure
            </h2>
            <p>
              We retain your campaign records, leads, and inbox threads only for as long as your workspace maintains an active subscription. Upon workspace cancellation or account deletion:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>All uploaded prospect data is marked for permanent deletion.</li>
              <li>All sender session tokens and authentication cookies are immediately revoked and destroyed.</li>
              <li>You may request complete immediate data purge at any time by emailing <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">privacy@dripx.io</code>.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="gdpr">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. GDPR & International Data Subject Rights
            </h2>
            <p>
              If you reside in the European Economic Area (EEA), the United Kingdom, or Switzerland, you have rights under the General Data Protection Regulation (GDPR), including:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>The right to access and receive a portable copy of your data.</li>
              <li>The right to rectify inaccurate or incomplete records.</li>
              <li>The right to object to or restrict processing of your personal information.</li>
              <li>The right to immediate erasure (&quot;Right to be Forgotten&quot;).</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="cookies">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              8. Cookies & Tracking Technologies
            </h2>
            <p>
              DripX uses only strictly necessary authentication cookies to maintain your login session and security tokens. We do not sell user data to advertising networks or embed third-party behavioral trackers.
            </p>
          </section>

          {/* Section 9 */}
          <section id="contact-dpo">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. Contact Details & Data Protection Officer
            </h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or wish to exercise your data subject rights, please contact our Data Protection Officer:
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-200/90 text-xs sm:text-sm font-mono space-y-1">
              <p className="font-bold text-gray-900">DripX Inc. — Data Privacy Office</p>
              <p>Email: privacy@dripx.io</p>
              <p>Address: 548 Market St, Suite 82001, San Francisco, CA 94104</p>
            </div>
          </section>
        </div>

        {/* Back Link */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
          >
            ← Return to Home
          </Link>
          <Link
            href="/terms"
            className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            View Terms of Service →
          </Link>
        </div>
      </div>
    </div>
  );
}
