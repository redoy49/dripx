"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  MessageSquare,
  Users,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "1-2",
    topic: "demo",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    // Simulate genuine client inquiry submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs mb-4">
          <Sparkles size={13} className="text-indigo-500" />
          <span>Get in Touch</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto">
          Talk with Our Outbound Architecture Specialists
        </h1>

        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
          Whether you need a tailored enterprise demo, multi-mailbox consultation, or custom API access, we&apos;re here to help.
        </p>
      </section>

      {/* Main Grid: Info Left, Form Right */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
          {/* Left Column: Direct Channels & Status */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live System Health Pill */}
            <div className="p-5 rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Platform Status
                </span>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium inline-flex items-center gap-2 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>All Systems Operational</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Cloud micro-workers and residential proxy clusters are running at 99.98% uptime.
              </p>
            </div>

            {/* Direct Contact Inboxes */}
            <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs space-y-5">
              <h3 className="text-base font-bold text-gray-900">Direct Inboxes</h3>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Users size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Sales & Enterprise Demos</p>
                    <a
                      href="mailto:sales@dripx.io"
                      className="text-indigo-600 hover:underline font-mono text-xs"
                    >
                      sales@dripx.io
                    </a>
                    <p className="text-gray-500 text-[11px] mt-0.5">Average response: &lt; 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Customer Support & Success</p>
                    <a
                      href="mailto:support@dripx.io"
                      className="text-indigo-600 hover:underline font-mono text-xs"
                    >
                      support@dripx.io
                    </a>
                    <p className="text-gray-500 text-[11px] mt-0.5">Average response: &lt; 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail size={15} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Partnerships & Integrations</p>
                    <a
                      href="mailto:partners@dripx.io"
                      className="text-indigo-600 hover:underline font-mono text-xs"
                    >
                      partners@dripx.io
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs space-y-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />
                Global Offices
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">San Francisco:</strong> 548 Market St, Suite 82001, San Francisco, CA 94104
                </p>
                <p>
                  <strong className="text-gray-900">London:</strong> 100 Bishopsgate, London EC2N 4AG, United Kingdom
                </p>
              </div>
            </div>

            {/* What to Expect */}
            <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 shadow-2xs text-xs text-gray-700 space-y-2">
              <p className="font-bold text-indigo-900">What happens on your demo call?</p>
              <ul className="space-y-1 list-disc list-inside text-gray-600 text-[11px]">
                <li>15-minute live walkthrough of cloud sequence engine</li>
                <li>Audit of your current domain setup and DNS records</li>
                <li>Custom volume and residential IP proxy strategy</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-7 sm:p-9 shadow-sm">
              {submitted ? (
                <div className="text-center py-12 animate-in fade-in duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Inquiry Received!</h3>
                  <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                    Thanks for reaching out, {form.name}. Our outbound architecture specialist will review your request and get back to you at {form.email} shortly.
                  </p>
                  <div className="mt-8 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({
                          name: "",
                          email: "",
                          company: "",
                          teamSize: "1-2",
                          topic: "demo",
                          message: "",
                        });
                      }}
                      className="px-5 py-2.5 rounded-full border border-gray-200/90 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
                    >
                      Send Another Message
                    </button>
                    <Link
                      href="/"
                      className="px-5 py-2.5 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white text-sm font-bold shadow-sm transition cursor-pointer"
                    >
                      Return Home
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-2xl font-bold text-gray-900">Send an Inquiry</h2>
                  <p className="text-xs text-gray-500">
                    Fill out the form below and an outbound specialist will contact you within 2 business hours.
                  </p>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                      {errorMessage}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Sarah Connor"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1">
                        Work Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="sarah@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="company" className="block text-xs font-bold text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Acme Corp"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label htmlFor="teamSize" className="block text-xs font-bold text-gray-700 mb-1">
                        Outbound Team Size
                      </label>
                      <select
                        id="teamSize"
                        name="teamSize"
                        value={form.teamSize}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-2xs bg-white"
                      >
                        <option value="1-2">1–2 Senders (Solo / Early Stage)</option>
                        <option value="3-5">3–5 Senders (Growth Team)</option>
                        <option value="6-10">6–10 Senders (Scaling Org)</option>
                        <option value="10+">10+ Senders (Enterprise / Agency)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="topic" className="block text-xs font-bold text-gray-700 mb-1">
                      Inquiry Topic
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      value={form.topic}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-2xs bg-white"
                    >
                      <option value="demo">Request Custom Product Demo</option>
                      <option value="enterprise">Enterprise Plan & High-Volume Senders</option>
                      <option value="technical">Technical & Proxy Architecture Question</option>
                      <option value="partnership">Agency & Integration Partnership</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-bold text-gray-700 mb-1">
                      How Can We Help? <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your current outbound workflow, sender volume, or questions..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200/90 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-2xs"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold text-sm shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span>Transmitting Inquiry...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <ArrowRight size={15} className="stroke-[2.5]" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center">
                    By submitting this form, you agree to our{" "}
                    <Link href="/privacy" className="underline hover:text-gray-600">
                      Privacy Policy
                    </Link>{" "}
                    and processing of your contact details.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
