export default function InboxLoading() {
  return (
    <div className="h-full min-h-0 flex flex-col p-4 bg-[#F2F2F6] overflow-hidden animate-pulse">
      {/* ── Top Header Skeleton ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-36 bg-gray-200/80 rounded-xl" />
          <div className="h-5 w-32 bg-gray-100 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gray-100 border border-gray-200/60" />
          <div className="h-6 w-20 rounded-full bg-indigo-100/70" />
        </div>
      </div>

      {/* ── 3-Column Layout Skeleton ──────────────────────────────────────── */}
      <div className="grid grid-cols-[330px_1fr_310px] gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Column 1: Conversations List */}
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden flex flex-col min-h-0">
          {/* Search, Channels & Tabs */}
          <div className="p-3.5 border-b border-gray-100 space-y-3">
            {/* Search input skeleton */}
            <div className="h-8 w-full bg-gray-100 rounded-full border border-gray-200/70" />

            {/* Channel Badges Selector skeleton */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-full border border-gray-100">
              <div className="h-6 flex-1 bg-white rounded-full shadow-2xs" />
              <div className="h-6 flex-1 bg-gray-100/60 rounded-full" />
              <div className="h-6 flex-1 bg-gray-100/60 rounded-full" />
            </div>

            {/* Status Tabs skeleton */}
            <div className="flex items-center gap-5 px-1 pt-1">
              <div className="h-3 w-8 bg-indigo-300 rounded" />
              <div className="h-3 w-12 bg-gray-200/60 rounded" />
              <div className="h-3 w-14 bg-gray-200/60 rounded" />
              <div className="h-3 w-14 bg-gray-200/60 rounded" />
            </div>
          </div>

          {/* Conversation Items Skeleton */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50 p-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3 flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200/80" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-gray-300" />
                </div>
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="h-3.5 w-24 bg-gray-200/80 rounded" />
                    <div className="h-2.5 w-10 bg-gray-200/50 rounded" />
                  </div>
                  <div className="h-2.5 w-20 bg-gray-100 rounded" />
                  <div className="h-3 w-36 bg-gray-200/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Thread View Skeleton (Center) */}
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 flex flex-col relative overflow-hidden min-h-0">
          {/* Thread Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200/80 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-gray-200/80 rounded" />
                <div className="h-3 w-44 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-100" />
              <div className="w-7 h-7 rounded-full bg-gray-100" />
              <div className="w-7 h-7 rounded-full bg-gray-100" />
            </div>
          </div>

          {/* Message Stream Skeleton (Inbound & Outbound bubbles) */}
          <div className="flex-1 p-6 space-y-5 overflow-y-auto">
            {/* Inbound Message Bubble (Left) */}
            <div className="flex items-start gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-200/80 shrink-0 mt-1" />
              <div className="p-4 rounded-2xl bg-gray-100 space-y-2 flex-1">
                <div className="h-3.5 w-full bg-gray-200/70 rounded" />
                <div className="h-3.5 w-4/5 bg-gray-200/70 rounded" />
                <div className="h-3 w-1/2 bg-gray-200/50 rounded" />
              </div>
            </div>

            {/* Outbound Message Bubble (Right) */}
            <div className="flex items-start gap-3 max-w-[80%] ml-auto justify-end">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-2 flex-1">
                <div className="h-3.5 w-full bg-indigo-200/60 rounded" />
                <div className="h-3.5 w-3/4 bg-indigo-200/60 rounded" />
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-200 shrink-0 mt-1" />
            </div>

            {/* Inbound Reply Bubble (Left) */}
            <div className="flex items-start gap-3 max-w-[70%]">
              <div className="w-8 h-8 rounded-full bg-gray-200/80 shrink-0 mt-1" />
              <div className="p-4 rounded-2xl bg-gray-100 space-y-2 flex-1">
                <div className="h-3.5 w-3/4 bg-gray-200/70 rounded" />
                <div className="h-3 w-1/2 bg-gray-200/50 rounded" />
              </div>
            </div>
          </div>

          {/* Reply Box Composer Skeleton */}
          <div className="p-4 border-t border-gray-100 bg-white space-y-2.5">
            <div className="h-14 w-full bg-gray-100 rounded-xl" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-gray-100 rounded" />
              <div className="h-8 w-20 bg-indigo-200/80 rounded-full" />
            </div>
          </div>
        </div>

        {/* Column 3: Lead Detail Panel Skeleton (Right) */}
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden flex flex-col min-h-0 p-5 space-y-5">
          {/* Contact Profile Skeleton */}
          <div className="flex flex-col items-center text-center space-y-2.5 pb-4 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-200/80" />
            <div className="h-4 w-32 bg-gray-200/80 rounded" />
            <div className="h-3 w-40 bg-gray-100 rounded" />
            <div className="h-6 w-28 bg-gray-100 rounded-full" />
          </div>

          {/* Sequence Status Card */}
          <div className="p-4 rounded-xl border border-gray-100 bg-[#FAFAFC] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-gray-200/70 rounded" />
              <div className="h-5 w-16 bg-emerald-100 rounded-full" />
            </div>
            <div className="h-3.5 w-36 bg-gray-200/60 rounded" />
            <div className="h-7 w-full bg-gray-200/60 rounded-full" />
          </div>

          {/* Contact Details List */}
          <div className="space-y-3 pt-1">
            <div className="h-3 w-20 bg-gray-200/70 rounded" />
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1.5">
              <div className="h-2.5 w-12 bg-gray-200/50 rounded" />
              <div className="h-3.5 w-36 bg-gray-200/80 rounded" />
            </div>
            <div className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 space-y-1.5">
              <div className="h-2.5 w-12 bg-gray-200/50 rounded" />
              <div className="h-3.5 w-32 bg-gray-200/80 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
