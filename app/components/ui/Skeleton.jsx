export function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={`animate-pulse bg-gray-200/70 rounded-md ${className}`}
      {...props}
    />
  );
}

export function SkeletonCircle({ size = "w-10 h-10", className = "", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gray-200/80 shrink-0 ${size} ${className}`}
      {...props}
    />
  );
}

export function SkeletonText({ className = "h-4 w-24", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/70 ${className}`}
      {...props}
    />
  );
}

export function SkeletonButton({ className = "h-8 w-24", ...props }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-gray-200/80 shrink-0 ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-2xl border border-gray-100/90 bg-white p-5 shadow-2xs ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
