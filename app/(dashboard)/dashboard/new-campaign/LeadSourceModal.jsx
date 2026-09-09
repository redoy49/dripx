"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Calendar,
  UploadCloud,
  Link2,
  Network,
  UserCheck,
  ChevronRight,
  X,
  Loader2,
} from "lucide-react";
import { FiLinkedin } from "react-icons/fi";

export const leadOptions = [
  {
    key: "basic_search",
    title: "Basic LinkedIn Search",
    desc: "Add profiles from the search page of the free LinkedIn version",
    icon: FiLinkedin,
    isReactIcon: true,
    accent: "#0A66C2",
    bg: "#EBF3FB",
    kind: "scrape",
  },
  {
    key: "sales_navigator",
    title: "LinkedIn Sales Navigator",
    desc: "Transfer profiles from the search panel of Sales Navigator",
    icon: Search,
    accent: "#7C3AED",
    bg: "#F3EFFE",
    kind: "scrape",
  },
  {
    key: "recruiter_search",
    title: "LinkedIn Recruiter Search",
    desc: "Add profiles from LinkedIn Recruiter search panel",
    icon: UserCheck,
    accent: "#0891B2",
    bg: "#ECFBFE",
    kind: "scrape",
  },
  {
    key: "event_members",
    title: "LinkedIn Event Members",
    desc: "Retrieve members of the LinkedIn event you're attending",
    icon: Calendar,
    accent: "#D97706",
    bg: "#FFFBEB",
    kind: "scrape",
  },
  {
    key: "group_members",
    title: "LinkedIn Group Members",
    desc: "Scrape members of the LinkedIn group you're part of",
    icon: Users,
    accent: "#059669",
    bg: "#ECFDF5",
    kind: "scrape",
  },
  {
    key: "my_network",
    title: "My Network",
    desc: 'Transfer first-level connections from the "My Network" page',
    icon: Network,
    accent: "#E11D48",
    bg: "#FFF1F2",
    kind: "scrape",
  },
  {
    key: "csv_upload",
    title: "Upload CSV File",
    desc: "Add LinkedIn profiles from a CSV file",
    icon: UploadCloud,
    accent: "#7C3AED",
    bg: "#F3EFFE",
    kind: "csv",
  },
  {
    key: "paste_urls",
    title: "Paste Profile URLs",
    desc: "Add profiles by pasting the LinkedIn profile URLs",
    icon: Link2,
    accent: "#0891B2",
    bg: "#ECFBFE",
    kind: "urls",
  },
];

const stepLabels = ["Add Leads", "Configure"];

/**
 * The lead-source picker modal, extracted verbatim from the new-campaign wizard so the
 * Leads page can reuse it instead of duplicating ~150 lines. Behavior/markup unchanged.
 *
 * onImported(result) is called with the /api/leads/import response once an import succeeds.
 */
export default function LeadSourceModal({ open, onClose, campaignId, onImported }) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [pastedUrls, setPastedUrls] = useState("");
  const [scrapeLimit, setScrapeLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const source = selected !== null ? leadOptions[selected] : null;

  const reset = () => {
    setStep(1);
    setSelected(null);
    setCsvFile(null);
    setPastedUrls("");
    setScrapeLimit(10);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleContinue = () => {
    if (selected === null) return;
    setStep(2);
  };

  const handleImport = async () => {
    if (!source) return;
    setLoading(true);
    setError("");

    try {
      let res;

      if (source.kind === "csv") {
        if (!csvFile) {
          setError("Choose a CSV file first");
          setLoading(false);
          return;
        }
        const form = new FormData();
        form.append("file", csvFile);
        if (campaignId) form.append("campaignId", campaignId);
        res = await fetch("/api/leads/import", { method: "POST", body: form });
      } else if (source.kind === "urls") {
        const urls = pastedUrls.split("\n").map((u) => u.trim()).filter(Boolean);
        if (urls.length === 0) {
          setError("Paste at least one LinkedIn profile URL");
          setLoading(false);
          return;
        }
        res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "paste_urls", urls, campaignId }),
        });
      } else {
        res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: source.key, limit: scrapeLimit, campaignId }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Import failed");
        return;
      }

      onImported?.(data);
      handleClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-8 py-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      step === i + 1
                        ? "bg-[#6367FF] text-white shadow-sm"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        step === i + 1
                          ? "bg-white/25 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {label}
                  </div>

                  {i < stepLabels.length - 1 && (
                    <ChevronRight size={13} className="text-gray-300" strokeWidth={2.5} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {step === 1 && (
            <>
              <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                How would you like to add leads?
              </h2>
              <p className="mb-7 text-sm text-gray-400">
                Select a source to import your LinkedIn leads
              </p>

              <div className="grid grid-cols-4 gap-3.5">
                {leadOptions.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = selected === index;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelected(index)}
                      className={`card-option group flex min-h-[168px] cursor-pointer flex-col rounded-2xl border p-5 text-left ${
                        isActive
                          ? "active border-[#6367FF] bg-[#6367FF]/[0.04]"
                          : "border-gray-200 bg-white hover:border-[#6367FF]/30"
                      }`}
                      style={{ borderColor: isActive ? "#6367FF" : "#EBEBEB" }}
                    >
                      <div
                        className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all"
                        style={{ background: isActive ? item.accent : item.bg }}
                      >
                        {item.isReactIcon ? (
                          <Icon size={18} style={{ color: isActive ? "#fff" : item.accent }} />
                        ) : (
                          <Icon
                            size={18}
                            strokeWidth={1.9}
                            style={{ color: isActive ? "#fff" : item.accent }}
                          />
                        )}
                      </div>

                      <h3 className="mb-1.5 text-[13px] font-semibold leading-[1.4] text-gray-800">
                        {item.title}
                      </h3>
                      <p className="mt-auto text-[11.5px] leading-[1.55] text-gray-400">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-5">
                <p className="text-xs text-gray-400">
                  {source ? `Selected: ${source.title}` : "No source selected"}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={selected === null}
                    className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                      selected !== null
                        ? "bg-[#6367FF] text-white shadow-sm hover:bg-[#5254e8]"
                        : "cursor-not-allowed bg-gray-100 text-gray-300"
                    }`}
                  >
                    Continue
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 2 && source && (
            <>
              <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                {source.title}
              </h2>
              <p className="mb-7 text-sm text-gray-400">{source.desc}</p>

              {source.kind === "csv" && (
                <label className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 p-8 text-center transition hover:border-[#6367FF]/40">
                  <UploadCloud size={28} className="text-gray-400" strokeWidth={1.6} />
                  <span className="text-sm font-medium text-gray-600">
                    {csvFile ? csvFile.name : "Click to choose a CSV file"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Columns like firstName, lastName, company, jobTitle, linkedinUrl, email are auto-detected
                  </span>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </label>
              )}

              {source.kind === "urls" && (
                <textarea
                  value={pastedUrls}
                  onChange={(e) => setPastedUrls(e.target.value)}
                  placeholder={"https://www.linkedin.com/in/jane-doe\nhttps://www.linkedin.com/in/john-smith"}
                  rows={8}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-sm text-gray-700 outline-none transition focus:border-[#6367FF]/40 focus:bg-white"
                />
              )}

              {source.kind === "scrape" && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of profiles to import
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={scrapeLimit}
                    onChange={(e) => setScrapeLimit(Number(e.target.value))}
                    className="w-32 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
                  />
                  <p className="mt-3 text-xs text-gray-400">
                    DripX&apos;s LinkedIn connector is running in safe mock mode — this generates
                    realistic sample profiles instead of scraping real LinkedIn data, so you can
                    build and test the rest of your workflow risk-free.
                  </p>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

              <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  ← Back
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading ? "Importing..." : "Import leads"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
