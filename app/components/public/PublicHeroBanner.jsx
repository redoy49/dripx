const GRADIENT_THEMES = {
  home: "bg-[linear-gradient(180deg,#eef2ff_0%,#f0f9ff_38%,#fff7ed_72%,#ffffff_100%)]",
  features: "bg-[linear-gradient(180deg,#e0e7ff_0%,#f5f3ff_46%,#ffffff_100%)]",
  pricing: "bg-[linear-gradient(180deg,#ecfeff_0%,#eef2ff_48%,#ffffff_100%)]",
  about: "bg-[linear-gradient(180deg,#fffbeb_0%,#f8fafc_50%,#ffffff_100%)]",
  contact: "bg-[linear-gradient(180deg,#ecfdf5_0%,#eff6ff_46%,#ffffff_100%)]",
};

const GLOW_ACCENTS = {
  home: "from-indigo-200/45 via-sky-100/35 to-transparent",
  features: "from-indigo-300/35 via-violet-200/25 to-transparent",
  pricing: "from-cyan-200/40 via-indigo-200/25 to-transparent",
  about: "from-amber-200/40 via-orange-100/25 to-transparent",
  contact: "from-emerald-200/40 via-sky-200/25 to-transparent",
};

/**
 * Shared atmospheric top-to-bottom linear gradient header for all public pages,
 * layered with a subtle geometric square grid that fades downward into white.
 */
export default function PublicHeroBanner({
  variant = "features",
  title,
  description,
  children,
  bottomSpacing = "pb-16",
}) {
  const gradient = GRADIENT_THEMES[variant] || GRADIENT_THEMES.features;
  const glow = GLOW_ACCENTS[variant] || GLOW_ACCENTS.features;

  return (
    <section className={`relative overflow-hidden pt-32 ${bottomSpacing} ${gradient} text-slate-900`}>
      <div
        aria-hidden="true"
        className="bg-geometry-squares pointer-events-none absolute inset-0 opacity-85 [mask-image:linear-gradient(180deg,black_0%,rgba(0,0,0,0.45)_62%,transparent_100%)]"
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 h-[420px] w-[780px] rounded-full bg-gradient-to-b ${glow} blur-3xl`}
      />

      <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-semibold tracking-[-0.03em] text-slate-900 max-w-4xl mx-auto leading-[1.08]">
          {title}
        </h1>

        {description && (
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
