"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, Tag } from "lucide-react";
import BellIcon from "@/app/components/ui/BellIcon";
import { getCached, setCached } from "@/app/lib/swrCache";
import {
  EmailAccountsSkeleton,
  SettingsLimitsSkeleton,
  WorkingHoursSkeleton,
} from "./loading";
import {
  AiProvidersSkeleton,
  IntegrationsSkeleton,
  SequenceTemplatesSkeleton,
} from "./_components/SettingsTabSkeletons";
import SettingsLimitsPanel from "./_components/SettingsSliders";

const EmailAccountsTab = dynamic(
  () => import("@/app/(dashboard)/dashboard/settings/EmailAccountsTab"),
  { ssr: false, loading: () => <EmailAccountsSkeleton /> },
);
const IntegrationsTab = dynamic(
  () => import("@/app/(dashboard)/dashboard/settings/IntegrationsTab"),
  { ssr: false, loading: () => <IntegrationsSkeleton /> },
);
const WorkingHoursTab = dynamic(
  () => import("@/app/(dashboard)/dashboard/settings/WorkingHoursTab"),
  { ssr: false, loading: () => <WorkingHoursSkeleton /> },
);
const SequenceTemplatesTab = dynamic(
  () => import("@/app/(dashboard)/dashboard/settings/SequenceTemplatesTab"),
  { ssr: false, loading: () => <SequenceTemplatesSkeleton /> },
);
const AiProvidersTab = dynamic(
  () => import("@/app/(dashboard)/dashboard/settings/AiProvidersTab"),
  { ssr: false, loading: () => <AiProvidersSkeleton /> },
);

const TABS = [
  "Limits & Activity control",
  "Email Accounts",
  "Integrations",
  "Working hours",
  "Sequence templates",
  "AI Providers",
  "Data scrubber",
  "Lead tagging",
];

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ComingSoonPanel({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" strokeWidth={1.7} />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      <p className="max-w-sm text-sm text-gray-400">{description}</p>
    </div>
  );
}

export default function SettingsClient({ initialLimits = null }) {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab");
  const shouldOpenEmail =
    tabParam === "Email Accounts" ||
    searchParams?.get("connected") ||
    searchParams?.get("error");
  const initialTab = shouldOpenEmail
    ? 1
    : tabParam === "Integrations"
      ? 2
      : tabParam === "AI Providers"
        ? 5
        : 0;

  const [activeTab, setActiveTab] = useState(initialTab);
  const [limits, setLimits] = useState(
    () => initialLimits || getCached("/api/settings/limits"),
  );
  const [loading, setLoading] = useState(
    () => !initialLimits && !getCached("/api/settings/limits"),
  );
  const saveTimeout = useRef(null);
  const skipInitialFetchRef = useRef(Boolean(initialLimits));

  useEffect(() => {
    if (initialLimits) {
      setCached("/api/settings/limits", initialLimits);
    }
  }, [initialLimits]);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }

    let ignore = false;
    fetch("/api/settings/limits")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setCached("/api/settings/limits", data);
          setLimits(data);
        }
        if (!ignore) setLoading(false);
      })
      .catch(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const persist = (patch) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      fetch("/api/settings/limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((updated) => {
          if (updated) setCached("/api/settings/limits", updated);
        })
        .catch(() => {});
    }, 400);
  };

  const updateSlider = (key, value) => {
    setLimits((prev) => {
      const next = { ...prev, [key]: value };
      setCached("/api/settings/limits", next);
      return next;
    });
    persist({ [key]: value });
  };

  const updateActivityOn = () => {
    setLimits((prev) => {
      const next = { ...prev, activityControlOn: !prev.activityControlOn };
      setCached("/api/settings/limits", next);
      persist({ activityControlOn: next.activityControlOn });
      return next;
    });
  };

  const updateRange = (value) => {
    setLimits((prev) => {
      const next = { ...prev, range: value };
      setCached("/api/settings/limits", next);
      return next;
    });
    persist({ range: value });
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-gray-900 font-sans p-4 sm:p-6">
      <header className="flex items-center justify-between p-4 mb-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
        <button
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50 cursor-pointer active:scale-95"
        >
          <BellIcon />
        </button>
      </header>

      <main className="flex-1 w-full">
        <div className="overflow-hidden bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
          <nav className="flex px-4 py-3 border-b border-gray-200/90 overflow-x-auto no-scrollbar gap-1.5 bg-gray-50/50">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  activeTab === i
                    ? "bg-indigo-400 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-white/80"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {activeTab === 0 &&
            (loading || !limits ? (
              <SettingsLimitsSkeleton />
            ) : (
              <SettingsLimitsPanel
                limits={limits}
                onUpdateSlider={updateSlider}
                onUpdateRange={updateRange}
                onToggleActivity={updateActivityOn}
              />
            ))}

          {activeTab === 1 && (
            <div className="p-8">
              <EmailAccountsTab />
            </div>
          )}
          {activeTab === 2 && <IntegrationsTab />}
          {activeTab === 3 && <WorkingHoursTab />}
          {activeTab === 4 && <SequenceTemplatesTab />}
          {activeTab === 5 && <AiProvidersTab />}
          {activeTab === 6 && (
            <ComingSoonPanel
              icon={ShieldCheck}
              title="Data scrubber"
              description="Automatic PII cleanup rules for imported lead data are on the roadmap."
            />
          )}
          {activeTab === 7 && (
            <ComingSoonPanel
              icon={Tag}
              title="Lead tagging"
              description="Manage workspace-wide tag presets here — for now, tag leads directly from the Leads page."
            />
          )}
        </div>
      </main>

      <button className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center bg-indigo-400 text-white rounded-full shadow-md shadow-indigo-200 hover:scale-105 transition-transform active:scale-95">
        <ChatIcon />
      </button>
    </div>
  );
}
