import type { ReactNode } from "react";

export function AppAmbient() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-emerald-500/[0.07] blur-[130px]" />
      <div className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-white/[0.03] blur-[100px]" />
      <div className="absolute -left-24 bottom-0 h-[360px] w-[360px] rounded-full bg-emerald-500/[0.04] blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 20%, transparent 70%)",
        }}
      />
    </div>
  );
}

interface AppPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function AppPageHeader({ eyebrow, title, description, action }: AppPageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-white/50 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface AppStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "emerald" | "amber" | "white";
}

export function AppStatCard({ label, value, hint, accent = "emerald" }: AppStatCardProps) {
  const accentClass =
    accent === "emerald"
      ? "from-emerald-500/10 to-transparent text-emerald-400"
      : accent === "amber"
        ? "from-amber-500/10 to-transparent text-amber-400"
        : "from-white/10 to-transparent text-white/60";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/15 hover:bg-white/[0.05]">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accentClass} opacity-60`} />
      <div className="relative">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-white/40">{hint}</p>}
      </div>
      <div className="pointer-events-none absolute right-3 top-3 h-8 w-8 rounded-full border border-white/5 bg-white/[0.02]" />
    </div>
  );
}

interface AppEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AppEmptyState({ icon, title, description, action }: AppEmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-500/[0.04] to-transparent" />
      <div className="relative">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-white/50 leading-relaxed">{description}</p>
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
}

export function AppPanel({ children, className = "", title, badge }: AppPanelProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-sm ${className}`}>
      {(title || badge) && (
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
          {title && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">{title}</span>
          )}
          {badge && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-white/50">
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

/** Corner bracket decoration for video/cinematic frames */
export function HudCorners({ className = "" }: { className?: string }) {
  return (
    <>
      <span className={`pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-emerald-400/50 ${className}`} />
      <span className={`pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-emerald-400/50 ${className}`} />
      <span className={`pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-emerald-400/50 ${className}`} />
      <span className={`pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-emerald-400/50 ${className}`} />
    </>
  );
}
