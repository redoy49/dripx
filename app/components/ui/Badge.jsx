const COLOR_MAP = {
  green: "bg-green-50 text-green-500",
  red: "bg-red-50 text-red-400",
  amber: "bg-amber-50 text-amber-500",
  gray: "bg-gray-100 text-gray-500",
  violet: "bg-violet-50 text-violet-500",
};

// Small pill badge, matching the "Active" status badge from the Teams page's StatCard.
export default function Badge({ children, color = "green" }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        COLOR_MAP[color] || COLOR_MAP.green
      }`}
    >
      {children}
    </span>
  );
}
