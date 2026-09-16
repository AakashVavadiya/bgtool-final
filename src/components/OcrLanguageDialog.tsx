import { useState, useMemo, useEffect } from "react";
import {
  Globe,
  Search,
  Check,
  X,
  Sparkles,
  Languages,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Zap,
  Info,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export interface OcrLanguageOption {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
  region?: string;
  category:
    | "Popular"
    | "Indic & South Asian"
    | "East & SE Asian"
    | "European"
    | "Middle Eastern"
    | "African & Other"
    | "Multi-Language";
}

export const RICH_OCR_LANGUAGES: OcrLanguageOption[] = [
  // Popular Presets
  { code: "eng", name: "English", nativeName: "English", flag: "🇺🇸", region: "Global / US / UK", category: "Popular" },
  { code: "hin", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", region: "India (National)", category: "Popular" },
  { code: "guj", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳", region: "Gujarat / India", category: "Popular" },
  { code: "spa", name: "Spanish", nativeName: "Español", flag: "🇪🇸", region: "Spain / Latin America", category: "Popular" },
  { code: "fra", name: "French", nativeName: "Français", flag: "🇫🇷", region: "France / Canada", category: "Popular" },
  { code: "deu", name: "German", nativeName: "Deutsch", flag: "🇩🇪", region: "Germany / Austria", category: "Popular" },
  { code: "chi_sim", name: "Chinese (Simplified)", nativeName: "简体中文", flag: "🇨🇳", region: "China (Mandarin)", category: "Popular" },
  { code: "chi_tra", name: "Chinese (Traditional)", nativeName: "繁體中文", flag: "🇹🇼", region: "Taiwan / Hong Kong", category: "Popular" },
  { code: "jpn", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", region: "Japan (Kanji / Kana)", category: "Popular" },
  { code: "kor", name: "Korean", nativeName: "한국어", flag: "🇰🇷", region: "South Korea (Hangul)", category: "Popular" },
  { code: "ara", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", region: "Middle East / UAE / KSA", category: "Popular" },
  { code: "rus", name: "Russian", nativeName: "Русский", flag: "🇷🇺", region: "Russia / CIS (Cyrillic)", category: "Popular" },
  { code: "por", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", region: "Brazil / Portugal", category: "Popular" },
  { code: "ita", name: "Italian", nativeName: "Italiano", flag: "🇮🇹", region: "Italy / Switzerland", category: "Popular" },

  // Indic & South Asian
  { code: "ben", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳", region: "India (West Bengal) / BD", category: "Indic & South Asian" },
  { code: "tam", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳", region: "Tamil Nadu / Sri Lanka", category: "Indic & South Asian" },
  { code: "tel", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳", region: "Andhra / Telangana", category: "Indic & South Asian" },
  { code: "mar", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳", region: "Maharashtra / India", category: "Indic & South Asian" },
  { code: "kan", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳", region: "Karnataka / India", category: "Indic & South Asian" },
  { code: "mal", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳", region: "Kerala / India", category: "Indic & South Asian" },
  { code: "pan", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳", region: "Punjab (Gurmukhi)", category: "Indic & South Asian" },
  { code: "urd", name: "Urdu", nativeName: "اردو", flag: "🇵🇰", region: "Pakistan / South Asia", category: "Indic & South Asian" },
  { code: "san", name: "Sanskrit", nativeName: "संस्कृतम्", flag: "🕉️", region: "Classical Devanagari", category: "Indic & South Asian" },
  { code: "nep", name: "Nepali", nativeName: "नेपाली", flag: "🇳🇵", region: "Nepal / Himalayas", category: "Indic & South Asian" },
  { code: "sin", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰", region: "Sri Lanka", category: "Indic & South Asian" },

  // East & Southeast Asian
  { code: "vie", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", region: "Vietnam", category: "East & SE Asian" },
  { code: "tha", name: "Thai", nativeName: "ภาษาไทย", flag: "🇹🇭", region: "Thailand", category: "East & SE Asian" },
  { code: "ind", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩", region: "Indonesia", category: "East & SE Asian" },
  { code: "msa", name: "Malay", nativeName: "Bahasa Melayu", flag: "🇲🇾", region: "Malaysia / Singapore", category: "East & SE Asian" },
  { code: "fil", name: "Filipino (Tagalog)", nativeName: "Wikang Filipino", flag: "🇵🇭", region: "Philippines", category: "East & SE Asian" },
  { code: "mya", name: "Burmese", nativeName: "မြန်မာစာ", flag: "🇲🇲", region: "Myanmar", category: "East & SE Asian" },
  { code: "khm", name: "Khmer", nativeName: "ភាសាខ្មែរ", flag: "🇰🇭", region: "Cambodia", category: "East & SE Asian" },
  { code: "lao", name: "Lao", nativeName: "ພາສາລາວ", flag: "🇱🇦", region: "Laos", category: "East & SE Asian" },

  // European Languages
  { code: "nld", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱", region: "Netherlands / Belgium", category: "European" },
  { code: "pol", name: "Polish", nativeName: "Polski", flag: "🇵🇱", region: "Poland", category: "European" },
  { code: "swe", name: "Swedish", nativeName: "Svenska", flag: "🇸🇪", region: "Sweden", category: "European" },
  { code: "nor", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴", region: "Norway", category: "European" },
  { code: "dan", name: "Danish", nativeName: "Dansk", flag: "🇩🇰", region: "Denmark", category: "European" },
  { code: "fin", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮", region: "Finland", category: "European" },
  { code: "ces", name: "Czech", nativeName: "Čeština", flag: "🇨🇿", region: "Czech Republic", category: "European" },
  { code: "slk", name: "Slovak", nativeName: "Slovenčina", flag: "🇸🇰", region: "Slovakia", category: "European" },
  { code: "ron", name: "Romanian", nativeName: "Română", flag: "🇷🇴", region: "Romania", category: "European" },
  { code: "hun", name: "Hungarian", nativeName: "Magyar", flag: "🇭🇺", region: "Hungary", category: "European" },
  { code: "ell", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷", region: "Greece / Cyprus", category: "European" },
  { code: "ukr", name: "Ukrainian", nativeName: "Українська", flag: "🇺🇦", region: "Ukraine", category: "European" },
  { code: "bul", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬", region: "Bulgaria", category: "European" },
  { code: "hrv", name: "Croatian", nativeName: "Hrvatski", flag: "🇭🇷", region: "Croatia / Balkans", category: "European" },
  { code: "srp", name: "Serbian", nativeName: "Српски", flag: "🇷🇸", region: "Serbia", category: "European" },
  { code: "slv", name: "Slovenian", nativeName: "Slovenščina", flag: "🇸🇮", region: "Slovenia", category: "European" },
  { code: "lit", name: "Lithuanian", nativeName: "Lietuvių", flag: "🇱🇹", region: "Lithuania / Baltic", category: "European" },
  { code: "lav", name: "Latvian", nativeName: "Latviešu", flag: "🇱🇻", region: "Latvia / Baltic", category: "European" },
  { code: "est", name: "Estonian", nativeName: "Eesti", flag: "🇪🇪", region: "Estonia / Baltic", category: "European" },
  { code: "lat", name: "Latin", nativeName: "Latina", flag: "🏛️", region: "Classical Roman Script", category: "European" },

  // Middle Eastern & Central Asian
  { code: "tur", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷", region: "Turkey", category: "Middle Eastern" },
  { code: "heb", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱", region: "Israel", category: "Middle Eastern" },
  { code: "fas", name: "Persian (Farsi)", nativeName: "فارسی", flag: "🇮🇷", region: "Iran / Middle East", category: "Middle Eastern" },
  { code: "aze", name: "Azerbaijani", nativeName: "Azərbaycan", flag: "🇦🇿", region: "Azerbaijan", category: "Middle Eastern" },
  { code: "kaz", name: "Kazakh", nativeName: "Қазақша", flag: "🇰🇿", region: "Kazakhstan", category: "Middle Eastern" },
  { code: "uzb", name: "Uzbek", nativeName: "Oʻzbekcha", flag: "🇺🇿", region: "Uzbekistan", category: "Middle Eastern" },
  { code: "kat", name: "Georgian", nativeName: "ქართული", flag: "🇬🇪", region: "Georgia (Caucasus)", category: "Middle Eastern" },
  { code: "hye", name: "Armenian", nativeName: "Հայերեն", flag: "🇦🇲", region: "Armenia (Caucasus)", category: "Middle Eastern" },

  // African & Others
  { code: "swa", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪", region: "East Africa / Kenya", category: "African & Other" },
  { code: "afr", name: "Afrikaans", nativeName: "Afrikaans", flag: "🇿🇦", region: "South Africa", category: "African & Other" },
  { code: "amh", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹", region: "Ethiopia (Ge'ez)", category: "African & Other" },

  // Multi-Language Combos (Dual Language OCR)
  { code: "eng+hin", name: "English + Hindi", nativeName: "English + हिन्दी", flag: "🇮🇳", region: "Dual Script (Latin + Devanagari)", category: "Multi-Language" },
  { code: "eng+guj", name: "English + Gujarati", nativeName: "English + ગુજરાતી", flag: "🇮🇳", region: "Dual Script (Latin + Gujarati)", category: "Multi-Language" },
  { code: "eng+spa", name: "English + Spanish", nativeName: "English + Español", flag: "🇪🇸", region: "Bilingual English & Spanish", category: "Multi-Language" },
  { code: "eng+fra", name: "English + French", nativeName: "English + Français", flag: "🇫🇷", region: "Bilingual English & French", category: "Multi-Language" },
  { code: "eng+deu", name: "English + German", nativeName: "English + Deutsch", flag: "🇩🇪", region: "Bilingual English & German", category: "Multi-Language" },
  { code: "eng+chi_sim", name: "English + Chinese (Simp)", nativeName: "English + 简体中文", flag: "🇨🇳", region: "Bilingual English & Chinese", category: "Multi-Language" },
  { code: "eng+chi_tra", name: "English + Chinese (Trad)", nativeName: "English + 繁體中文", flag: "🇹🇼", region: "Bilingual English & Trad. Chinese", category: "Multi-Language" },
  { code: "eng+jpn", name: "English + Japanese", nativeName: "English + 日本語", flag: "🇯🇵", region: "Bilingual English & Japanese", category: "Multi-Language" },
  { code: "eng+kor", name: "English + Korean", nativeName: "English + 한국어", flag: "🇰🇷", region: "Bilingual English & Korean", category: "Multi-Language" },
  { code: "eng+ara", name: "English + Arabic", nativeName: "English + العربية", flag: "🇸🇦", region: "Bilingual English & Arabic", category: "Multi-Language" },
  { code: "eng+rus", name: "English + Russian", nativeName: "English + Русский", flag: "🇷🇺", region: "Bilingual English & Russian", category: "Multi-Language" },
  { code: "eng+ben", name: "English + Bengali", nativeName: "English + বাংলা", flag: "🇮🇳", region: "Dual Script (Latin + Bengali)", category: "Multi-Language" },
  { code: "eng+tam", name: "English + Tamil", nativeName: "English + தமிழ்", flag: "🇮🇳", region: "Dual Script (Latin + Tamil)", category: "Multi-Language" },
  { code: "eng+tel", name: "English + Telugu", nativeName: "English + తెలుగు", flag: "🇮🇳", region: "Dual Script (Latin + Telugu)", category: "Multi-Language" },
  { code: "eng+por", name: "English + Portuguese", nativeName: "English + Português", flag: "🇧🇷", region: "Bilingual English & Portuguese", category: "Multi-Language" },
  { code: "eng+ita", name: "English + Italian", nativeName: "English + Italiano", flag: "🇮🇹", region: "Bilingual English & Italian", category: "Multi-Language" },
];

export interface OcrLanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
  customLanguage: string;
  onUpdateCustomLanguage: (val: string) => void;
}

export function OcrLanguageDialog({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  customLanguage,
  onUpdateCustomLanguage,
}: OcrLanguageDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "all" | "Popular" | "Indic & South Asian" | "East & SE Asian" | "European" | "Middle Eastern" | "African & Other" | "Multi-Language" | "custom"
  >("Popular");
  const [tempCustomInput, setTempCustomInput] = useState(customLanguage);

  // Sync custom input
  useEffect(() => {
    setTempCustomInput(customLanguage);
  }, [customLanguage]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredLanguages = useMemo(() => {
    if (activeTab === "custom") return [];

    return RICH_OCR_LANGUAGES.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.nativeName && item.nativeName.toLowerCase().includes(q)) ||
        item.code.toLowerCase().includes(q) ||
        (item.region && item.region.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (q) return true; // Show across all categories when searching
      if (activeTab === "all") return true;
      return item.category === activeTab;
    });
  }, [searchQuery, activeTab]);

  const activeLangObj = useMemo(() => {
    if (selectedLanguage === "custom") {
      return {
        code: "custom",
        name: customLanguage ? `Custom (${customLanguage})` : "Custom Code",
        nativeName: customLanguage || "Custom Code",
        flag: "⚙️",
        region: "User-defined Tesseract string",
        category: "Multi-Language" as const,
      };
    }
    return (
      RICH_OCR_LANGUAGES.find((l) => l.code === selectedLanguage) || {
        code: selectedLanguage,
        name: selectedLanguage,
        nativeName: selectedLanguage,
        flag: "🌐",
        region: "Language",
        category: "Popular" as const,
      }
    );
  }, [selectedLanguage, customLanguage]);

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    const trimmed = tempCustomInput.trim();
    if (!trimmed) {
      toast.error("Please enter at least one 3-letter language code (e.g. eng+hin)");
      return;
    }
    onUpdateCustomLanguage(trimmed);
    onSelectLanguage("custom");
    toast.success(`OCR language set to custom: ${trimmed}`);
    onClose();
  };

  const handlePickLanguage = (code: string, name: string) => {
    onSelectLanguage(code);
    toast.success(`OCR language set to ${name}`);
    onClose();
  };

  const categoryTabs = [
    { id: "Popular", label: "⭐ Popular", count: 14 },
    { id: "Indic & South Asian", label: "🇮🇳 Indic / South Asian", count: 12 },
    { id: "East & SE Asian", label: "🌏 East & SE Asian", count: 8 },
    { id: "European", label: "🌍 European", count: 20 },
    { id: "Middle Eastern", label: "🕌 Middle Eastern", count: 8 },
    { id: "African & Other", label: "🌍 African", count: 3 },
    { id: "Multi-Language", label: "🔗 Dual Language OCR", count: 16 },
    { id: "all", label: "🌐 All (60+)", count: RICH_OCR_LANGUAGES.length },
    { id: "custom", label: "⚙️ Custom Code", count: null },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none notranslate"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex flex-col w-full max-w-4xl max-h-[92vh] sm:max-h-[86vh] rounded-3xl border-2 border-border bg-card text-foreground shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ocr-language-dialog-title"
      >
        {/* ── 1. Dialog Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground font-black shadow-md">
              <Languages className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3
                  id="ocr-language-dialog-title"
                  className="font-display text-base sm:text-lg font-black tracking-tight text-foreground"
                >
                  Select Recognition Language
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-extrabold text-accent border border-accent/30">
                  <Sparkles className="h-3 w-3" /> 60+ Languages &amp; Dual Scripts
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose the primary or multi-script language of the text in your image
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground hover:border-foreground hover:text-foreground hover:scale-105 transition-all cursor-pointer shadow-xs"
            aria-label="Close language dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── 2. Search Bar & Active Summary ───────────────────────────── */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-b border-border/80 bg-background/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search languages by name, native script (ગુજરાતી, हिन्दी), region or code (guj, hin, eng)..."
                className="w-full rounded-2xl border-2 border-border bg-background py-2.5 pl-10 pr-10 text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-inner"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold px-1 py-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Current Active Badge */}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2 shrink-0 shadow-2xs">
              <span className="text-xs text-muted-foreground font-semibold">Active:</span>
              <span className="text-sm">{activeLangObj.flag}</span>
              <span className="text-xs font-black text-foreground">{activeLangObj.nativeName || activeLangObj.name}</span>
              <span className="rounded-md bg-accent/20 px-1.5 py-0.5 text-[10px] font-mono font-bold text-accent">
                {activeLangObj.code}
              </span>
            </div>
          </div>

          {/* Category Tabs */}
          {!searchQuery && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
              {categoryTabs.map((cat) => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat.id as any)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-foreground text-background font-black shadow-xs scale-102"
                        : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:border-foreground"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.count !== null && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                          isActive ? "bg-background text-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Main Content: Grid of Languages or Custom Builder ──────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[50vh] sm:max-h-[55vh]">
          {/* Custom Language Code Builder View */}
          {activeTab === "custom" && !searchQuery ? (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              <div className="rounded-3xl border-2 border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground font-black">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">Custom Multi-Language Tesseract Code</h4>
                    <p className="text-xs text-muted-foreground">
                      Combine multiple 3-letter ISO-639-2 language codes with plus (<code className="text-accent font-bold">+</code>)
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Tesseract Language String:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tempCustomInput}
                      onChange={(e) => setTempCustomInput(e.target.value)}
                      placeholder="e.g. eng+hin+guj or spa+fra"
                      className="flex-1 rounded-2xl border-2 border-border bg-background px-4 py-3 text-sm font-mono font-bold text-foreground focus:border-foreground focus:outline-none shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustom}
                      className="rounded-2xl bg-foreground px-5 py-3 text-xs sm:text-sm font-extrabold text-background hover:scale-105 transition-all cursor-pointer shadow-md"
                    >
                      Apply Code
                    </button>
                  </div>
                </div>

                {/* Quick Multi-Code Combinations */}
                <div className="pt-3 border-t border-border space-y-2">
                  <span className="text-xs font-bold text-muted-foreground block">Quick Dual/Triple Script Presets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { code: "eng+hin+guj", label: "English + Hindi + Gujarati" },
                      { code: "eng+tam+tel", label: "English + Tamil + Telugu" },
                      { code: "eng+spa+fra", label: "English + Spanish + French" },
                      { code: "eng+deu+ita", label: "English + German + Italian" },
                      { code: "eng+chi_sim+jpn", label: "English + Chinese + Japanese" },
                      { code: "eng+ara+fas", label: "English + Arabic + Persian" },
                    ].map((preset) => (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => {
                          setTempCustomInput(preset.code);
                          onUpdateCustomLanguage(preset.code);
                          onSelectLanguage("custom");
                          toast.success(`OCR language set to ${preset.label} (${preset.code})`);
                          onClose();
                        }}
                        className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground hover:border-foreground hover:scale-105 transition-all cursor-pointer"
                      >
                        {preset.label} <code className="text-[10px] text-accent font-mono ml-1">({preset.code})</code>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/40 p-3.5 border border-border flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                  <span>
                    Dual/multi-language OCR downloads training sets for each language code and recognizes complex multilingual bills, packaging, passports &amp; documents simultaneously.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Language Cards Grid */}
              {filteredLanguages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {filteredLanguages.map((l) => {
                    const isSelected = selectedLanguage === l.code;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => handlePickLanguage(l.code, l.nativeName ? `${l.name} (${l.nativeName})` : l.name)}
                        className={`group flex items-center justify-between rounded-2xl p-3.5 text-left transition-all cursor-pointer border-2 ${
                          isSelected
                            ? "border-accent bg-accent/10 shadow-md ring-2 ring-accent/30 scale-[1.02]"
                            : "border-border/80 bg-card hover:border-foreground hover:bg-muted/40 hover:scale-[1.01]"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate pr-2">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background border border-border text-lg shadow-2xs group-hover:scale-110 transition-transform">
                            {l.flag || "🌐"}
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-sm text-foreground truncate">
                                {l.nativeName || l.name}
                              </span>
                              {l.nativeName && l.nativeName !== l.name && (
                                <span className="text-xs text-muted-foreground font-medium truncate">
                                  {l.name}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-muted-foreground truncate">
                                {l.region || l.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-extrabold ${
                              isSelected
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted text-muted-foreground group-hover:text-foreground"
                            }`}
                          >
                            {l.code}
                          </span>
                          {isSelected && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-xs">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">No matching languages found</h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Could not find any language matching &quot;{searchQuery}&quot;. You can use Custom Code mode to specify any valid Tesseract language.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveTab("custom");
                    }}
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold hover:border-foreground hover:bg-foreground hover:text-background transition-all cursor-pointer"
                  >
                    Open Custom Code Builder
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── 4. Dialog Footer ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-border bg-muted/20 px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePickLanguage("eng", "English")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-foreground transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to English (eng)</span>
            </button>
            <span className="text-xs text-muted-foreground hidden md:inline">
              Selected: <strong className="text-foreground">{activeLangObj.name} [{activeLangObj.code}]</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-border bg-background px-5 py-2.5 text-xs font-bold text-foreground hover:border-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-6 py-2.5 text-xs font-black text-background hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Done / Apply Selection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
