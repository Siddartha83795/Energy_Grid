import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signIn, signUp } from "@/lib/auth.functions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Energy Advisor" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/upload" });
  }, [user, loading, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn({ data: { email, password } });
      await refreshUser();
      toast.success("Welcome back");
      navigate({ to: "/upload" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signUp({ data: { email, password, fullName } });
      await refreshUser();
      toast.success("Account created — you're signed in");
      navigate({ to: "/upload" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="liquid-glass-root flex items-center justify-center min-h-screen relative p-4 bg-[#0A0D12] overflow-hidden">
      {/* Background ambient light streaks (reduced-motion safe) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#33D6A6]/10 blur-[120px] motion-safe:animate-pulse motion-safe:duration-[10000ms]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full bg-[#8C7EFF]/5 blur-[150px] motion-safe:animate-pulse motion-safe:duration-[15000ms]" />
      </div>

      <Button
        variant="glassSecondary"
        size="sm"
        className="absolute top-6 left-6 text-white/70 hover:text-white"
        onClick={() => navigate({ to: "/" })}
      >
        <ArrowLeft className="h-4 w-4" /> Back to landing
      </Button>

      <div className="w-full max-w-md glass-panel p-8 relative flow-seam relative z-10">
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="h-9 w-9 rounded-lg overflow-hidden border border-white/10">
              <img src="/favicon.png" alt="Energy Advisor" className="h-full w-full object-cover" />
            </div>
            <span className="font-display tracking-tight text-white text-lg font-bold">Energy Advisor</span>
          </Link>
          <h2 className="text-xl font-bold font-display mt-6 tracking-tight text-white">Sign In</h2>
          <p className="text-xs text-[#8D97A3] mt-1 text-center">
            Access the industrial energy control-room panel
          </p>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-white/5 border border-white/10 rounded-lg p-1">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs text-[#8D97A3] font-medium py-1.5 rounded-md transition-all cursor-pointer"
            >
              Sign in
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs text-[#8D97A3] font-medium py-1.5 rounded-md transition-all cursor-pointer"
            >
              Sign up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={onLogin} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="le" className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider">Email Address</Label>
                <Input
                  id="le"
                  type="email"
                  required
                  placeholder="e.g. supervisor@factory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#33D6A6] focus:ring-1 focus:ring-[#33D6A6]/20 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lp" className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider">Password</Label>
                </div>
                <Input
                  id="lp"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#33D6A6] focus:ring-1 focus:ring-[#33D6A6]/20 transition-all font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="glass"
                className="w-full font-bold font-display cursor-pointer mt-6 py-5"
                disabled={busy}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in to Dashboard"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={onSignup} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="sn" className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider">Full Name</Label>
                <Input
                  id="sn"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#33D6A6] focus:ring-1 focus:ring-[#33D6A6]/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="se" className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider">Email Address</Label>
                <Input
                  id="se"
                  type="email"
                  required
                  placeholder="e.g. supervisor@factory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#33D6A6] focus:ring-1 focus:ring-[#33D6A6]/20 transition-all font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sp" className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider">Password (min 6)</Label>
                <Input
                  id="sp"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#33D6A6] focus:ring-1 focus:ring-[#33D6A6]/20 transition-all font-mono"
                />
              </div>
              <Button
                type="submit"
                variant="glass"
                className="w-full font-bold font-display cursor-pointer mt-6 py-5"
                disabled={busy}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Control Panel Account"}
              </Button>
              <p className="text-[10px] text-[#8D97A3] text-center mt-3">
                Note: First account created automatically registers as administrator.
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
