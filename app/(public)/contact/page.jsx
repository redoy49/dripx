"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, Users, CheckCircle2, ArrowRight } from "lucide-react";
import PublicHeroBanner from "@/app/components/public/PublicHeroBanner";

const TOPICS = [
  { id: "demo", label: "Product Walkthrough" },
  { id: "enterprise", label: "Enterprise & Agencies" },
  { id: "deliverability", label: "Deliverability Audit" },
  { id: "support", label: "Technical Support" },
];

const CHANNELS = [
  { icon: Users, title: "Sales & Enterprise", email: "sales@dripx.io", sla: "Response under 2 hours", accent: "text-indigo-600" },
  { icon: MessageSquare, title: "Customer Support", email: "support@dripx.io", sla: "Response under 4 hours", accent: "text-emerald-600" },
  { icon: Mail, title: "Partnerships", email: "partners@dripx.io", sla: "Integrations & agencies", accent: "text-amber-600" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", teamSize: "1-5", topic: "demo", message: "" });
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
      setErrorMessage("Please fill out your name, email, and message.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 350);
  };

  return (
    <div className="bg-white text-slate-900 overflow-x-clip">
      <PublicHeroBanner
        variant="contact"
        title="Talk with our outbound architecture team"
        description="Book a tailored walkthrough, consult on multi-mailbox deliverability, or scope custom agency capacity."
      />

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-ring-card flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Cloud Infrastructure</p>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">99.98% Uptime</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                All Systems Operational
              </span>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-ring-card space-y-5">
              <h2 className="text-base font-semibold text-slate-900">Direct channels</h2>
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div key={ch.email} className="flex items-start gap-3">
                    <Icon size={16} className={`${ch.accent} mt-0.5 shrink-0`} />
                    <div className="text-sm">
                      <p className="font-semibold text-slate-900">{ch.title}</p>
                      <a href={`mailto:${ch.email}`} className="text-indigo-600 hover:underline font-mono text-xs">
                        {ch.email}
                      </a>
                      <p className="text-xs text-slate-500 mt-0.5">{ch.sla}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 rounded-2xl bg-white p-6 sm:p-9 shadow-ring-card">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                <h2 className="text-2xl font-semibold text-slate-900">Message received</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thanks, {form.name}. An outbound specialist will reply to {form.email} shortly.
                </p>
                <div className="pt-4 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", company: "", teamSize: "1-5", topic: "demo", message: "" }); }}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-ring-card hover:bg-slate-50 cursor-pointer"
                  >
                    Send another message
                  </button>
                  <Link href="/" className="rounded-full bg-indigo-400 hover:bg-indigo-500 text-white px-5 py-2.5 text-sm font-semibold">
                    Return home
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Send an inquiry</h2>
                  <p className="text-xs text-slate-500 mt-1">Select a topic and share your outbound setup goals.</p>
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, topic: t.id }))}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        form.topic === t.id ? "bg-indigo-400 hover:bg-indigo-500 text-white" : "bg-slate-100 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Full name *" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="Work email *" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  <input name="company" type="text" value={form.company} onChange={handleChange} placeholder="Company name" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                  <select name="teamSize" value={form.teamSize} onChange={handleChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                    <option value="1-5">1–5 team seats</option>
                    <option value="6-20">6–20 team seats</option>
                    <option value="20+">20+ agency / org seats</option>
                  </select>
                </div>

                <textarea name="message" rows={4} required value={form.message} onChange={handleChange} placeholder="Tell us about your target volume, channels, or questions *" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold px-7 py-3 text-sm shadow-ring-elevated transition cursor-pointer"
                >
                  <span>{loading ? "Sending..." : "Submit inquiry"}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
