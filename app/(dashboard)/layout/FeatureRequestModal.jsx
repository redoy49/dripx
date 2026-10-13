"use client";

import { useState } from "react";
import { X, Send, Mail, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function FeatureRequestModal({ isOpen, onClose }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Campaigns & Sequences");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit request");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle("");
        setDescription("");
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEmailClient = () => {
    const subject = encodeURIComponent(`Feature Request: ${title || "New Suggestion"}`);
    const body = encodeURIComponent(
      `Category: ${category}\n\nDescription:\n${description || "Describe your feature request here..."}\n\nSubmitted from DripX workspace.`
    );
    window.open(`mailto:support@dripx.app?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shadow-2xs">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Request New Feature</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Send your ideas and suggestions directly to our product team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Feature Request Sent!</h4>
            <p className="text-xs text-gray-400 max-w-xs">
              Thank you for helping us make DripX better. Our engineering team reviews every request.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Feature Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Two-way Hubspot CRM sync, Custom SMTP rotation..."
                className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition"
              >
                <option value="Campaigns & Sequences">Campaigns & Sequences</option>
                <option value="Inbox & Messaging">Inbox & Multi-Channel Messaging</option>
                <option value="Leads & Prospecting">Leads & Prospecting</option>
                <option value="Email Deliverability & Warmup">Email Deliverability & Warmup</option>
                <option value="Integrations & Webhooks">Integrations & Webhooks</option>
                <option value="Analytics & Reporting">Analytics & Reporting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description & Use Case
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what you would like to achieve and how this feature would benefit your outreach workflow..."
                className="w-full px-3.5 py-2.5 text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleOpenEmailClient}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition cursor-pointer"
                title="Send directly from your default desktop email client"
              >
                <Mail size={14} />
                <span>Send via Email Client</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6367FF] hover:bg-[#5254e8] text-white text-xs font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
