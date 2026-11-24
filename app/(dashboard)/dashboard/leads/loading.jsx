export default function LeadsLoading() {
  return (
    <div className="min-h-screen bg-[#F2F2F6] p-4 md:p-6 space-y-4 animate-pulse">
      {/* ── 1. Header Skeleton ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-7 w-24 bg-gray-200/80 rounded-xl" />
            <div className="h-5 w-24 bg-indigo-100 rounded-full" />
          </div>
          <div className="h-3 w-80 max-w-full bg-gray-200/50 rounded" />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="h-8 w-28 bg-gray-100 rounded-full border border-gray-200/60" />
          <div className="h-8 w-32 bg-indigo-200/80 rounded-full" />
          <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200/60" />
        </div>
      </div>

      {/* ── 2. Filter Toolbar Skeleton ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="h-8 flex-1 min-w-[220px] bg-gray-100 rounded-full border border-gray-200/70" />

          {/* 4 Filter Dropdowns */}
          <div className="h-8 min-w-[170px] bg-gray-100 rounded-full border border-gray-200/70" />
          <div className="h-8 min-w-[160px] bg-gray-100 rounded-full border border-gray-200/70" />
          <div className="h-8 min-w-[150px] bg-gray-100 rounded-full border border-gray-200/70" />
          <div className="h-8 min-w-[140px] bg-gray-100 rounded-full border border-gray-200/70" />
        </div>
      </div>

      {/* ── 3. Leads Table Skeleton ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/75">
                <th className="py-3 px-4 w-10 text-center">
                  <div className="w-4 h-4 rounded bg-gray-200 mx-auto" />
                </th>
                <th className="py-3 px-5">
                  <div className="h-3 w-16 bg-gray-200/80 rounded" />
                </th>
                <th className="py-3 px-5">
                  <div className="h-3 w-12 bg-gray-200/80 rounded" />
                </th>
                <th className="py-3 px-5">
                  <div className="h-3 w-10 bg-gray-200/80 rounded" />
                </th>
                <th className="py-3 px-5">
                  <div className="h-3 w-36 bg-gray-200/80 rounded" />
                </th>
                <th className="py-3 px-5 text-right">
                  <div className="h-3 w-12 bg-gray-200/80 rounded ml-auto" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <tr key={i}>
                  <td className="py-3.5 px-4 text-center">
                    <div className="w-4 h-4 rounded bg-gray-200/70 mx-auto" />
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200/80 shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3.5 w-32 bg-gray-200/80 rounded" />
                        <div className="h-3 w-44 bg-gray-100 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="h-5 w-20 bg-gray-100 rounded-full" />
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-14 bg-gray-100 rounded-md" />
                      <div className="h-5 w-12 bg-gray-100 rounded-md" />
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="space-y-1">
                      <div className="h-3.5 w-28 bg-gray-200/80 rounded" />
                      <div className="h-2.5 w-20 bg-gray-100 rounded" />
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-6 h-6 rounded-md bg-gray-100" />
                      <div className="w-6 h-6 rounded-md bg-gray-100" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── 4. Pagination Bar Skeleton ────────────────────────────────────── */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="h-3.5 w-48 bg-gray-200/60 rounded" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-gray-100 rounded-full" />
            <div className="h-8 w-8 bg-gray-200/80 rounded-full" />
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
            <div className="h-8 w-8 bg-gray-100 rounded-full" />
            <div className="h-8 w-16 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
