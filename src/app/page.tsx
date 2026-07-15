import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DemoButton } from "@/components/demo-button";
import { LandingHeroHud } from "@/components/landing-hero-hud";
import { LandingClipsFeature } from "@/components/landing-clips-feature";
import { LandingFilmTags } from "@/components/landing-film-tags";
import { LandingFaq } from "@/components/landing-faq";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";

const NAV_LINKS = ["Features", "How it works", "FAQ"];

const TRACKING_POINTS = [
  "Approach timing, arm swing, and footwork",
  "Positioning and decision-making by rally",
  "Moments you'd miss scrubbing at 1x",
  "Key plays tagged with timestamps",
  "Clips cut and ready after every upload",
];

const HIGHLIGHT_STATS = [
  { label: "Spikes", count: 24, color: "text-red-400" },
  { label: "Blocks", count: 11, color: "text-blue-400" },
  { label: "Aces", count: 6, color: "text-emerald-400" },
  { label: "Digs", count: 18, color: "text-amber-400" },
];

export default function LandingPage() {
  return (
    <div className="dark flex min-h-screen flex-col bg-[#050508] text-white">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="logo-emerald flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-black">
              VV
            </div>
            <span className="text-sm font-bold tracking-[0.2em] uppercase">VolleyVision</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/ /g, "-")}`}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5" render={<Link href="/login" />}>
              Log In
            </Button>
            <Button size="sm" className="btn-emerald px-5" render={<Link href="/signup" />}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-28 pb-16 sm:pt-32 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-emerald-500/8 blur-[120px]" />
          <div className="absolute left-1/2 top-[55%] h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/6 blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-emerald-400/80">
              VolleyVision
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl lg:leading-[1.05]">
              Stop scrubbing tape.
              <br />
              <span className="text-gradient-emerald">Start fixing technique.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-base text-white/50 sm:text-lg leading-relaxed">
              Drop in practice or match film. Get clear notes on approach, positioning, and
              decisions — plus clips you can send to coaches and scouts.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" className="btn-emerald px-8" render={<Link href="/signup" />}>
                Upload your film
              </Button>
              <DemoButton
                variant="outline"
                className="rounded-full border-white/20 bg-transparent px-8 text-white hover:bg-white/5"
              />
            </div>
          </Reveal>

          <Reveal delay={280}>
            <div className="relative mt-12">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-emerald-500/10 blur-3xl" />
              <LandingHeroHud />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Data points */}
      <section id="features" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">Data Points</p>
              <h2 className="text-5xl font-bold tracking-tight sm:text-6xl">
                <CountUp end={50000} suffix="+" className="text-gradient-emerald" />
              </h2>
              <p className="mt-5 max-w-md text-white/50 leading-relaxed">
                Like a coach on every inch of the court. Technique notes you&apos;d never catch
                scrubbing through the tape alone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-emerald-500/20 hover:bg-white/[0.03]">
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-white/40">Precision Tracking</p>
              <ul className="space-y-3">
                {TRACKING_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/60">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Clip extraction */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <LandingClipsFeature />
          </Reveal>
        </div>
      </section>

      {/* Highlight detection */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mb-12 max-w-xl">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">Highlights</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Every key moment, tagged.</h2>
              <p className="mt-4 text-white/50 leading-relaxed">
                Spikes, blocks, aces, and digs land with timestamps — then cut into clips you can
                review, download, and share.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHT_STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 80}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.04]">
                  <p className={`text-4xl font-bold ${stat.color}`}>
                    <CountUp end={stat.count} />
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/40">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Computer vision + AI assistant */}
      <section id="how-it-works" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2">
          <Reveal>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">On the court</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Track every movement.</h2>
              <p className="mt-4 text-white/50 leading-relaxed">
                Follow positioning, approach patterns, and technique through the rally.
                Then get notes on timing, footwork, and the choices that cost points.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Approach", val: "4-step" },
                  { label: "Jump", val: "0.82m" },
                  { label: "Arm Speed", val: "12.4 m/s" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center transition-colors hover:border-emerald-500/20">
                    <p className="font-mono text-lg font-bold text-emerald-400">{m.val}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">Film room</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Hours of film. Minutes of notes.</h2>
              <p className="mt-4 text-white/50 leading-relaxed">
                Plays get tagged, technique gets flagged, and the best moments rise to the top —
                so you leave the film session with something to run in practice.
              </p>
              <div className="mt-8">
                <LandingFilmTags />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Coaching cards preview */}
      <section className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="mb-12 text-center">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">Coaching notes</p>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What&apos;s working. What to drill next.</h2>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { tag: "Strength", title: "Approach Timing", body: "Consistent 4-step approach on outside sets with good rhythm.", border: "border-emerald-400/20 bg-emerald-400/5", tagColor: "text-emerald-400/70" },
              { tag: "Improve", title: "Block Footwork", body: "Late lateral movement on quick middle sets.", border: "border-amber-400/20 bg-amber-400/5", tagColor: "text-amber-400/70" },
              { tag: "Drill", title: "Mirror Footwork Ladder", body: "3 sets × 10 reps — focus on first-step explosiveness.", border: "border-white/10 bg-white/[0.02]", tagColor: "text-white/40" },
            ].map((card, i) => (
              <Reveal key={card.tag} delay={i * 80}>
                <div className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 ${card.border}`}>
                  <p className={`mb-3 font-mono text-[10px] uppercase tracking-wider ${card.tagColor}`}>{card.tag}</p>
                  <p className="font-semibold text-white/90">{card.title}</p>
                  <p className="mt-2 text-sm text-white/50">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-white/5 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">FAQ</h2>
          </Reveal>
          <Reveal delay={80}>
            <LandingFaq />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/5 px-6 py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[100px]" />
        </div>
        <Reveal>
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight">
              More time playing,
              <br />
              <span className="text-white/50">less time analyzing.</span>
            </h2>
            <p className="mt-5 text-white/40">Match film broken down before the next practice.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="btn-emerald px-8" render={<Link href="/signup" />}>
                Upload your film
              </Button>
              <DemoButton variant="outline" className="rounded-full border-white/20 bg-transparent px-8 text-white hover:bg-white/5" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="logo-emerald flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-black">VV</div>
            <span className="text-sm font-bold tracking-[0.15em] uppercase">VolleyVision</span>
          </div>
          <p className="text-xs text-white/30">Film analysis for volleyball</p>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} VolleyVision</p>
        </div>
      </footer>
    </div>
  );
}
