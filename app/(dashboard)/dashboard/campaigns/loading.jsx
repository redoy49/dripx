export default function CampaignsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div className="h-8 w-36 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="h-9 w-64 bg-gray-100 rounded-xl" />
          <div className="h-9 w-32 bg-gray-200 rounded-full" />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-3 border-b border-gray-100 bg-gray-50/70">
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
          <div className="h-4 w-12 bg-gray-200 rounded justify-self-end" />
        </div>

        {/* Rows */}
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-5 items-center gap-4">
              <div className="space-y-1.5">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-16 bg-gray-100 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded-full" />
              <div className="h-6 w-14 bg-gray-100 rounded-full justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
