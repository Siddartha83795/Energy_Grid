import React, { useEffect, useState, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS, NAV_ORDER } from "@/lib/navigation";

// Combine and sort all navigation items in correct order
const ALL_NAV_ITEMS = [
  ...PRIMARY_NAV_ITEMS,
  ...SECONDARY_NAV_ITEMS,
].sort((a, b) => {
  const indexA = NAV_ORDER.indexOf(a.to as any);
  const indexB = NAV_ORDER.indexOf(b.to as any);
  return indexA - indexB;
});

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Track window scroll height to activate the glass layout only when scrolled
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll active tab into center view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [pathname]);

  return (
    <nav
      className={cn(
        "fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-fit max-w-[95%] z-50 h-16 rounded-full nav-pop-transition pointer-events-auto overflow-hidden",
        isScrolled
          ? "bg-card/85 backdrop-blur-md border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          : "bg-transparent border-transparent shadow-none"
      )}
    >
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1 h-full w-full overflow-x-auto scrollbar-none px-4 flex-nowrap"
      >
        {ALL_NAV_ITEMS.map((item) => {
          // If it is admin-only and the user is not admin, hide it
          if ("isAdminOnly" in item && item.isAdminOnly && !isAdmin) return null;

          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              data-active={active}
              className={cn(
                "flex items-center justify-center h-full select-none text-[11px] tracking-tight transition-all shrink-0 px-0.5",
                active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "px-3.5 py-2 rounded-full transition-all flex items-center justify-center gap-1.5",
                  active ? "bg-primary/15 text-primary scale-105" : "bg-transparent text-current"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
