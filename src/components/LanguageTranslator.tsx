import { useState, useEffect, useRef } from "react";
import { Globe, Check, Search, RotateCcw, Sparkles, ChevronDown } from "lucide-react";
import {
  SUPPORTED_WEBSITE_LANGUAGES,
  getCurrentWebsiteLanguage,
  setWebsiteLanguage,
  detectUserRegionLanguage,
  type TranslationLanguage,
} from "@/lib/translator";
import { toast } from "sonner";

interface LanguageTranslatorProps {
  variant?: "header" | "footer" | "floating" | "compact";
}

export function LanguageTranslator({ variant = "header" }: LanguageTranslatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "popular" | "indian" | "european" | "asian">("popular");
  const [autoDetectedInfo, setAutoDetectedInfo] = useState<{ code: string; isAutoDetected: boolean; source: string } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial sync
    const lang = getCurrentWebsiteLanguage();
    setCurrentLang(lang);
    const detected = detectUserRegionLanguage();
    setAutoDetectedInfo(detected);

    // Listen for custom language change events
    const handleLangChange = (e: any) => {
      if (e.detail?.language) {
        setCurrentLang(e.detail.language);
      }
    };

    window.addEventListener("bg_language_changed", handleLangChange);
    return () => window.removeEventListener("bg_language_changed", handleLangChange);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelectLanguage = (code: string) => {
    setWebsiteLanguage(code, true);
    setCurrentLang(code);
    setIsOpen(false);
    setSearchQuery("");

    const langObj = SUPPORTED_WEBSITE_LANGUAGES.find((l) => l.code === code);
    const name = langObj ? `${langObj.flag} ${langObj.nativeName} (${langObj.name})` : code;

    if (code === "en") {
      toast.success("Website switched back to English (Original).");
    } else {
      toast.success(`Website switched to ${name}!`);
    }
  };

  const activeLanguageObj =
    SUPPORTED_WEBSITE_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_WEBSITE_LANGUAGES[0]!;

  const filteredLanguages = SUPPORTED_WEBSITE_LANGUAGES.filter((l) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        (l.region && l.region.toLowerCase().includes(q))
      );
    }
    if (activeCategory === "all") return true;
    return l.category === activeCategory;
  });

  return (
    <div className="relative inline-block notranslate" ref={popoverRef}>
      {/* ── Trigger Button ────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change Website Language"
        className={`flex items-center gap-2 transition-all cursor-pointer select-none ${
          variant === "header"
            ? "rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-xs font-bold text-foreground shadow-xs hover:border-foreground hover:bg-card hover:scale-105 backdrop-blur-md"
            : variant === "footer"
            ? "rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground"
            : "rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold hover:border-foreground"
        }`}
      >
        <span className="text-sm shrink-0">{activeLanguageObj.flag}</span>
        <span className="font-extrabold truncate max-w-[85px] sm:max-w-[120px]">
          {activeLanguageObj.nativeName}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* ── Dropdown / Modal Popover ───────────────────────────────────── */}
      {isOpen && (
        <div
          className={`absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-[360px] sm:w-96 rounded-2xl border-2 border-border bg-card p-4 text-foreground shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
            variant === "footer" ? "bottom-full mb-2" : "top-full"
          }`}
          style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground font-black text-xs shadow-inner">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Language Switcher
                </h4>
                <p className="text-[10px] text-muted-foreground">
                  Select your preferred language
                </p>
              </div>
            </div>
            {currentLang !== "en" && (
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-mono font-bold text-accent border border-accent/30">
                {activeLanguageObj.nativeName}
              </span>
            )}
          </div>

          {/* Quick Switch to English Button (When translated) */}
          {currentLang !== "en" && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className="w-full flex items-center justify-between rounded-xl p-2.5 text-xs font-extrabold transition-all cursor-pointer border border-border bg-background/80 hover:border-foreground hover:bg-foreground hover:text-background shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇺🇸</span>
                  <div className="text-left">
                    <span className="block font-black">Switch to English (Original)</span>
                    <span className="block text-[10px] opacity-75">Restore original language</span>
                  </div>
                </div>
                <RotateCcw className="h-3.5 w-3.5 opacity-70" />
              </button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 border-b border-border text-[11px] font-bold">
            {(
              [
                { id: "popular", label: "⭐ Popular" },
                { id: "indian", label: "🇮🇳 Indian" },
                { id: "european", label: "🌍 European" },
                { id: "asian", label: "🌏 Asian" },
                { id: "all", label: "🌐 All" },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery("");
                }}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id && !searchQuery
                    ? "bg-foreground text-background font-black shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Filter Input */}
          <div className="mt-2.5 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ languages (Gujarati, Hindi, etc.)..."
              className="w-full rounded-xl border border-border bg-background py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Languages Grid / List */}
          <div className="mt-2.5 max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredLanguages.map((l) => {
              const isSelected = currentLang === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-accent text-accent-foreground font-black shadow-xs border border-accent"
                      : "hover:bg-muted text-foreground border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base shrink-0">{l.flag}</span>
                    <span className="font-black truncate">{l.nativeName}</span>
                    <span className="text-[11px] text-muted-foreground font-normal truncate">
                      ({l.name})
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-foreground/20 shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
