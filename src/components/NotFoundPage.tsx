import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Sparkles, Home, Wand2, ArrowRight, Search, RotateCw, Image as ImageIcon, Zap } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden">
      <SiteHeader />

      <main className="grain relative flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center">
        {/* Background Decorative Typographic Watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[30vw] font-black leading-none tracking-tighter text-foreground/[0.03] select-none select-none z-0"
        >
          404
        </div>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {/* Animated 404 Cutout Laser Badge */}
          <div className="relative mb-6">
            <div className="relative flex items-center justify-center rounded-3xl border-2 border-accent/40 bg-card/80 px-8 py-4 shadow-2xl backdrop-blur-md">
              <span className="halftone-text font-display text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-foreground">
                404
              </span>
              <span className="absolute -top-3 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg animate-bounce">
                <Sparkles className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            <span>Layer Missing · Background Removed</span>
          </div>

          <h1 className="mt-6 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Page Not Found<span className="text-accent">.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
            The page or asset you were searching for has been cut out, moved, or never existed in this workspace.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-8 py-4 text-sm sm:text-base font-bold text-background shadow-xl transition-all hover:scale-105"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Link>

            <Link
              to="/tools/$slug"
              params={{ slug: "remove-background" }}
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-border bg-card px-7 py-4 text-sm sm:text-base font-bold text-foreground shadow-md transition-all hover:scale-105 hover:border-foreground"
            >
              <Wand2 className="h-4 w-4 text-accent" />
              Try Background Remover
            </Link>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2.5 rounded-full border-2 border-accent/60 bg-card px-7 py-4 text-sm sm:text-base font-bold text-foreground shadow-md transition-all hover:scale-105 hover:border-accent"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              Ask Karudi 1.0 Prime
            </Link>
          </div>

          {/* Quick Tool Links Grid */}
          <div className="mt-14 w-full rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm shadow-sm">
            <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Explore Popular AI Image Tools
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Clean & Upscale", slug: "clean-upscale" },
                { name: "Rotate & Crop", slug: "rotate-crop" },
                { name: "Convert Formats", slug: "convert-compress" },
                { name: "Erase Watermark", slug: "remove-watermark" },
              ].map((tool) => (
                <Link
                  key={tool.slug}
                  to="/tools/$slug"
                  params={{ slug: tool.slug }}
                  className="rounded-xl border border-border bg-background/80 px-3.5 py-2.5 text-xs font-bold text-foreground transition-all hover:border-accent hover:text-accent hover:scale-[1.03] shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span>{tool.name}</span>
                  <ArrowRight className="h-3 w-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
