import GradientHeading from "@/app/components/ui/GradientHeading";
import BellIcon from "@/app/components/ui/BellIcon";

// The white header bar (gradient title + bell button) repeated at the top of
// campaigns/inbox/teams/settings. New pages should use this instead of copy-pasting it again.
export default function PageHeaderCard({ title, unreadCount, children }) {
  return (
    <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between gap-4">
      <GradientHeading>{title}</GradientHeading>

      <div className="flex items-center gap-3">
        {children}

        <button className="relative p-2 transition-colors rounded-full hover:ring bg-gray-100 hover:ring-gray-200">
          <BellIcon />

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-400 text-[10px] text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
