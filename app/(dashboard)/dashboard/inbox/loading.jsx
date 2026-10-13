export default function InboxLoading() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 animate-pulse">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div className="h-7 w-48 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>

      {/* 3-Column Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr_340px] gap-4 h-[calc(100vh-140px)]">
        {/* Column 1: Conversations List */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 space-y-3 flex flex-col">
          <div className="h-8 w-full bg-gray-100 rounded-lg" />
          <div className="h-7 w-full bg-gray-100 rounded-full" />
          <div className="space-y-3 pt-3 flex-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50/70">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-40 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Thread View */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-4 py-8">
            <div className="h-12 w-2/3 bg-gray-100 rounded-2xl" />
            <div className="h-14 w-3/4 bg-violet-50/70 rounded-2xl ml-auto" />
            <div className="h-10 w-1/2 bg-gray-100 rounded-2xl" />
          </div>
          <div className="h-12 w-full bg-gray-100 rounded-xl" />
        </div>

        {/* Column 3: Lead Detail Panel */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 space-y-4">
          <div className="flex flex-col items-center py-4 space-y-2 border-b border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-200" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-36 bg-gray-100 rounded" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-8 w-full bg-gray-50 rounded-lg" />
            <div className="h-8 w-full bg-gray-50 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
