import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Zap,
  ArrowRight,
  Upload,
  BarChart3,
  Sparkles,
  IndianRupee,
  Gauge,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Energy Advisor — Cut industrial energy waste with AI" },
      {
        name: "description",
        content:
          "AI-powered energy advisor for factories. Find idle machines, get prioritized actions, and save lakhs every month.",
      },
      { property: "og:title", content: "Energy Advisor — AI for industrial energy savings" },
      {
        property: "og:description",
        content: "Upload meter data, get prioritized GenAI recommendations to slash idle energy.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-10 backdrop-blur bg-background/80 border-b">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="h-9 w-9 rounded-lg overflow-hidden border">
              <img src="/favicon.png" alt="Energy Advisor" className="h-full w-full object-cover" />
            </div>
            Energy Advisor
          </Link>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="#features">Features</a>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <a href="#how">How it works</a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {theme === "light" && <Sun className="h-4 w-4" />}
                  {theme === "dark" && <Moon className="h-4 w-4" />}
                  {theme === "system" && <Monitor className="h-4 w-4" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                  <Sun className="h-4 w-4" /> Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                  <Moon className="h-4 w-4" /> Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" /> System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--primary)/0.12,_transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-6 py-24 lg:py-32 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" /> GenAI for industrial energy
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold tracking-tight">
            Stop paying for <span className="text-primary">idle machines.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your meter data, shift records, and machine schedules. Get a prioritized list of
            fixes — with monthly savings in kWh and ₹.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-3 max-w-xl mx-auto gap-6 text-center">
            <Stat value="22%" label="avg idle reduction" />
            <Stat value="₹4.2L" label="monthly savings" />
            <Stat value="< 5 min" label="to first insight" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center tracking-tight">
            Everything you need to cut waste
          </h2>
          <p className="text-center text-muted-foreground mt-2">
            Built for plant managers and energy teams.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Feature
              icon={Gauge}
              title="Idle detection"
              text="Pinpoint exactly which machines burn power between shifts and runs."
            />
            <Feature
              icon={Sparkles}
              title="AI recommendations"
              text="Plain-language actions, prioritized by impact and implementation effort."
            />
            <Feature
              icon={IndianRupee}
              title="Rupee-level ROI"
              text="Estimated monthly savings in ₹ — straight to your CFO-ready report."
            />
            <Feature
              icon={BarChart3}
              title="Visual dashboards"
              text="Per-machine breakdown, hourly trends, and utilization at a glance."
            />
            <Feature
              icon={ShieldCheck}
              title="Your data, your rules"
              text="CSV in, insights out. Plug into your existing meters and SCADA exports."
            />
            <Feature
              icon={Upload}
              title="Zero setup"
              text="No sensors. No integrations. Just drop three CSVs to begin."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-center tracking-tight">How it works</h2>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Step
              n={1}
              title="Sign in"
              text="Create your account in seconds and head to the upload page."
            />
            <Step
              n={2}
              title="Upload 3 CSVs"
              text="Meter readings, shift records, and machine schedules."
            />
            <Step
              n={3}
              title="Get AI insights"
              text="See your dashboard and download a CFO-ready PDF report."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ready to find your hidden savings?</h2>
          <p className="text-muted-foreground mt-3">
            Start your first analysis in under five minutes.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/auth">
              Sign in to get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © Energy Advisor
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Zap; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm hover:border-primary/40 transition-colors">
      <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{text}</p>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="grid place-items-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
        {n}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{text}</p>
    </div>
  );
}
