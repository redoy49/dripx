// Segmented progress bar, extracted from the Campaigns table row
// (each segment: { color: "bg-green-500", value: 40 } where value is a percentage width).
export default function ProgressBar({ segments }) {
  return (
    <div className="flex w-full h-1.5 rounded-full overflow-hidden gap-px bg-gray-100">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`${seg.color} h-full`}
          style={{ width: `${seg.value}%` }}
        />
      ))}
    </div>
  );
}
