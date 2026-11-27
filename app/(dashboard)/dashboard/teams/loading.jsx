export function MembersTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/90 shadow-2xs animate-pulse">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] bg-gray-50/70 px-5 py-3 text-xs font-bold text-gray-500">
        <div className="h-3.5 w-16 bg-gray-200/80 rounded" />
        <div className="h-3.5 w-12 bg-gray-200/80 rounded" />
        <div className="h-3.5 w-14 bg-gray-200/80 rounded" />
        <div className="h-3.5 w-16 bg-gray-200/80 rounded" />
        <div className="h-3.5 w-14 bg-gray-200/80 rounded justify-self-end" />
      </div>

      {/* Member Rows */}
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center px-5 py-4 gap-4"
          >
            {/* Member info */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200/80 shrink-0" />
              <div className="space-y-1">
                <div className="h-3.5 w-32 bg-gray-200/80 rounded" />
                <div className="h-2.5 w-40 bg-gray-200/50 rounded" />
              </div>
            </div>

            {/* Role select */}
            <div>
              <div className="h-7 w-24 bg-gray-100 rounded-full border border-gray-200/60" />
            </div>

            {/* Status badge */}
            <div>
              <div className="h-5 w-16 bg-emerald-100 rounded-full" />
            </div>

            {/* AI Agent toggle */}
            <div>
              <div className="h-6 w-11 bg-gray-100 rounded-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <div className="w-6 h-6 rounded-md bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamsProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Section Card */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden p-6 space-y-6">
        {/* Top: Avatar, Name & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gray-200/80 shrink-0 border border-gray-200/90 shadow-2xs" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-5 w-40 bg-gray-200/80 rounded" />
                <div className="w-6 h-6 rounded-full bg-gray-100" />
              </div>
              <div className="h-3 w-64 bg-gray-200/50 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-8 w-36 bg-gray-100 rounded-full border border-gray-200/60" />
            <div className="h-8 w-28 bg-indigo-200/80 rounded-full" />
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs space-y-3"
            >
              <div className="h-3 w-24 bg-gray-200/60 rounded uppercase" />
              <div className="flex items-center justify-between">
                <div className="h-5 w-20 bg-gray-200/80 rounded" />
                <div className="h-4 w-14 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* 6 Overview Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-gray-200/90 rounded-2xl bg-white shadow-2xs overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-5 border-r border-gray-100 last:border-r-0 space-y-3">
              <div className="h-3 w-20 bg-gray-200/60 rounded uppercase" />
              <div className="h-7 w-12 bg-gray-200/80 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Outreach Activity Card Skeleton */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="h-5 w-36 bg-gray-200/80 rounded" />
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="h-8 w-60 bg-gray-100 rounded-full" />
            <div className="h-8 w-28 bg-gray-100 rounded-full" />
            <div className="h-8 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>

        {/* Outreach Activity Bar Chart Skeleton */}
        <div className="pt-4 flex items-end justify-between gap-4 h-[260px] border-b border-gray-100 pb-2 px-4">
          {[45, 70, 35, 85, 55, 75, 50].map((h, i) => (
            <div key={i} className="flex-1 flex items-end justify-center gap-1 h-full">
              <div style={{ height: `${h}%` }} className="w-2.5 bg-indigo-200/70 rounded-full" />
              <div style={{ height: `${Math.max(20, h - 18)}%` }} className="w-2.5 bg-violet-200/70 rounded-full" />
              <div style={{ height: `${Math.max(15, h - 30)}%` }} className="w-2.5 bg-sky-200/70 rounded-full" />
              <div style={{ height: `${Math.max(25, h - 10)}%` }} className="w-2.5 bg-emerald-200/70 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent p-4 sm:p-6 space-y-6 animate-pulse">
      {/* ── Top Header Skeleton ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-7 w-40 bg-gray-200/80 rounded-xl" />
          <div className="h-5 w-20 bg-indigo-50 rounded-full" />
        </div>
        <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200/60" />
      </div>

      {/* ── Sub-tabs Skeleton ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-full border border-gray-200/90 bg-white shadow-2xs gap-1">
          <div className="h-7 w-24 bg-indigo-300 rounded-full" />
          <div className="h-7 w-24 bg-gray-100 rounded-full" />
        </div>
      </div>

      {/* Profile & Overview Skeleton */}
      <TeamsProfileSkeleton />
    </div>
  );
}
