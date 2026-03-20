import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="font-bold text-lg">
            <span className="text-primary">Volley</span>Vision
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/login" />}>
              Sign in
            </Button>
            <Button size="sm" render={<Link href="/signup" />}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center py-24">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            AI-Powered Volleyball Coaching
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your personal
            <br />
            <span className="text-primary">volleyball coach</span>
            <br />
            powered by AI
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Upload your game footage and get instant AI analysis with technique
            breakdowns, coaching tips, and highlight reels ready to send to
            college scouts.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-8 text-base" render={<Link href="/signup" />}>
              Start Analyzing Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 text-base" render={<Link href="/login" />}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/30 py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight mb-4">
            Everything you need to level up
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            From practice footage to scouting tapes, VolleyVision gives you the
            tools to improve and get noticed.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-background p-8">
              <div className="text-3xl mb-4">🎥</div>
              <h3 className="text-lg font-semibold mb-2">Upload & Analyze</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Drop in your game or practice footage. Our AI watches every
                play and delivers a detailed breakdown of your technique,
                positioning, and decision-making.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-8">
              <div className="text-3xl mb-4">🏐</div>
              <h3 className="text-lg font-semibold mb-2">Get Coaching Tips</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Receive personalized feedback on your strengths and areas to
                improve, complete with specific drills and exercises to work on.
              </p>
            </div>

            <div className="rounded-xl border bg-background p-8">
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="text-lg font-semibold mb-2">Highlight Reels</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI automatically identifies your best plays — spikes, blocks,
                aces. Build shareable highlight tapes and send them straight to
                college coaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Ready to elevate your game?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join VolleyVision and let AI help you reach your full potential on the court.
          </p>
          <Button size="lg" className="px-8 text-base" render={<Link href="/signup" />}>
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">VolleyVision</span> &mdash;
            AI-Powered Volleyball Coaching
          </span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
