export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-[#F2F2F6] p-4 animate-pulse">
      {/* ── Header Skeleton ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 mb-4 flex items-center justify-between gap-4">
        <div className="h-8 w-40 bg-gray-200/80 rounded-xl" />
        <div className="h-9 w-9 rounded-full bg-gray-200/80 border border-gray-200/60" />
      </div>

      {/* ── Toolbar + Table Container Skeleton ────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        {/* Toolbar */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] items-center gap-4 px-6 py-4 border-b border-gray-100">
          {/* Search bar */}
          <div className="h-8 max-w-sm w-full bg-gray-100 rounded-full border border-gray-200/70" />
          {/* Active only checkbox pill */}
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200/80" />
            <div className="h-3 w-20 bg-gray-200/60 rounded" />
          </div>
          <div className="flex-1" />
          {/* New Campaign button */}
          <div className="h-8 w-28 bg-indigo-200/80 rounded-full justify-self-end" />
        </div>

        {/* Table Column Headers */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-3 border-b border-gray-100 bg-gray-50/70 text-sm">
          <div className="h-3.5 w-16 bg-gray-200/80 rounded" />
          <div className="h-3.5 w-12 bg-gray-200/80 rounded" />
          <div className="h-3.5 w-16 bg-gray-200/80 rounded" />
          <div className="h-3.5 w-12 bg-gray-200/80 rounded justify-self-end" />
        </div>

        {/* Campaign Rows Skeleton */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-5 items-center gap-4"
            >
              {/* Overview & Progress Bar */}
              <div className="pr-8 space-y-2.5">
                <div className="h-4 w-44 bg-gray-200/80 rounded" />
                <div className="h-2 w-full max-w-sm bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className="h-full w-2/5 bg-emerald-200/80" />
                  <div className="h-full w-1/5 bg-cyan-200/80" />
                  <div className="h-full w-1/5 bg-orange-200/80" />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="h-3 w-20 bg-gray-200/60 rounded" />
                  <span className="text-gray-300">·</span>
                  <div className="h-3 w-20 bg-gray-200/60 rounded" />
                  <span className="text-gray-300">·</span>
                  <div className="h-3 w-24 bg-indigo-200/70 rounded" />
                </div>
              </div>

              {/* Leads & Channels */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
                  <div className="h-4 w-10 bg-indigo-200/80 rounded" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
                  <div className="h-3.5 w-24 bg-gray-200/70 rounded" />
                </div>
              </div>

              {/* Progress Detail */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
                  <div className="h-4 w-8 bg-gray-200/80 rounded" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="h-3.5 w-16 bg-gray-200/60 rounded" />
                  <div className="h-4 w-8 bg-gray-200/80 rounded" />
                </div>
              </div>

              {/* Status Toggle & Badge */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                  {/* Toggle switch skeleton */}
                  <div className="h-5 w-9 bg-gray-200/80 rounded-full" />
                  {/* Trash icon skeleton */}
                  <div className="w-5 h-5 bg-gray-100 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-12 bg-gray-200/60 rounded" />
                  <span className="text-gray-300">·</span>
                  <div className="h-3.5 w-8 bg-gray-200/60 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
