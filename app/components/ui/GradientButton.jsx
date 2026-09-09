// Primary gradient CTA button, matching the "New campaign" / "Sign in" buttons
// (linear-gradient(to right, #7f64f5, #ae79f8)) reused across campaigns/teams/inbox.
export default function GradientButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      style={{ background: "linear-gradient(to right, #7f64f5, #ae79f8)" }}
    >
      {children}
    </button>
  );
}
