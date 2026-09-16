import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Sparkles } from "lucide-react";
import { DottedThemeWave } from "@/components/DottedThemeWave";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const [waveState, setWaveState] = useState<{
    originX: number;
    originY: number;
    targetDark: boolean;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bg.theme.v1") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (waveState) return; // Ignore multiple rapid clicks during wave

    const nextTheme = theme === "light" ? "dark" : "light";
    const rect = btnRef.current?.getBoundingClientRect();
    const originX = e.clientX || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const originY = e.clientY || (rect ? rect.top + rect.height / 2 : 40);

    setWaveState({
      originX,
      originY,
      targetDark: nextTheme === "dark",
    });
  };

  const handleThemeSwitch = () => {
    if (!waveState) return;
    const nextTheme = waveState.targetDark ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("bg.theme.v1", nextTheme);
  };

  const handleWaveComplete = () => {
    setWaveState(null);
  };

  if (!mounted) {
    return (
      <div className="h-9 w-24 rounded-full border border-border bg-card/60 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <>
      {/* Dynamic Dotted Matrix Wave Canvas Overlay */}
      {waveState && (
        <DottedThemeWave
          originX={waveState.originX}
          originY={waveState.originY}
          isDark={waveState.targetDark}
          onThemeSwitch={handleThemeSwitch}
          onComplete={handleWaveComplete}
        />
      )}

      {/* Sleek Floating Pill Theme Switch with Wobbly Spring Physics */}
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        title={`Switch to ${isDark ? "Day Mode (Light)" : "Night Mode (Dark)"}`}
        aria-label={`Toggle theme. Currently ${isDark ? "Night" : "Day"} mode.`}
        className="wobbly-btn group relative flex h-9 items-center gap-2 rounded-full border border-border bg-card/90 px-2.5 py-1 shadow-sm backdrop-blur-md cursor-pointer hover:border-foreground/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* Animated Sliding Pill Indicator Thumb with Wobbly Physics */}
        <div
          className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark
              ? "bg-zinc-800 text-amber-300 shadow-sm border border-zinc-700/60 rotate-0 scale-100"
              : "bg-amber-500 text-white shadow-sm rotate-0 scale-100"
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-110" />
          ) : (
            <Sun className="h-3.5 w-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-90 group-hover:scale-110" />
          )}
        </div>

        {/* Text Label */}
        <span className="text-xs font-bold tracking-wide text-foreground/90 select-none transition-transform duration-300 group-hover:scale-105">
          {isDark ? "Night" : "Day"}
        </span>

        <Sparkles className="h-3 w-3 text-accent transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-125 group-hover:rotate-12" />
      </button>
    </>
  );
}
