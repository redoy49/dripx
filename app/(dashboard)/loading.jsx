export default function DashboardRootLoading() {
  return (
    <div className="min-h-screen bg-gray-50/70 p-4 md:p-6 space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded-lg" />
        <div className="h-8 w-8 bg-gray-100 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 h-96" />
    </div>
  );
}
