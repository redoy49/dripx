import Link from "next/link";
import { FileText, Shield, Scale, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Terms of Service | DripX Cloud Outbound",
  description:
    "Review the terms governing your use of the DripX cloud outreach platform, acceptable use policies, subscription terms, and intellectual property ownership.",
};

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center pb-12 border-b border-gray-200/90">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/80 shadow-2xs mb-4">
            <Scale size={12} className="text-indigo-500" />
            <span>Master Services Agreement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
            Terms of Service
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-gray-500">
            Last Updated: November 22, 2026 · Effective Date: November 22, 2026
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold shadow-2xs">
            <Shield size={14} className="text-indigo-600" />
            <span>Fair, transparent terms designed for legitimate B2B outbound revenue teams.</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-12 space-y-12 text-gray-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section id="acceptance">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service (&quot;Terms&quot;) constitute a binding legal agreement between you (&quot;Customer&quot;, &quot;you&quot;, or &quot;your&quot;) and DripX Inc. (&quot;DripX&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating an account, accessing, or using our cloud sequence platform, APIs, or website (collectively, the &quot;Service&quot;), you agree to be bound by these Terms.
            </p>
            <p className="mt-3">
              If you are agreeing to these Terms on behalf of an organization or legal entity, you represent and warrant that you have full legal authority to bind that entity to these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section id="account-eligibility">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              2. Account Eligibility & Security
            </h2>
            <p>
              To access the Service, you must be at least 18 years of age and capable of forming a binding contract. You are responsible for safeguarding your login credentials, API keys, and session cookies. You must immediately notify DripX of any unauthorized access to or compromise of your account.
            </p>
          </section>

          {/* Section 3 */}
          <section id="acceptable-use">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              3. Permitted Use & Acceptable Outreach Policy
            </h2>
            <p>
              DripX is built strictly for legitimate B2B networking, professional prospecting, and personalized sales communication. You expressly agree that you will NOT use the Service to:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Send deceptive, fraudulent, illegal, or harassing messages.</li>
              <li>Execute indiscriminate, untargeted spam blasting or harvest non-public personal data in violation of privacy laws.</li>
              <li>Circumvent or tamper with DripX safety rate limits, randomized jitter throttles, or circuit-breaker safeguards.</li>
              <li>Attempt to reverse-engineer, decompile, or copy the cloud orchestration architecture or proxy routing mechanisms.</li>
            </ul>
            <p className="mt-3">
              DripX reserves the right to immediately suspend or terminate any account found in violation of this Acceptable Outreach Policy without prior notice or refund.
            </p>
          </section>

          {/* Section 4 */}
          <section id="subscriptions-billing">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              4. Subscription, Billing & Cancellation
            </h2>
            <p>
              <strong>14-Day Free Trial:</strong> We offer a 14-day free trial on selected tiers. No credit card is required to initiate a trial. At the end of the trial period, access will automatically pause unless an active payment method is provided.
            </p>
            <p className="mt-3">
              <strong>Billing Cycles & Renewals:</strong> Subscriptions are billed in advance on either a monthly or annual basis. Annual subscriptions receive an automatic 20% discount. Subscriptions automatically renew at the end of each billing cycle unless cancelled prior to renewal.
            </p>
            <p className="mt-3">
              <strong>Cancellation:</strong> You may cancel your subscription at any time directly through your workspace billing settings. Upon cancellation, your account will remain active through the conclusion of your current paid billing period.
            </p>
          </section>

          {/* Section 5 */}
          <section id="ip-ownership">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              5. Intellectual Property & Customer Data Ownership
            </h2>
            <p>
              <strong>Customer Data Ownership:</strong> You retain 100% exclusive ownership of all prospect lists, copy templates, lead contact details, and campaign assets uploaded to or created within your workspace. DripX claims no proprietary interest in your data.
            </p>
            <p className="mt-3">
              <strong>Platform Intellectual Property:</strong> DripX retains all rights, title, and interest in and to the Service, including software, algorithms, cloud sequence infrastructure, UI designs, and documentation.
            </p>
          </section>

          {/* Section 6 */}
          <section id="liability">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              6. Limitation of Liability
            </h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL DRIPX, ITS OFFICERS, DIRECTORS, OR EMPLOYEES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR BUSINESS REPUTATION.
            </p>
            <p className="mt-3">
              IN NO EVENT SHALL DRIPX&apos;S AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS EXCEED THE TOTAL AMOUNT PAID BY CUSTOMER TO DRIPX IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          {/* Section 7 */}
          <section id="uptime-sla">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              7. Service Uptime & Cloud SLA
            </h2>
            <p>
              DripX strives to maintain a target 99.9% uptime SLA for its cloud micro-workers and residential proxy gateways. Scheduled maintenance windows will be communicated via email or dashboard notification at least 24 hours in advance whenever feasible.
            </p>
          </section>

          {/* Section 8 */}
          <section id="termination">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              8. Termination
            </h2>
            <p>
              Either party may terminate these Terms at any time upon written notice. Upon termination, your right to use the Service immediately ceases, and your stored data will be handled in accordance with our Privacy Policy and data retention commitments.
            </p>
          </section>

          {/* Section 9 */}
          <section id="governing-law">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              9. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. Any dispute arising out of or related to these Terms shall be resolved exclusively through binding arbitration in Wilmington, Delaware.
            </p>
          </section>

          {/* Section 10 */}
          <section id="legal-contact">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              10. Contact & Legal Notices
            </h2>
            <p>
              For legal notices, terms inquiries, or contract questions, please contact our legal counsel:
            </p>
            <div className="mt-4 p-5 rounded-2xl bg-gray-50 border border-gray-200/90 text-xs sm:text-sm font-mono space-y-1">
              <p className="font-bold text-gray-900">DripX Inc. — Legal Affairs</p>
              <p>Email: legal@dripx.io</p>
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
            href="/privacy"
            className="text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
          >
            View Privacy Policy →
          </Link>
        </div>
      </div>
    </div>
  );
}
