export function FlowCanvasSkeleton() {
  return (
    <div className="relative w-full h-[74vh] rounded-b-2xl bg-[#FAFAFC] overflow-hidden animate-pulse select-none">
      {/* Background grid dots simulation */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(#dedde6 1.2px, transparent 1.2px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* ── Left Sidebar: Step Type Action Picker Skeleton ────────────────── */}
      <div className="absolute top-5 left-5 z-10 w-60 rounded-2xl border border-gray-100/90 bg-white p-3.5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="h-3.5 w-24 bg-gray-200/80 rounded" />
          <div className="h-2.5 w-12 bg-gray-200/50 rounded" />
        </div>

        {/* Section 1: Email Outreach */}
        <div className="space-y-2">
          <div className="h-2.5 w-20 bg-gray-200/60 rounded uppercase" />
          <div className="space-y-1.5">
            <div className="p-2 rounded-xl border border-gray-100 bg-[#FAFAFC] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-100" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-20 bg-gray-200/80 rounded" />
                <div className="h-2 w-28 bg-gray-200/50 rounded" />
              </div>
            </div>
            <div className="p-2 rounded-xl border border-gray-100 bg-[#FAFAFC] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-indigo-100" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-24 bg-gray-200/80 rounded" />
                <div className="h-2 w-24 bg-gray-200/50 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: LinkedIn Actions */}
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-gray-200/60 rounded uppercase" />
          <div className="space-y-1.5">
            <div className="p-2 rounded-xl border border-gray-100 bg-[#FAFAFC] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sky-100" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-28 bg-gray-200/80 rounded" />
                <div className="h-2 w-20 bg-gray-200/50 rounded" />
              </div>
            </div>
            <div className="p-2 rounded-xl border border-gray-100 bg-[#FAFAFC] flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-sky-100" />
              <div className="space-y-1 flex-1">
                <div className="h-3 w-20 bg-gray-200/80 rounded" />
                <div className="h-2 w-24 bg-gray-200/50 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Logic & Delays */}
        <div className="space-y-2">
          <div className="h-2.5 w-20 bg-gray-200/60 rounded uppercase" />
          <div className="p-2 rounded-xl border border-gray-100 bg-[#FAFAFC] flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-amber-100" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-20 bg-gray-200/80 rounded" />
              <div className="h-2 w-24 bg-gray-200/50 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Top-Right Floating Controls Skeleton ──────────────────────────── */}
      <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
        <div className="h-9 w-24 rounded-full bg-white border border-gray-200/90 shadow-md" />
        <div className="h-9 w-28 rounded-full bg-white border border-gray-200/90 shadow-md" />
        <div className="h-9 w-24 rounded-full bg-indigo-200/80 shadow-md" />
      </div>

      {/* ── Center Canvas Graph Nodes Skeleton ─────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {/* Node 1: Start / Trigger Root Node */}
        <div className="w-56 p-3.5 rounded-2xl border border-gray-200/90 bg-white shadow-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center" />
          <div className="space-y-1 flex-1">
            <div className="h-3 w-20 bg-gray-200/80 rounded" />
            <div className="h-2.5 w-28 bg-gray-200/50 rounded" />
          </div>
        </div>

        {/* Connecting Line 1 */}
        <div className="w-0.5 h-8 bg-gray-300/80 my-1 relative">
          <div className="absolute bottom-0 -left-1 w-2.5 h-2.5 border-b-2 border-r-2 border-gray-300 transform rotate-45" />
        </div>

        {/* Node 2: Delay Wait Timer Pill */}
        <div className="px-4 py-1.5 rounded-full border border-gray-200/90 bg-white shadow-sm flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-100" />
          <div className="h-3 w-20 bg-gray-200/80 rounded" />
        </div>

        {/* Connecting Line 2 */}
        <div className="w-0.5 h-8 bg-gray-300/80 my-1 relative">
          <div className="absolute bottom-0 -left-1 w-2.5 h-2.5 border-b-2 border-r-2 border-gray-300 transform rotate-45" />
        </div>

        {/* Node 3: Step Action Card (Cold Email) */}
        <div className="w-64 p-4 rounded-2xl border border-gray-200/90 bg-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-100" />
              <div className="h-3.5 w-24 bg-gray-200/80 rounded" />
            </div>
            <div className="h-4 w-12 bg-emerald-100 rounded-full" />
          </div>
          <div className="h-3 w-40 bg-gray-200/60 rounded" />
          <div className="h-2 w-48 bg-gray-200/40 rounded" />
        </div>

        {/* Connecting Line 3 */}
        <div className="w-0.5 h-8 bg-gray-300/80 my-1 relative">
          <div className="absolute bottom-0 -left-1 w-2.5 h-2.5 border-b-2 border-r-2 border-gray-300 transform rotate-45" />
        </div>

        {/* Node 4: Add Step Button Pill */}
        <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 bg-white flex items-center justify-center shadow-xs">
          <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* ── Bottom-Right Canvas Controls Widget ───────────────────────────── */}
      <div className="absolute bottom-5 right-5 z-10 rounded-2xl border border-gray-100/90 bg-white p-1.5 shadow-lg flex flex-col gap-1.5">
        <div className="w-7 h-7 rounded-full bg-gray-100" />
        <div className="w-7 h-7 rounded-full bg-gray-100" />
        <div className="w-7 h-7 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

export default function NewCampaignLoading() {
  return (
    <div className="min-h-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse">
      {/* ── Tabs Header Skeleton ──────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="grid grid-cols-3">
          {[
            { label: "1. Add Leads", sub: "Import or select prospects" },
            { label: "2. Create a Sequence", sub: "Design multi-channel flow", active: true },
            { label: "3. Settings", sub: "Schedules & limits" },
          ].map((tab, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 flex items-center gap-3 border-b-2 ${
                tab.active ? "border-indigo-400 bg-indigo-50/20" : "border-transparent bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  tab.active ? "bg-indigo-100" : "bg-gray-100"
                }`}
              />
              <div className="space-y-1 min-w-0">
                <div
                  className={`h-4 w-28 rounded ${
                    tab.active ? "bg-indigo-300/80" : "bg-gray-200/80"
                  }`}
                />
                <div className="h-2.5 w-36 bg-gray-200/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Flow Canvas Area Skeleton ───────────────────────────────────────── */}
      <FlowCanvasSkeleton />
    </div>
  );
}
