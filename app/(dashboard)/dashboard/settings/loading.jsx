export function SettingsLimitsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_320px] gap-0 p-8 animate-pulse">
      {/* Left: Sliders */}
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-8">
          <div className="h-4 w-48 bg-gray-200/80 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
            <div className="h-8 w-20 bg-gray-100 rounded-full border border-gray-200/60" />
          </div>
        </div>

        {/* 8 Slider Rows Skeleton */}
        <ul className="space-y-1">
          {[
            { label: "Connection requests", width: "w-36", max: "50" },
            { label: "Messages", width: "w-24", max: "80" },
            { label: "InMails", width: "w-20", max: "50" },
            { label: "Profile views", width: "w-28", max: "100" },
            { label: "Endorsements", width: "w-28", max: "50" },
            { label: "Likes", width: "w-16", max: "80" },
            { label: "Followings", width: "w-24", max: "50" },
            { label: "Emails", width: "w-16", max: "100" },
          ].map((item, idx) => (
            <li
              key={idx}
              className="grid grid-cols-[150px_1fr_48px] items-center gap-4 py-4 border-b border-gray-100 last:border-0"
            >
              <div className="h-4 w-32 bg-gray-200/80 rounded" />
              <div className="relative py-4 flex-1">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${35 + (idx % 4) * 15}%` }}
                    className="h-full bg-indigo-300/80 rounded-full"
                  />
                </div>
              </div>
              <div className="h-3 w-8 bg-gray-200/60 rounded justify-self-end" />
            </li>
          ))}
        </ul>
      </div>

      {/* Vertical Divider */}
      <div className="hidden lg:block w-[1px] bg-gray-100 mx-8 self-stretch" />

      {/* Right: Activity Control Skeleton */}
      <div className="flex flex-col items-center text-center gap-4 pt-4">
        <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-tr from-indigo-100 to-violet-100 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/80" />
        </div>
        <div className="h-5 w-32 bg-gray-200/80 rounded" />
        <div className="space-y-1.5 w-full max-w-xs">
          <div className="h-3 w-full bg-gray-200/60 rounded" />
          <div className="h-3 w-4/5 mx-auto bg-gray-200/50 rounded" />
        </div>

        <div className="flex items-center justify-between w-full p-3.5 mt-4 border border-gray-200/90 rounded-full bg-gray-50">
          <div className="h-3.5 w-28 bg-gray-200/80 rounded" />
          <div className="w-11 h-6 bg-gray-200/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function EmailAccountsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="flex flex-col gap-4 rounded-[26px] border border-gray-200/90 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-64 bg-gray-200/80 rounded" />
          <div className="h-3 w-96 max-w-full bg-gray-200/50 rounded" />
        </div>
        <div className="h-9 w-44 bg-indigo-200/80 rounded-full shrink-0" />
      </div>

      {/* Deliverability Health Overview 4 KPIs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-gray-200/70 rounded" />
              <div className="w-4 h-4 rounded bg-gray-200/60" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="h-6 w-12 bg-gray-200/80 rounded" />
              <div className="h-3 w-14 bg-gray-200/50 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Mailbox Cards List Skeleton */}
      <div className="grid grid-cols-1 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-200/80" />
                <div className="space-y-1">
                  <div className="h-4 w-44 bg-gray-200/80 rounded" />
                  <div className="h-3 w-28 bg-gray-200/50 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-20 bg-emerald-100 rounded-full" />
                <div className="h-6 w-24 bg-gray-100 rounded-full" />
              </div>
            </div>

            {/* Metrics & Progress meters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="p-3 rounded-xl bg-gray-50/70 space-y-1.5">
                <div className="h-2.5 w-16 bg-gray-200/60 rounded" />
                <div className="h-4 w-20 bg-gray-200/80 rounded" />
                <div className="h-1.5 w-full bg-gray-200 rounded-full" />
              </div>
              <div className="p-3 rounded-xl bg-gray-50/70 space-y-1.5">
                <div className="h-2.5 w-16 bg-gray-200/60 rounded" />
                <div className="h-4 w-24 bg-gray-200/80 rounded" />
                <div className="h-1.5 w-full bg-gray-200 rounded-full" />
              </div>
              <div className="p-3 rounded-xl bg-gray-50/70 space-y-1.5">
                <div className="h-2.5 w-20 bg-gray-200/60 rounded" />
                <div className="h-4 w-16 bg-gray-200/80 rounded" />
                <div className="h-1.5 w-full bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WorkingHoursSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Timezone & Clock Banner */}
      <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs space-y-3">
        <div className="h-4 w-48 bg-gray-200/80 rounded" />
        <div className="h-10 w-full max-w-md bg-gray-100 rounded-full border border-gray-200/70" />
      </div>

      {/* Weekday Selector */}
      <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs space-y-4">
        <div className="h-4 w-40 bg-gray-200/80 rounded" />
        <div className="flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <div key={d} className="h-9 w-20 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>

      {/* Sending Window Sliders */}
      <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs space-y-4">
        <div className="h-4 w-44 bg-gray-200/80 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFC] space-y-2">
            <div className="h-3 w-20 bg-gray-200/60 rounded" />
            <div className="h-8 w-full bg-gray-100 rounded-lg" />
          </div>
          <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFC] space-y-2">
            <div className="h-3 w-20 bg-gray-200/60 rounded" />
            <div className="h-8 w-full bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsLoading() {
  const tabs = [
    "Limits & Activity control",
    "Email Accounts",
    "Integrations",
    "Working hours",
    "Sequence templates",
    "Data scrubber",
    "Lead tagging",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-gray-900 font-sans p-4 sm:p-6 animate-pulse">
      {/* ── Top Bar Skeleton ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between p-4 mb-4 bg-white border border-gray-200/90 rounded-2xl shadow-2xs">
        <div className="h-7 w-28 bg-gray-200/80 rounded-xl" />
        <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200/60" />
      </header>

      {/* ── Main Content Card Skeleton ────────────────────────────────────── */}
      <main className="flex-1 w-full">
        <div className="overflow-hidden bg-white rounded-2xl border border-gray-200/90 shadow-2xs">
          {/* Tabs bar */}
          <nav className="flex px-4 py-3 border-b border-gray-200/90 overflow-x-auto no-scrollbar gap-1.5 bg-gray-50/50">
            {tabs.map((tab, i) => (
              <div
                key={tab}
                className={`whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-full ${
                  i === 0 ? "bg-indigo-300 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {tab}
              </div>
            ))}
          </nav>

          {/* Limits tab default content skeleton */}
          <SettingsLimitsSkeleton />
        </div>
      </main>
    </div>
  );
}
