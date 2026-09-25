import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { LanguageTranslator } from "@/components/LanguageTranslator";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Github,
  Twitter,
  Disc as Discord,
  Linkedin,
  Mail,
  Heart,
} from "lucide-react";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Subscribed! You'll receive AI product updates & credit drops.");
    setEmail("");
  };

  return (
    <footer className="w-full border-t border-border bg-card/60 text-foreground transition-colors">
      {/* Top Banner: Newsletter & Live Status */}
      <div className="border-b border-border bg-muted/30 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10">
        <div className="w-full flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All 5 AI Models Online • 99.9% Uptime</span>
            </div>
            <h3 className="mt-3 font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              Stay ahead with AI image processing releases
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground font-medium">
              Get weekly updates on model accuracy improvements, 4K batch features & bonus credits.
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email…"
                className="w-full rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-semibold placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-extrabold text-background shadow-md transition-all hover:scale-105"
            >
              {subscribed ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Joined
                </>
              ) : (
                <>
                  Subscribe <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-1">
            <Link to="/" className="notranslate font-display text-4xl font-extrabold tracking-tight">
              bg<span className="text-accent">.</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed font-medium text-muted-foreground">
              Ultra-fast online AI image toolkit. Sub-pixel alpha matting background removal, 4K upscaling, object cleaning & Karudi AI chat.
            </p>

            <div className="mt-6 flex items-center gap-3 text-muted-foreground">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2.5 transition-all hover:bg-foreground hover:text-background hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2.5 transition-all hover:bg-foreground hover:text-background hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2.5 transition-all hover:bg-foreground hover:text-background hover:scale-110"
                aria-label="Discord"
              >
                <Discord className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-border p-2.5 transition-all hover:bg-foreground hover:text-background hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Tools & Shortcuts */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              AI Tools & Shortcuts
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/tools/$slug" params={{ slug: "remove-background" }} className="hover:text-accent transition-colors">
                  Background Remover (4K)
                </Link>
              </li>
              <li>
                <Link to="/tools/$slug" params={{ slug: "rotate-crop" }} className="hover:text-accent transition-colors">
                  Rotate & Flip Image
                </Link>
              </li>
              <li>
                <Link to="/tools/$slug" params={{ slug: "remove-watermark" }} className="hover:text-accent transition-colors">
                  Watermark & Eraser
                </Link>
              </li>
              <li>
                <Link to="/tools/$slug" params={{ slug: "clean-upscale" }} className="hover:text-accent transition-colors">
                  Clean & 4K Upscale
                </Link>
              </li>
              <li>
                <Link to="/tools/$slug" params={{ slug: "convert-compress" }} className="hover:text-accent transition-colors">
                  Convert PNG, JPG, WebP
                </Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <span>Try Karudi 1.0 Prime</span>
                  <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-extrabold text-accent-foreground uppercase">
                    Prime
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Models */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              AI Models Suite
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/models" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  <span>Karudi (Universal Master)</span>
                  <span className="rounded-full bg-foreground text-background px-1.5 py-0.2 text-[9px] font-bold">★</span>
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-accent transition-colors">
                  Ganga (Background Removal)
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-accent transition-colors">
                  Brahmaputra (Format Conversion)
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-accent transition-colors">
                  Narmada (OCR, Summary & Memes)
                </Link>
              </li>
              <li>
                <Link to="/models" className="hover:text-accent transition-colors">
                  Saraswati (Research Tools)
                </Link>
              </li>
            </ul>
          </div>

          {/* Pricing & Accounts */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Plans & Pricing
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/pricing" className="hover:text-accent transition-colors">
                  Free Daily Credits (10/day)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-accent transition-colors">
                  Pay-As-You-Go Packs
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-accent transition-colors">
                  Lite Plan (₹499/mo)
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-accent transition-colors">
                  Pro Plan (₹1,999/mo)
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-accent transition-colors">
                  Account Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Support & Legal
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm font-semibold">
              <li>
                <Link to="/terms" className="hover:text-accent transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-accent transition-colors">
                  Contact Us & Support
                </Link>
              </li>
              <li>
                <Link to="/pricing" hash="faq" className="hover:text-accent transition-colors">
                  General FAQs
                </Link>
              </li>
              <li>
                <Link to="/models" hash="model-faq" className="hover:text-accent transition-colors">
                  Model Technical Specs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Feature Badges & Security */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-border bg-muted/20 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-6 text-xs md:text-sm font-bold">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Zero File Storage Guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Sub-Second Latency</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />
              <span>4K HD Lossless Exports</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Mail className="h-4 w-4 text-foreground" />
            <span>Need enterprise high-volume batch API?</span>
            <Link to="/contact" className="font-bold text-foreground hover:underline">
              Contact Team →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border bg-background px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8">
        <div className="w-full flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm font-semibold text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} bg Inc. All rights reserved.</span>
            <LanguageTranslator variant="footer" />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Notice</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <span className="flex items-center gap-1">
              Built with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for creators
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
