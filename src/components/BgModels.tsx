import { bgModels } from "@/lib/bg-models";

export function BgModels({ compact = false }: { compact?: boolean }) {
  return (
    <section id="models" className="w-full border-t border-border px-6 py-20 md:px-12 md:py-28">
      <div className="w-full">
        <p className="font-display text-xs font-bold uppercase tracking-[0.35em] text-muted-foreground">
          AI Model Suite
        </p>
        <h2 className="mt-4 max-w-5xl font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">
          Five specialized engines. Orchestrated by universal intelligence
          <span className="text-accent">.</span>
        </h2>
        {!compact ? (
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            From precision background removal and format conversion to OCR, AI summaries, meme generation, and deep research.
          </p>
        ) : null}

        <div className="mt-14 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
          {bgModels.map((m, i) => {
            const Icon = m.icon;
            return (
              <article
                key={m.id}
                style={{ animationDelay: `${i * 80}ms` }}
                className="tool-card rise-in flex flex-col justify-between rounded-3xl border border-border bg-card p-8 md:p-10 shadow-sm transition-all hover:border-foreground/50 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-5">
                    <span className="tool-icon relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                      <Icon className="relative z-10 h-7 w-7" strokeWidth={1.8} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-bold md:text-3xl leading-tight text-foreground">{m.name}</h3>
                      <p className="mt-1 text-xs md:text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {m.specialty}
                      </p>
                    </div>
                  </div>
                  <p className="mt-7 text-base md:text-lg font-bold text-foreground">{m.quality}</p>
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-muted-foreground">{m.blurb}</p>
                </div>
                <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm font-semibold text-muted-foreground">
                  {m.traits.map((t) => (
                    <li key={t} className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-foreground/70 shrink-0" />
                      <span className="text-foreground/90">{t}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
