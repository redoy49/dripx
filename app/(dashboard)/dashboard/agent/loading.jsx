export default function AgentLoading() {
  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAFAFC] animate-pulse">
      {/* Left History Drawer Skeleton */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-gray-200/80 bg-white p-4 gap-3">
        <div className="h-9 w-full rounded-full bg-indigo-200/70" />
        <div className="h-3 w-24 rounded bg-gray-100 mt-2 ml-2" />
        <div className="space-y-2">
          <div className="h-8 w-full rounded-full bg-gray-100" />
          <div className="h-8 w-5/6 rounded-full bg-gray-100" />
          <div className="h-8 w-4/5 rounded-full bg-gray-100" />
        </div>
      </aside>

      {/* Main Agent Canvas Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="h-6 w-40 rounded-lg bg-gray-200/70" />
          <div className="h-7 w-28 rounded-full bg-gray-100" />
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-4 py-8">
          <div className="h-10 w-64 mx-auto rounded-xl bg-gray-200/70" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="h-20 rounded-2xl bg-white border border-gray-100" />
            <div className="h-20 rounded-2xl bg-white border border-gray-100" />
            <div className="h-20 rounded-2xl bg-white border border-gray-100" />
            <div className="h-20 rounded-2xl bg-white border border-gray-100" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <div className="h-28 w-full rounded-3xl bg-white border border-gray-200/90 shadow-2xs" />
        </div>
      </div>
    </div>
  );
}
