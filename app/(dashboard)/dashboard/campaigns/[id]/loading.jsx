export default function CampaignDetailsLoading() {
  return (
    <div className="min-h-screen bg-[#F2F2F6] p-4 md:p-6 space-y-6 animate-pulse">
      {/* ── 1. Header & Quick Controls Bar Skeleton ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Breadcrumbs, Title, Status & Next Action */}
        <div className="space-y-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <div className="h-3 w-16 bg-gray-200/70 rounded" />
            <span className="text-gray-300">/</span>
            <div className="h-3 w-28 bg-gray-200/80 rounded" />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-7 w-48 bg-gray-200/90 rounded-xl" />
            {/* Status badge pill */}
            <div className="h-6 w-20 bg-emerald-100 rounded-full" />
            {/* Next scheduled action pill */}
            <div className="h-6 w-44 bg-violet-100 rounded-full" />
          </div>
        </div>

        {/* Right: Actions Bar Skeleton */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200/60" />
          <div className="h-9 w-24 rounded-full bg-violet-100" />
          <div className="h-9 w-28 rounded-full bg-violet-200/80" />
          <div className="h-9 w-28 rounded-full bg-gray-100 border border-gray-200/60" />
          <div className="h-9 w-28 rounded-full bg-gray-100 border border-gray-200/60" />
          <div className="h-9 w-36 rounded-full bg-amber-100" />
        </div>
      </div>

      {/* ── 2. Navigation Tabs Skeleton ───────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-1">
        {[
          { label: "Analytics Overview", width: "w-32" },
          { label: "Enrolled Leads", width: "w-28" },
          { label: "Activity Audit", width: "w-28" },
          { label: "Execution Queue", width: "w-32" },
        ].map((tab, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 -mb-[2px] ${
              i === 0 ? "border-[#6367FF]" : "border-transparent"
            }`}
          >
            <div className="w-4 h-4 rounded bg-gray-200/80" />
            <div className={`h-3.5 ${tab.width} bg-gray-200/80 rounded`} />
          </div>
        ))}
      </div>

      {/* ── 3. Executive KPI Cards Grid (4 Cards) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Enrolled", color: "bg-violet-100" },
          { label: "Outreach Touches", color: "bg-blue-100" },
          { label: "Response Rate", color: "bg-emerald-100" },
          { label: "Sequence Finished", color: "bg-slate-100" },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-gray-200/70 rounded" />
              <div className={`w-8 h-8 rounded-xl ${kpi.color}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="h-7 w-16 bg-gray-200/90 rounded" />
              <div className="h-3 w-10 bg-gray-200/60 rounded" />
            </div>
            <div className="h-3 w-28 bg-gray-200/50 rounded" />
          </div>
        ))}
      </div>

      {/* ── 4. Conversion Funnel & Channel Matrix ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs space-y-5">
          <div className="space-y-1.5">
            <div className="h-4 w-36 bg-gray-200/80 rounded" />
            <div className="h-3 w-64 bg-gray-200/50 rounded" />
          </div>

          {/* 5 Funnel Stages Skeleton */}
          <div className="space-y-3 pt-2">
            {[80, 65, 45, 30, 20].map((width, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="h-3 w-28 bg-gray-200/70 rounded" />
                  <div className="h-3 w-12 bg-gray-200/80 rounded" />
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${width}%` }}
                    className="h-full bg-indigo-200/80 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Matrix (Right col) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs space-y-4">
          <div className="h-4 w-32 bg-gray-200/80 rounded" />
          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFC] space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-16 bg-gray-200/70 rounded" />
                <div className="h-4 w-10 bg-indigo-200/80 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-200/60 rounded-full" />
              <div className="h-3 w-28 bg-gray-200/50 rounded" />
            </div>
            <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFC] space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-20 bg-gray-200/70 rounded" />
                <div className="h-4 w-10 bg-blue-200/80 rounded" />
              </div>
              <div className="h-2 w-full bg-gray-200/60 rounded-full" />
              <div className="h-3 w-28 bg-gray-200/50 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Sequence Steps Performance Breakdown Skeleton ────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 bg-gray-200/80 rounded" />
          <div className="h-3 w-24 bg-gray-200/60 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFC] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-indigo-100" />
                <div className="h-4 w-12 bg-gray-200/70 rounded-full" />
              </div>
              <div className="h-4 w-32 bg-gray-200/80 rounded" />
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                <div className="h-3 w-16 bg-gray-200/60 rounded" />
                <div className="h-3 w-12 bg-emerald-200/80 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. Enrolled Leads Table Preview Skeleton ───────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="h-4 w-36 bg-gray-200/80 rounded" />
          <div className="h-3.5 w-20 bg-gray-200/60 rounded" />
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200/80 shrink-0" />
                <div className="space-y-1">
                  <div className="h-3.5 w-32 bg-gray-200/80 rounded" />
                  <div className="h-3 w-44 bg-gray-200/50 rounded" />
                </div>
              </div>
              <div className="h-5 w-20 bg-gray-200/60 rounded-full" />
              <div className="h-3.5 w-24 bg-gray-200/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
