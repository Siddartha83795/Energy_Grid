import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, LogOut, User as UserIcon, Shield, CheckCircle2 } from "lucide-react";
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
  const { user, loading, refreshUser, signOut } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      if (err) {
        if (err === "unverified_email") {
          toast.error(
            "Your Google email is unverified. Please verify your email before signing in.",
          );
        } else if (err === "invalid_state") {
          toast.error("Security validation failed (invalid OAuth state). Please try again.");
        } else {
          toast.error("Google authentication failed. Please try again.");
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const handleTabChange = (v: string) => {
    setTab(v as "login" | "signup");
    setPassword("");
  };

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

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const isPasswordValid = Object.values(rules).every(Boolean);

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      toast.error("Password does not meet complexity requirements");
      return;
    }
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
        className="absolute top-6 left-6 text-white/70 hover:text-white cursor-pointer"
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
            <span className="font-display tracking-tight text-white text-lg font-bold">
              Energy Advisor
            </span>
          </Link>
          <h2 className="text-xl font-bold font-display mt-6 tracking-tight text-white">
            {user ? "Active Session" : tab === "signup" ? "Create Account" : "Sign In"}
          </h2>
          <p className="text-xs text-[#8D97A3] mt-1 text-center">
            {user
              ? "You are currently logged in to this workspace"
              : tab === "signup"
                ? "Register to access the industrial energy control-room panel"
                : "Access the industrial energy control-room panel"}
          </p>
        </div>

        {user ? (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#8D97A3]">
                <span>Logged-in Account</span>
                <span className="inline-flex items-center gap-1 text-[#33D6A6] font-mono text-[10px] uppercase">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </span>
              </div>
              <div className="font-semibold text-white font-mono text-sm break-all">{user.email}</div>
              {user.fullName && (
                <div className="text-xs text-[#8D97A3]">{user.fullName}</div>
              )}
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-[#33D6A6]/10 text-[#33D6A6] border border-[#33D6A6]/20">
                {user.role || "Staff"}
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                variant="glass"
                className="w-full font-bold cursor-pointer py-5"
                onClick={() => navigate({ to: "/upload" })}
              >
                Continue to Workspace
              </Button>
              <Button
                variant="glassSecondary"
                className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer border-red-500/20"
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out successfully. You can now log in or create a new account.");
                }}
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out & Switch Account
              </Button>
            </div>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
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
            <div className="space-y-4 mt-6">
              <GoogleSignInButton />
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0D121B] px-3 text-[10px] font-mono uppercase tracking-wider text-[#8D97A3] relative z-10 shrink-0">
                  Or continue with email
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>
              <form onSubmit={onLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="le"
                    className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider"
                  >
                    Email Address
                  </Label>
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
                    <Label
                      htmlFor="lp"
                      className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider"
                    >
                      Password
                    </Label>
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
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="space-y-4 mt-6">
              <GoogleSignInButton />
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0D121B] px-3 text-[10px] font-mono uppercase tracking-wider text-[#8D97A3] relative z-10 shrink-0">
                  Or sign up with email
                </span>
                <div className="border-t border-white/10 w-full" />
              </div>
              <form onSubmit={onSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="sn"
                    className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider"
                  >
                    Full Name
                  </Label>
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
                  <Label
                    htmlFor="se"
                    className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider"
                  >
                    Email Address
                  </Label>
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
                  <Label
                    htmlFor="sp"
                    className="text-xs font-semibold text-[#8D97A3] uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  <Input
                    id="sp"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-[#33D6A6] focus:ring-1 focus:ring-[#33D6A6]/20 transition-all font-mono"
                  />

                  {password.length > 0 && (
                    <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg text-xs space-y-1.5 text-white/70">
                      <p className="font-semibold text-white/90">Password must contain:</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              rules.length
                                ? "text-emerald-400 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {rules.length ? "✓" : "✗"}
                          </span>
                          <span>8+ characters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              rules.uppercase
                                ? "text-emerald-400 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {rules.uppercase ? "✓" : "✗"}
                          </span>
                          <span>Uppercase (A-Z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              rules.lowercase
                                ? "text-emerald-400 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {rules.lowercase ? "✓" : "✗"}
                          </span>
                          <span>Lowercase (a-z)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={
                              rules.number
                                ? "text-emerald-400 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {rules.number ? "✓" : "✗"}
                          </span>
                          <span>Number (0-9)</span>
                        </div>
                        <div className="flex items-center gap-1.5 col-span-2">
                          <span
                            className={
                              rules.special
                                ? "text-emerald-400 font-bold"
                                : "text-rose-400 font-bold"
                            }
                          >
                            {rules.special ? "✓" : "✗"}
                          </span>
                          <span>Special character (e.g. !@#$%)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="glass"
                  className="w-full font-bold font-display cursor-pointer mt-6 py-5"
                  disabled={!isPasswordValid || busy}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create Control Panel Account"
                  )}
                </Button>
                <p className="text-[10px] text-[#8D97A3] text-center mt-3">
                  Note: First account created automatically registers as administrator.
                </p>
              </form>
            </div>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}

function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google/login";
  };

  return (
    <Button
      type="button"
      onClick={handleGoogleLogin}
      variant="glassSecondary"
      className="w-full font-semibold cursor-pointer py-5 flex items-center justify-center gap-2.5 text-white border-white/15 hover:border-[#38BDF8]/40 hover:bg-white/10 transition-all font-sans text-xs"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Continue with Google</span>
    </Button>
  );
}
