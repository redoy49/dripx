"use client";

import { useState, useMemo } from "react";
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
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
  RefreshCw,
  Table2,
  Check,
  ChevronDown,
  Info,
} from "lucide-react";
import { FiLinkedin } from "react-icons/fi";
import {
  parseCsv,
  SUPPORTED_LEAD_FIELDS,
  detectColumnMapping,
  validateLeadRecord,
  mapRowWithCustomMapping,
} from "@/app/lib/csv";

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
    desc: "Add LinkedIn profiles from a CSV file with automatic column mapping",
    icon: UploadCloud,
    accent: "#7C3AED",
    bg: "#F3EFFE",
    kind: "csv",
  },
  {
    key: "paste_urls",
    title: "Paste Profile URLs",
    desc: "Add profiles by pasting LinkedIn profile URLs with live validation",
    icon: Link2,
    accent: "#0891B2",
    bg: "#ECFBFE",
    kind: "urls",
  },
];

export default function LeadSourceModal({ open, onClose, campaignId, onImported }) {
  // Step progression:
  // Step 1: Select Source
  // If CSV:
  //   Step 2: File Upload Dropzone
  //   Step 3: Column Mapping & Sample Preview
  //   Step 4: Pre-flight Summary & Confirmation
  // If URLs or Scrape:
  //   Step 2: Configure & Validate
  // Step 5: (All sources) Import Completion Summary
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState(null);

  // CSV States
  const [csvFile, setCsvFile] = useState(null);
  const [csvRawRows, setCsvRawRows] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  // Configuration States
  const [duplicateStrategy, setDuplicateStrategy] = useState("skip"); // "skip" | "update"
  const [pastedUrls, setPastedUrls] = useState("");
  const [scrapeLimit, setScrapeLimit] = useState(10);

  // Execution & Summary States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [showErrorDrawer, setShowErrorDrawer] = useState(false);

  const source = selected !== null ? leadOptions[selected] : null;

  const stepLabels = useMemo(() => {
    if (!source || source.kind !== "csv") {
      return ["Add Leads", "Configure"];
    }
    return ["Add Leads", "Upload CSV", "Map Columns", "Review & Import"];
  }, [source]);

  const reset = () => {
    setStep(1);
    setSelected(null);
    setCsvFile(null);
    setCsvRawRows([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setIsDragOver(false);
    setDuplicateStrategy("skip");
    setPastedUrls("");
    setScrapeLimit(10);
    setLoading(false);
    setError("");
    setImportResult(null);
    setShowErrorDrawer(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Process selected or dropped CSV file
  const handleProcessFile = async (file) => {
    if (!file) return;
    setError("");

    if (!file.name.toLowerCase().endsWith(".csv") && file.type && !file.type.includes("csv")) {
      setError("Please select a valid .csv file");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCsv(text);

      if (!parsed || parsed.length === 0) {
        setError("CSV file is empty or contains no readable data rows.");
        return;
      }

      const headers = Object.keys(parsed[0] || {});
      if (headers.length === 0) {
        setError("Could not find column headers in the first row of this CSV.");
        return;
      }

      setCsvFile(file);
      setCsvRawRows(parsed);
      setCsvHeaders(headers);

      const autoMapping = detectColumnMapping(headers);
      setColumnMapping(autoMapping);
    } catch (err) {
      console.error("Error reading CSV:", err);
      setError("Failed to parse this CSV file. Please verify it is a valid CSV.");
    }
  };

  // Compute pre-flight validation metrics for CSV
  const mappedLeads = useMemo(() => {
    if (!csvRawRows.length) return [];
    return csvRawRows.map((row) => mapRowWithCustomMapping(row, columnMapping));
  }, [csvRawRows, columnMapping]);

  const { validRows, invalidRows } = useMemo(() => {
    const valid = [];
    const invalid = [];

    mappedLeads.forEach((lead, idx) => {
      const validation = validateLeadRecord(lead);
      if (validation.valid) {
        valid.push({ rowNumber: idx + 2, lead });
      } else {
        invalid.push({
          rowNumber: idx + 2,
          lead,
          errors: validation.errors,
        });
      }
    });

    return { validRows: valid, invalidRows: invalid };
  }, [mappedLeads]);

  const hasIdentifierMapped = useMemo(() => {
    return Object.values(columnMapping).some(
      (target) => target === "email" || target === "linkedinUrl",
    );
  }, [columnMapping]);

  // URL parsing & validation for paste_urls
  const { validPastedUrls, invalidPastedUrls } = useMemo(() => {
    if (!pastedUrls.trim()) return { validPastedUrls: [], invalidPastedUrls: [] };

    const lines = pastedUrls
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const valid = [];
    const invalid = [];

    lines.forEach((line, idx) => {
      const val = validateLeadRecord({ linkedinUrl: line });
      if (val.valid) {
        valid.push(line);
      } else {
        invalid.push({ rowNumber: idx + 1, line, errors: val.errors });
      }
    });

    return { validPastedUrls: valid, invalidPastedUrls: invalid };
  }, [pastedUrls]);

  // Execute Import Submission
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
        form.append("duplicateStrategy", duplicateStrategy);
        form.append("mapping", JSON.stringify(columnMapping));
        if (campaignId) form.append("campaignId", campaignId);

        res = await fetch("/api/leads/import", { method: "POST", body: form });
      } else if (source.kind === "urls") {
        if (validPastedUrls.length === 0) {
          setError("Paste at least one valid LinkedIn profile URL (e.g. linkedin.com/in/username)");
          setLoading(false);
          return;
        }

        res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "paste_urls",
            urls: validPastedUrls,
            campaignId,
            duplicateStrategy,
          }),
        });
      } else {
        res = await fetch("/api/leads/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: source.key,
            limit: scrapeLimit,
            campaignId,
            duplicateStrategy,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Import failed. Please try again.");
        return;
      }

      setImportResult(data);
      setStep(5); // Show success & summary screen
    } catch {
      setError("Something went wrong while connecting to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (importResult) {
      onImported?.(importResult);
    }
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-[3px]">
      <div className="modal-enter flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 bg-gray-50/70 px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      step === i + 1
                        ? "bg-[#6367FF] text-white shadow-sm"
                        : step > i + 1
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        step === i + 1
                          ? "bg-white/25 text-white"
                          : step > i + 1
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {step > i + 1 ? <Check size={10} strokeWidth={3} /> : i + 1}
                    </span>
                    {label}
                  </div>

                  {i < stepLabels.length - 1 && (
                    <ChevronRight size={13} className="text-gray-300" strokeWidth={2.5} />
                  )}
                </div>
              ))}

              {step === 5 && (
                <div className="flex items-center gap-2">
                  <ChevronRight size={13} className="text-gray-300" strokeWidth={2.5} />
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <CheckCircle2 size={13} />
                    Done
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* STEP 1: SELECT SOURCE */}
          {step === 1 && (
            <>
              <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                How would you like to add leads?
              </h2>
              <p className="mb-7 text-sm text-gray-400">
                Select an import method or LinkedIn search source
              </p>

              <div className="grid grid-cols-4 gap-3.5">
                {leadOptions.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = selected === index;

                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelected(index)}
                      className={`card-option group flex min-h-[168px] cursor-pointer flex-col rounded-2xl border p-5 text-left transition-all ${
                        isActive
                          ? "border-[#6367FF] bg-[#6367FF]/[0.04] shadow-sm"
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

              <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
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
                    onClick={() => {
                      if (selected === null) return;
                      setStep(2);
                    }}
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

          {/* STEP 2 (CSV): FILE UPLOAD DROPZONE */}
          {step === 2 && source?.kind === "csv" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                  Upload CSV File
                </h2>
                <p className="text-sm text-gray-400">
                  Upload your contacts list. We will auto-detect columns like names, emails, LinkedIn URLs, and company.
                </p>
              </div>

              {/* Dropzone Card */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  isDragOver
                    ? "border-[#6367FF] bg-[#6367FF]/[0.04]"
                    : csvFile
                      ? "border-emerald-300 bg-emerald-50/20"
                      : "border-gray-200 bg-gray-50/50 hover:border-[#6367FF]/40 hover:bg-white"
                }`}
              >
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6367FF]/10 text-[#6367FF]">
                  {csvFile ? (
                    <FileSpreadsheet size={28} className="text-emerald-600" />
                  ) : (
                    <UploadCloud size={28} />
                  )}
                </div>

                {csvFile ? (
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-gray-800">{csvFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(csvFile.size / 1024).toFixed(1)} KB • {csvRawRows.length} rows detected
                    </p>
                    <label className="mt-3 inline-block cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50">
                      Choose a different file
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleProcessFile(file);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-700">
                      Drag & drop your CSV file here, or{" "}
                      <label className="cursor-pointer text-[#6367FF] underline hover:text-[#5254e8]">
                        browse
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProcessFile(file);
                          }}
                        />
                      </label>
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Supports standard CSV with headers (Max 5,000 rows recommended)
                    </p>
                  </>
                )}
              </div>

              {/* Supported Columns Guide Chip Bar */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                <p className="mb-2 text-xs font-semibold text-gray-600">
                  Recommended Columns for Best Results:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "First Name",
                    "Last Name",
                    "Email Address",
                    "LinkedIn Profile URL",
                    "Company",
                    "Job Title",
                    "Phone",
                    "Icebreaker",
                  ].map((field) => (
                    <span
                      key={field}
                      className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600"
                    >
                      {field}
                    </span>
                  ))}
                  <span className="rounded-md border border-dashed border-gray-300 px-2 py-0.5 text-[11px] text-gray-400">
                    + Any custom columns
                  </span>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  ← Back to Sources
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!csvFile || csvRawRows.length === 0) {
                        setError("Please choose a valid CSV file before continuing");
                        return;
                      }
                      setStep(3);
                    }}
                    disabled={!csvFile || csvRawRows.length === 0}
                    className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
                      csvFile && csvRawRows.length > 0
                        ? "bg-[#6367FF] text-white shadow-sm hover:bg-[#5254e8]"
                        : "cursor-not-allowed bg-gray-100 text-gray-300"
                    }`}
                  >
                    Next: Map Columns
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 (CSV): COLUMN MAPPING & LIVE DATA PREVIEW */}
          {step === 3 && source?.kind === "csv" && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                    Map CSV Columns
                  </h2>
                  <p className="text-sm text-gray-400">
                    Verify and match your CSV headers to DripX lead fields.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                  <FileSpreadsheet size={13} className="text-[#6367FF]" />
                  <span>{csvFile?.name}</span>
                  <span className="text-gray-300">•</span>
                  <span>{csvRawRows.length} rows</span>
                </div>
              </div>

              {/* Identifier Warning if neither email nor linkedin mapped */}
              {!hasIdentifierMapped && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <span>
                    Warning: Neither <strong>Email Address</strong> nor <strong>LinkedIn Profile URL</strong> is currently mapped.
                    At least one identifier is required to import leads for outreach.
                  </span>
                </div>
              )}

              {/* Column Mapping Table */}
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50/70 px-5 py-3 text-xs font-semibold text-gray-500">
                  <div className="col-span-5">CSV Header & Sample Value</div>
                  <div className="col-span-1 text-center"></div>
                  <div className="col-span-6">DripX Target Field</div>
                </div>

                <div className="divide-y divide-gray-100 max-h-[280px] overflow-y-auto">
                  {csvHeaders.map((header) => {
                    const sampleValue = csvRawRows[0]?.[header] || "";
                    const currentTarget = columnMapping[header] || "custom";

                    return (
                      <div
                        key={header}
                        className="grid grid-cols-12 items-center px-5 py-3 transition hover:bg-gray-50/50"
                      >
                        <div className="col-span-5">
                          <span className="text-sm font-semibold text-gray-800">{header}</span>
                          {sampleValue && (
                            <p className="truncate text-xs text-gray-400" title={sampleValue}>
                              Sample: &quot;{sampleValue}&quot;
                            </p>
                          )}
                        </div>

                        <div className="col-span-1 flex justify-center text-gray-300">
                          <ArrowRight size={15} />
                        </div>

                        <div className="col-span-6">
                          <select
                            value={currentTarget}
                            onChange={(e) => {
                              const nextVal = e.target.value;
                              setColumnMapping((prev) => ({
                                ...prev,
                                [header]: nextVal,
                              }));
                            }}
                            className={`w-full rounded-xl border px-3 py-2 text-xs font-medium outline-none transition focus:border-[#6367FF] ${
                              currentTarget === "skip"
                                ? "border-gray-200 bg-gray-100 text-gray-400"
                                : currentTarget === "custom"
                                  ? "border-purple-200 bg-purple-50/40 text-purple-700"
                                  : "border-gray-200 bg-white text-gray-800"
                            }`}
                          >
                            <optgroup label="Standard Lead Fields">
                              {SUPPORTED_LEAD_FIELDS.map((f) => (
                                <option key={f.key} value={f.key}>
                                  {f.label}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Other Actions">
                              <option value="custom">★ Save as Custom Variable</option>
                              <option value="skip">✕ Ignore Column (Do Not Import)</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Sample Preview Section (First 3 Mapped Rows) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Table2 size={14} className="text-[#6367FF]" />
                    <span>Live Data Preview (First 3 Mapped Leads)</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Previewing how DripX will record this data
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-gray-100 bg-gray-50/70 text-gray-500">
                      <tr>
                        <th className="px-4 py-2 font-semibold">Row #</th>
                        <th className="px-4 py-2 font-semibold">Name</th>
                        <th className="px-4 py-2 font-semibold">Email</th>
                        <th className="px-4 py-2 font-semibold">LinkedIn URL</th>
                        <th className="px-4 py-2 font-semibold">Company / Title</th>
                        <th className="px-4 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      {mappedLeads.slice(0, 3).map((lead, idx) => {
                        const val = validateLeadRecord(lead);
                        return (
                          <tr key={idx} className="hover:bg-gray-50/40">
                            <td className="px-4 py-2.5 text-gray-400 font-mono text-[11px]">
                              {idx + 2}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-gray-800">
                              {[lead.firstName, lead.lastName].filter(Boolean).join(" ") || (
                                <span className="text-gray-300 italic">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {lead.email || <span className="text-gray-300 italic">—</span>}
                            </td>
                            <td className="px-4 py-2.5 truncate max-w-[180px]">
                              {lead.linkedinUrl || <span className="text-gray-300 italic">—</span>}
                            </td>
                            <td className="px-4 py-2.5">
                              {[lead.company, lead.jobTitle].filter(Boolean).join(" • ") || (
                                <span className="text-gray-300 italic">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5">
                              {val.valid ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                  <Check size={10} /> Valid
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700"
                                  title={val.errors.join(", ")}
                                >
                                  <AlertTriangle size={10} /> Issue
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  ← Back to Upload
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8]"
                  >
                    Next: Review & Confirm
                    <ChevronRight size={15} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 (CSV): PRE-FLIGHT SUMMARY & CONFIRMATION */}
          {step === 4 && source?.kind === "csv" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                  Pre-flight Summary & Confirmation
                </h2>
                <p className="text-sm text-gray-400">
                  Review the import scope, configure duplicate handling, and commit your leads.
                </p>
              </div>

              {/* 4 Metrics Metric Cards */}
              <div className="grid grid-cols-4 gap-3.5">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400">Total Rows in File</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-gray-800">
                    {csvRawRows.length}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400">{csvFile?.name}</p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-emerald-700">Valid Leads Ready</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700">
                    {validRows.length}
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-600">Passed format validation</p>
                </div>

                <div
                  className={`rounded-2xl border p-4 shadow-sm ${
                    invalidRows.length > 0
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <p
                    className={`text-xs font-semibold ${
                      invalidRows.length > 0 ? "text-amber-800" : "text-gray-400"
                    }`}
                  >
                    Format Issues
                  </p>
                  <p
                    className={`mt-1 text-2xl font-bold tracking-tight ${
                      invalidRows.length > 0 ? "text-amber-700" : "text-gray-800"
                    }`}
                  >
                    {invalidRows.length}
                  </p>
                  <p
                    className={`mt-1 text-[11px] ${
                      invalidRows.length > 0 ? "text-amber-600" : "text-gray-400"
                    }`}
                  >
                    {invalidRows.length > 0 ? "Will be skipped safely" : "Zero errors found"}
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-4 shadow-sm">
                  <p className="text-xs font-semibold text-purple-700">Destination</p>
                  <p className="mt-1 truncate text-base font-bold text-gray-800">
                    {campaignId ? "Campaign Flow" : "Leads Directory"}
                  </p>
                  <p className="mt-1 text-[11px] text-purple-600">
                    {campaignId ? "Auto-enrolled in campaign" : "Saved to workspace"}
                  </p>
                </div>
              </div>

              {/* Duplicate Handling Strategy Selector */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">
                  Duplicate Lead Policy
                </h3>
                <p className="mb-4 text-xs text-gray-400">
                  How should DripX handle leads that already exist in your workspace (matching LinkedIn URL or email)?
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("skip")}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
                      duplicateStrategy === "skip"
                        ? "border-[#6367FF] bg-[#6367FF]/[0.04]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        duplicateStrategy === "skip"
                          ? "border-[#6367FF] bg-[#6367FF] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {duplicateStrategy === "skip" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Skip duplicates (Recommended)
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Keeps existing lead profiles unchanged and avoids duplicate records. Existing leads will still be enrolled in this campaign if requested.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("update")}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
                      duplicateStrategy === "update"
                        ? "border-[#6367FF] bg-[#6367FF]/[0.04]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        duplicateStrategy === "update"
                          ? "border-[#6367FF] bg-[#6367FF] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {duplicateStrategy === "update" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        Update existing leads
                      </p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Merges new CSV values into existing lead records and fills any missing fields.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Actionable Error Accordion (If invalid rows exist) */}
              {invalidRows.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/30 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowErrorDrawer((prev) => !prev)}
                    className="flex w-full items-center justify-between px-5 py-3.5 text-left text-xs font-semibold text-amber-900 transition hover:bg-amber-50/50"
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-amber-600" />
                      <span>
                        {invalidRows.length} {invalidRows.length === 1 ? "Row" : "Rows"} will be skipped due to format issues
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                      <span>{showErrorDrawer ? "Hide details" : "View row details"}</span>
                      <ChevronDown
                        size={14}
                        className={`transition-transform ${showErrorDrawer ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {showErrorDrawer && (
                    <div className="border-t border-amber-200 bg-white p-4 max-h-[160px] overflow-y-auto">
                      <div className="space-y-2 text-xs">
                        {invalidRows.map((item) => (
                          <div
                            key={item.rowNumber}
                            className="flex items-start justify-between rounded-lg bg-gray-50 px-3 py-2"
                          >
                            <div>
                              <span className="font-mono font-semibold text-gray-700">
                                Row #{item.rowNumber}:
                              </span>{" "}
                              <span className="text-rose-600 font-medium">
                                {item.errors.join("; ")}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {item.lead.email || item.lead.linkedinUrl || "No identifier"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  onClick={() => setStep(3)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  ← Back to Mapping
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
                    disabled={loading || validRows.length === 0}
                    className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading ? "Importing leads..." : `Confirm & Import ${validRows.length} Leads`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 (NON-CSV): URLS & SCRAPE SOURCES */}
          {step === 2 && source?.kind !== "csv" && (
            <div className="space-y-6">
              <div>
                <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-gray-800">
                  {source.title}
                </h2>
                <p className="text-sm text-gray-400">{source.desc}</p>
              </div>

              {source.kind === "urls" && (
                <div className="space-y-3">
                  <textarea
                    value={pastedUrls}
                    onChange={(e) => setPastedUrls(e.target.value)}
                    placeholder={"https://www.linkedin.com/in/jane-doe\nhttps://www.linkedin.com/in/john-smith"}
                    rows={8}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/60 p-4 font-mono text-xs text-gray-700 outline-none transition focus:border-[#6367FF]/40 focus:bg-white"
                  />

                  {/* Real-time URL Validation Indicators */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <Check size={11} strokeWidth={2.5} />
                        {validPastedUrls.length} valid LinkedIn {validPastedUrls.length === 1 ? "URL" : "URLs"}
                      </span>
                      {invalidPastedUrls.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                          <AlertTriangle size={11} strokeWidth={2.5} />
                          {invalidPastedUrls.length} invalid {invalidPastedUrls.length === 1 ? "line" : "lines"}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">1 LinkedIn profile URL per line</span>
                  </div>
                </div>
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

              {/* Duplicate policy for URLs and Scrape */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3 className="mb-1 text-sm font-semibold text-gray-800">
                  Duplicate Lead Policy
                </h3>
                <p className="mb-4 text-xs text-gray-400">
                  If any of these leads already exist in your workspace:
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("skip")}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
                      duplicateStrategy === "skip"
                        ? "border-[#6367FF] bg-[#6367FF]/[0.04]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        duplicateStrategy === "skip"
                          ? "border-[#6367FF] bg-[#6367FF] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {duplicateStrategy === "skip" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Skip duplicates</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Preserve existing leads and enroll them in the campaign.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDuplicateStrategy("update")}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition ${
                      duplicateStrategy === "update"
                        ? "border-[#6367FF] bg-[#6367FF]/[0.04]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        duplicateStrategy === "update"
                          ? "border-[#6367FF] bg-[#6367FF] text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {duplicateStrategy === "update" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Update existing</p>
                      <p className="mt-0.5 text-[11px] text-gray-400">
                        Update existing profiles with new incoming information.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Navigation Footer */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-5">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-gray-400 hover:text-gray-600"
                >
                  ← Back to Sources
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
                    disabled={loading || (source.kind === "urls" && validPastedUrls.length === 0)}
                    className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    {loading
                      ? "Importing..."
                      : source.kind === "urls"
                        ? `Import ${validPastedUrls.length} Leads`
                        : `Import ${scrapeLimit} Leads`}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: IMPORT COMPLETION & SUCCESS REPORT */}
          {step === 5 && importResult && (
            <div className="py-4 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-gray-800">
                  Import Completed Successfully!
                </h2>
                <p className="text-sm text-gray-400">
                  Your leads have been processed and saved to your workspace.
                </p>
              </div>

              {/* Import Report Cards */}
              <div className="mx-auto grid max-w-2xl grid-cols-4 gap-3 text-left">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="text-xs font-semibold text-gray-400">Processed</p>
                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {importResult.summary?.total ?? importResult.imported}
                  </p>
                  <p className="text-[11px] text-gray-400">Total records</p>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <p className="text-xs font-semibold text-emerald-700">New Leads</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {importResult.summary?.newCount ?? importResult.imported}
                  </p>
                  <p className="text-[11px] text-emerald-600">Created in DB</p>
                </div>

                <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                  <p className="text-xs font-semibold text-purple-700">Duplicates</p>
                  <p className="mt-1 text-2xl font-bold text-purple-700">
                    {importResult.summary?.duplicateCount ?? 0}
                  </p>
                  <p className="text-[11px] text-purple-600">
                    {importResult.summary?.updatedCount > 0
                      ? `${importResult.summary.updatedCount} updated`
                      : `${importResult.summary?.skippedCount ?? 0} skipped`}
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                  <p className="text-xs font-semibold text-gray-400">Enrolled</p>
                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {importResult.enrollment?.enrolled ??
                      (campaignId ? importResult.leads?.length : 0)}
                  </p>
                  <p className="text-[11px] text-gray-400">In campaign</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleFinish}
                  className="rounded-xl bg-[#6367FF] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#5254e8]"
                >
                  Continue to Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
