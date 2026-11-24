export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] p-4 sm:p-6 lg:p-7 space-y-6 w-full max-w-full text-gray-800 animate-pulse">
      {/* ── 1. Top Executive Greeting Header Skeleton ───────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200/80 rounded-xl" />
          <div className="h-3.5 w-80 max-w-full bg-gray-200/60 rounded-md" />
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-gray-200/80 border border-gray-200/60" />
          <div className="h-9 w-32 rounded-full bg-indigo-200/80" />
          <div className="h-9 w-28 rounded-full bg-gray-200/80 border border-gray-200/60" />
          <div className="h-9 w-32 rounded-full bg-gray-200/80 border border-gray-200/60" />
          <div className="h-9 w-24 rounded-full bg-gray-200/80 border border-gray-200/60" />
        </div>
      </div>

      {/* ── 2. Upper Grid: Statistics & Recent Activity ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card (~68% width): Statistics */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="h-5 w-24 bg-gray-200/80 rounded-md" />
            <div className="h-3.5 w-16 bg-gray-200/60 rounded-md" />
          </div>

          {/* 4 Radial Gauges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {[
              { label: "Invites sent", color: "bg-indigo-100" },
              { label: "Messages sent", color: "bg-rose-100" },
              { label: "Emails sent", color: "bg-amber-100" },
              { label: "Profile viewed", color: "bg-emerald-100" },
            ].map((gauge, i) => (
              <div key={i} className="flex flex-col items-center text-center space-y-2">
                <div className="w-[66px] h-[66px] rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center">
                  <div className={`w-8 h-8 rounded-full ${gauge.color}`} />
                </div>
                <div className="h-3 w-14 bg-gray-200/80 rounded" />
                <div className="h-2.5 w-16 bg-gray-200/50 rounded" />
              </div>
            ))}
          </div>

          {/* 3 Stat Metric Highlight Boxes Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-gray-100">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2"
              >
                <div className="h-2.5 w-24 bg-gray-200/60 rounded" />
                <div className="flex items-center justify-between">
                  <div className="h-6 w-12 bg-gray-200/80 rounded" />
                  <div className="h-6 w-16 bg-gray-200/60 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Card (~32% width): Recent activity */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="h-5 w-28 bg-gray-200/80 rounded-md" />
              <div className="w-2 h-2 rounded-full bg-emerald-300" />
            </div>

            <div className="space-y-3.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-full bg-gray-100 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3 w-3/4 bg-gray-200/80 rounded" />
                    <div className="h-2.5 w-1/2 bg-gray-200/50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-8 w-full bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* ── 3. Middle Section: Recent Campaigns Table Skeleton ──────────────── */}
      <div className="rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="h-5 w-36 bg-gray-200/80 rounded-md" />
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-28 bg-gray-100 rounded-full" />
            <div className="h-8 w-32 bg-indigo-200/80 rounded-full" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Table Header */}
            <div className="grid grid-cols-[36%_24%_24%_16%] pb-3 border-b border-gray-100">
              <div className="h-3 w-16 bg-gray-200/70 rounded" />
              <div className="h-3 w-12 bg-gray-200/70 rounded" />
              <div className="h-3 w-16 bg-gray-200/70 rounded" />
              <div className="h-3 w-12 bg-gray-200/70 rounded justify-self-end" />
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-[36%_24%_24%_16%] py-4 items-center">
                  <div className="space-y-2 pr-4">
                    <div className="h-4 w-44 bg-gray-200/80 rounded" />
                    <div className="h-2 w-36 bg-gray-100 rounded-full" />
                  </div>
                  <div className="space-y-1.5 pr-4">
                    <div className="h-4 w-16 bg-gray-200/80 rounded" />
                    <div className="h-2.5 w-24 bg-gray-100 rounded" />
                  </div>
                  <div className="space-y-1.5 pr-4">
                    <div className="h-3.5 w-20 bg-gray-200/80 rounded" />
                    <div className="h-2.5 w-16 bg-gray-100 rounded" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="h-5 w-9 bg-gray-200/80 rounded-full" />
                    <div className="h-2.5 w-14 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Section: Your team & Multi-Bar Clustered Chart ────────── */}
      <div className="rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="h-5 w-24 bg-gray-200/80 rounded-md" />
          <div className="flex flex-wrap items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-7 w-16 bg-gray-100 rounded-full" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          {/* Team Members List (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl border border-gray-100 bg-[#FAFAFC]">
                <div className="w-9 h-9 rounded-full bg-gray-200/80 shrink-0" />
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="h-3 w-24 bg-gray-200/80 rounded" />
                  <div className="h-2.5 w-14 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Bar Activity Chart (9 cols) */}
          <div className="lg:col-span-9 flex flex-col justify-between h-[200px] pt-4">
            <div className="flex items-end justify-between gap-3 h-[160px] border-b border-gray-100 pb-2">
              {[40, 65, 30, 85, 50, 75, 45].map((h, i) => (
                <div key={i} className="flex-1 flex items-end justify-center gap-1.5 h-full">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-2.5 sm:w-3.5 bg-indigo-200/70 rounded-t-sm"
                  />
                  <div
                    style={{ height: `${Math.max(15, h - 20)}%` }}
                    className="w-2.5 sm:w-3.5 bg-rose-200/70 rounded-t-sm"
                  />
                  <div
                    style={{ height: `${Math.max(10, h - 35)}%` }}
                    className="w-2.5 sm:w-3.5 bg-amber-200/70 rounded-t-sm"
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-gray-300 pt-2 px-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                <span key={i} className="text-[11px] font-semibold text-gray-400">
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
