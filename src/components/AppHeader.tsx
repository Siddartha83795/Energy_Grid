import { useState } from "react";
import { useRouter, useRouterState, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Settings,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Monitor,
  Menu,
  Upload,
  PencilLine,
  LayoutDashboard,
  Sparkles,
  FileText,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "@/components/SettingsDialog";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/manual-entry", label: "Manual entry", icon: PencilLine },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ai-insights", label: "AI insights", icon: Sparkles },
  { to: "/report", label: "Report", icon: FileText },
] as const;

export function AppHeader() {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, isAdmin, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const canGoBack = pathname !== "/upload";

  return (
    <>
      <header className="h-14 border-b bg-card/60 backdrop-blur flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0 flex flex-col bg-card">
              <div className="flex items-center gap-2 px-5 h-16 border-b">
                <div className="h-9 w-9 rounded-lg overflow-hidden border">
                  <img
                    src="/favicon.png"
                    alt="Energy Advisor"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold leading-tight">Energy Advisor</div>
                  <div className="text-xs text-muted-foreground">GenAI insights</div>
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {navItems.map((it) => {
                  const active = pathname === it.to;
                  return (
                    <SheetClose asChild key={it.to}>
                      <Link
                        to={it.to}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        <it.icon className="h-4 w-4" />
                        {it.label}
                      </Link>
                    </SheetClose>
                  );
                })}
                {isAdmin && (
                  <SheetClose asChild>
                    <Link
                      to="/admin"
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors mt-4 border-t pt-4",
                        pathname === "/admin"
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <Shield className="h-4 w-4" />
                      Admin
                    </Link>
                  </SheetClose>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.history.back()}
            disabled={!canGoBack}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {isAdmin && (
            <Link
              to="/admin"
              className="ml-2 text-xs rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium"
            >
              Admin
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle theme">
                {theme === "light" && <Sun className="h-4 w-4" />}
                {theme === "dark" && <Moon className="h-4 w-4" />}
                {theme === "system" && <Monitor className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" /> Light
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" /> Dark
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("system")}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" /> System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Account">
                <UserIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-sm font-medium truncate">{user?.email}</div>
                <div className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "Staff"}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={signOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
