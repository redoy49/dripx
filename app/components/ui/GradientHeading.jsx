// Gradient page-title text, matching the pink-to-orange heading style
// (linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)) used on every dashboard page header.
export default function GradientHeading({ children, className = "text-2xl font-semibold" }) {
  return (
    <h1
      className={className}
      style={{
        background: "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
        WebkitBackgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </h1>
  );
}
