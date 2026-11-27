export function IntegrationsSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-5 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-50" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 rounded bg-gray-200/80" />
                  <div className="h-3 w-48 rounded bg-gray-100" />
                </div>
              </div>
              <div className="h-5 w-20 rounded-full bg-gray-100" />
            </div>
            <div className="h-9 w-36 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SequenceTemplatesSkeleton() {
  return (
    <div className="space-y-8 p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-5 w-56 rounded bg-gray-200/80" />
          <div className="h-3 w-80 max-w-full rounded bg-gray-100" />
        </div>
        <div className="h-9 w-36 rounded-full bg-indigo-200/80" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-44 rounded bg-gray-200/80" />
              <div className="h-5 w-16 rounded-full bg-indigo-50" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-100" />
              <div className="h-3 w-3/4 rounded bg-gray-100" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-8 w-28 rounded-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AiProvidersSkeleton() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl space-y-6 animate-pulse">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-5 w-60 rounded bg-gray-200/80" />
          <div className="h-3 w-80 max-w-full rounded bg-gray-100" />
        </div>
        <div className="h-6 w-32 rounded-full bg-emerald-50" />
      </div>

      <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="h-4 w-40 rounded bg-gray-200/70" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-10 rounded-full bg-gray-100" />
          <div className="h-10 rounded-full bg-gray-100" />
        </div>
        <div className="h-9 w-36 rounded-full bg-indigo-200/80" />
      </div>

      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-100" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded bg-gray-200/80" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
