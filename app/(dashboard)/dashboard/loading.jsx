export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#FAFAFC] p-4 sm:p-6 lg:p-7 space-y-6 w-full max-w-full text-gray-800 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200/80 rounded-xl" />
          <div className="h-4 w-96 bg-gray-200/60 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-gray-200/70 rounded-full" />
          <div className="h-9 w-28 bg-gray-200/70 rounded-full" />
        </div>
      </div>

      {/* 2. Upper Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Card: Statistics */}
        <div className="lg:col-span-8 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="h-5 w-24 bg-gray-200 rounded-md" />
            <div className="h-4 w-16 bg-gray-200 rounded-md" />
          </div>

          {/* 4 Radial Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-gray-100" />
                <div className="h-3 w-12 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>

          {/* 3 Stat Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-gray-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-50 border border-gray-100" />
            ))}
          </div>
        </div>

        {/* Right Card: Activity Stream */}
        <div className="lg:col-span-4 rounded-3xl border border-gray-100 bg-white p-5 sm:p-6 space-y-4">
          <div className="h-5 w-32 bg-gray-200 rounded-md" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 bg-gray-200 rounded" />
                  <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Lower Chart Skeleton */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 h-72" />
    </div>
  );
}
