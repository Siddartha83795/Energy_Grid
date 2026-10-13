import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { PageTransition } from "@/components/PageTransition";
import { BottomNav } from "@/components/BottomNav";
import { EnergyAdvisorProvider } from "@/lib/energy-advisor-context";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {error?.message && (
          <p className="mt-3 text-xs font-mono text-red-400 bg-red-950/30 p-2 rounded border border-red-800/40 text-left overflow-auto max-h-24">
            {error.message}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GenAI Energy Advisor" },
      { name: "description", content: "AI-powered industrial energy efficiency dashboard" },
      { property: "og:title", content: "GenAI Energy Advisor" },
      { property: "og:description", content: "AI-powered industrial energy efficiency dashboard" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-[#F0F4F8] dark:bg-[#0A0E17] text-[#1E293B] dark:text-[#F8FAFC] antialiased selection:bg-[#3B82F6]/20 relative min-h-screen overflow-x-hidden transition-colors duration-300">
        {/* Anti-Gravity Floating Ambient Orbs (Dual Light/Dark Mode Canvas Layer) */}
        <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Orb 1: Soft Cloud Blue (Light) / Luminous Deep Sapphire-Cyan (Dark) */}
          <div className="antigravity-orb-1 absolute -top-24 -left-24 w-[540px] h-[540px] rounded-full bg-gradient-to-tr from-[#93C5FD]/45 to-[#BAE6FD]/35 dark:from-[#1E3A8A]/35 dark:to-[#0284C7]/25 blur-[90px] dark:blur-[110px]" />
          {/* Orb 2: Pale Lavender (Light) / Luminous Deep Ultraviolet-Indigo (Dark) */}
          <div className="antigravity-orb-2 absolute top-1/4 -right-28 w-[580px] h-[580px] rounded-full bg-gradient-to-bl from-[#E9D5FF]/50 to-[#DDD6FE]/35 dark:from-[#581C87]/35 dark:to-[#312E81]/25 blur-[100px] dark:blur-[120px]" />
          {/* Orb 3: Soft Periwinkle & Azure (Light) / Luminous Deep Emerald-Teal (Dark) */}
          <div className="antigravity-orb-3 absolute -bottom-32 left-1/4 w-[640px] h-[640px] rounded-full bg-gradient-to-tr from-[#C7D2FE]/40 to-[#BAE6FD]/30 dark:from-[#0F766E]/30 dark:to-[#1E3A8A]/25 blur-[110px] dark:blur-[130px]" />
        </div>

        {/* Global Content Layer */}
        <div className="relative z-10 min-h-screen">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <EnergyAdvisorProvider>
            <Shell />
            <Toaster richColors position="top-right" />
          </EnergyAdvisorProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const publicRoute =
    pathname === "/" ||
    pathname === "/auth" ||
    pathname === "/neumorphic" ||
    pathname === "/antigravity";

  if (publicRoute) return <Outlet />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    if (typeof window !== "undefined") window.location.replace("/auth");
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-transparent flex-col">
      <main className="flex-1 min-w-0 flex flex-col pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <AppHeader />
        <PageTransition pathname={pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <BottomNav />
    </div>
  );
}
