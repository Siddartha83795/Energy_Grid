import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { getPathIndex } from "@/lib/navigation";

export function PageTransition({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [outgoingHtml, setOutgoingHtml] = useState<string | null>(null);
  const [outgoingKey, setOutgoingKey] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string>(pathname);
  const timeoutRef = useRef<number | null>(null);

  // Track prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useLayoutEffect(() => {
    const prevPath = prevPathRef.current;
    if (prevPath === pathname) {
      return;
    }

    if (prefersReducedMotion) {
      prevPathRef.current = pathname;
      return;
    }

    // Determine transition direction using NAV_ORDER indexes
    const prevIdx = getPathIndex(prevPath);
    const newIdx = getPathIndex(pathname);
    let newDirection: "forward" | "backward" = "forward";
    if (prevIdx !== -1 && newIdx !== -1) {
      newDirection = newIdx > prevIdx ? "forward" : "backward";
    }

    // Snapshot the outgoing DOM tree's inner content
    if (containerRef.current) {
      setOutgoingHtml(containerRef.current.innerHTML);
      setOutgoingKey(prevPath + "-" + Date.now());
    }

    setDirection(newDirection);
    setIsTransitioning(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    prevPathRef.current = pathname;

    // Fast page flip transition of 280ms
    timeoutRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      setOutgoingHtml(null);
      setOutgoingKey(null);
    }, 280);
  }, [pathname, prefersReducedMotion]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (prefersReducedMotion) {
    return <div className="flex-1 min-w-0 w-full h-full">{children}</div>;
  }

  const isForward = direction === "forward";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden perspective-container flex-1 min-w-0"
    >
      {/* Outgoing snapshot layer */}
      {outgoingHtml && (
        <div
          key={outgoingKey || "outgoing"}
          className={cn(
            "transition-page-container pointer-events-none select-none",
            isForward ? "animate-exit-forward" : "animate-exit-backward",
          )}
          dangerouslySetInnerHTML={{ __html: outgoingHtml }}
        />
      )}

      {/* Incoming active React page layer */}
      <div
        key={pathname}
        className={cn(
          "w-full h-full",
          isTransitioning && "transition-page-container",
          isTransitioning && (isForward ? "animate-enter-forward" : "animate-enter-backward"),
        )}
      >
        {children}
      </div>
    </div>
  );
}
