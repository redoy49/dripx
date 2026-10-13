export default function LeadsLoading() {
  return (
    <div className="min-h-screen bg-gray-50/70 p-4 md:p-6 space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="h-7 w-48 bg-gray-200 rounded-lg" />
          <div className="h-3.5 w-80 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-28 bg-gray-100 rounded-xl" />
          <div className="h-8 w-28 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-8 flex-1 min-w-[220px] bg-gray-100 rounded-xl" />
          <div className="h-8 w-36 bg-gray-100 rounded-xl" />
          <div className="h-8 w-36 bg-gray-100 rounded-xl" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden p-6 space-y-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100" />
              <div className="space-y-1">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-48 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-28 bg-gray-100 rounded" />
            <div className="h-5 w-20 bg-gray-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
