import type { ReactNode } from "react";

export function AppAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-[-10%] h-[640px] w-[980px] -translate-x-1/2 rounded-full bg-emerald-500/[0.09] blur-[140px]" />
      <div className="absolute -right-40 top-[28%] h-[420px] w-[420px] rounded-full bg-teal-500/[0.05] blur-[120px]" />
      <div className="absolute -left-32 bottom-[-5%] h-[380px] w-[480px] rounded-full bg-emerald-500/[0.05] blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse 85% 55% at 50% 0%, black 15%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(52,211,153,0.12), transparent 35%), radial-gradient(circle at 80% 70%, rgba(45,212,191,0.08), transparent 40%)",
        }}
      />
    </div>
  );
}

export function AppShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`mx-auto px-6 py-10 sm:py-12 ${wide ? "max-w-6xl" : "max-w-5xl"}`}>
      {children}
    </div>
  );
}

interface AppPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  meta?: ReactNode;
}

export function AppPageHeader({
  eyebrow,
  title,
  description,
  action,
  meta,
}: AppPageHeaderProps) {
  return (
    <div className="mb-10 sm:mb-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-6 bg-emerald-400/60" />
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-emerald-400/80">
              {eyebrow}
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/50">
              {description}
            </p>
          )}
          {meta && <div className="mt-5 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

interface AppStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "emerald" | "amber" | "white" | "cyan";
}

export function AppStatCard({
  label,
  value,
  hint,
  accent = "emerald",
}: AppStatCardProps) {
  const accents = {
    emerald: {
      wash: "from-emerald-500/15 via-emerald-500/[0.04] to-transparent",
      value: "text-emerald-300",
      dot: "bg-emerald-400",
    },
    amber: {
      wash: "from-amber-500/15 via-amber-500/[0.04] to-transparent",
      value: "text-amber-300",
      dot: "bg-amber-400",
    },
    cyan: {
      wash: "from-cyan-500/15 via-cyan-500/[0.04] to-transparent",
      value: "text-cyan-300",
      dot: "bg-cyan-400",
    },
    white: {
      wash: "from-white/10 via-white/[0.03] to-transparent",
      value: "text-white",
      dot: "bg-white/50",
    },
  }[accent];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accents.wash}`}
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${accents.dot}`} />
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            {label}
          </p>
        </div>
        <p className={`mt-3 text-3xl font-bold tracking-tight ${accents.value}`}>
          {value}
        </p>
        {hint && <p className="mt-1.5 text-xs text-white/40">{hint}</p>}
      </div>
    </div>
  );
}

interface AppEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AppEmptyState({
  icon,
  title,
  description,
  action,
}: AppEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-white/12 bg-gradient-to-b from-white/[0.04] to-transparent px-8 py-16 text-center sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.08),transparent_60%)]" />
      <HudCorners />
      <div className="relative">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_50px_rgba(16,185,129,0.12)]">
          {icon}
        </div>
        <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-white/50">
          {description}
        </p>
        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  );
}

interface AppPanelProps {
  children: ReactNode;
  className?: string;
  title?: string;
  badge?: string;
  action?: ReactNode;
}

export function AppPanel({
  children,
  className = "",
  title,
  badge,
  action,
}: AppPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]/70 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset] backdrop-blur-md ${className}`}
    >
      {(title || badge || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-3">
            {title && (
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                {title}
              </span>
            )}
            {badge && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-white/50">
                {badge}
              </span>
            )}
          </div>
          {action}
        </div>
      )}
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

/** Corner bracket decoration for video/cinematic frames */
export function HudCorners({ className = "" }: { className?: string }) {
  return (
    <>
      <span
        className={`pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-emerald-400/50 ${className}`}
      />
      <span
        className={`pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-emerald-400/50 ${className}`}
      />
      <span
        className={`pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-emerald-400/50 ${className}`}
      />
      <span
        className={`pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-emerald-400/50 ${className}`}
      />
    </>
  );
}

export function AppMetaChip({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "emerald" | "amber";
}) {
  const tones = {
    neutral: "border-white/10 bg-white/5 text-white/55",
    emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
