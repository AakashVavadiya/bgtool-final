import { useState, useEffect, useMemo } from "react";
import { AdminStore, type UiEditSettings, CORE_PAGE_ROUTES } from "@/admin/lib/admin-store";
import { tools, TOOL_CATEGORIES, type ToolCategory } from "@/lib/tools";
import { REALTIME_EVENT_NAME } from "@/lib/telemetry";
import { toast } from "sonner";
import {
  Sliders,
  Power,
  Bot,
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Shield,
  Palette,
  Megaphone,
  Compass,
  Check,
  Zap,
  BotOff,
  Flame,
  Sun,
  Coins,
  Link as LinkIcon,
} from "lucide-react";

export function ProSettingsView() {
  const [settings, setSettings] = useState<UiEditSettings>(() => AdminStore.getUiSettings());
  const [activeTab, setActiveTab] = useState<"tree" | "ui-edit" | "ai-control">("ai-control");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "Background Removal": true,
    "AI Generation": true,
  });

  useEffect(() => {
    const sync = () => {
      setSettings(AdminStore.getUiSettings());
    };
    window.addEventListener(REALTIME_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(REALTIME_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleUpdate = (partial: Partial<UiEditSettings>, message?: string) => {
    const updated = AdminStore.saveUiSettings(partial);
    setSettings(updated);
    if (message) {
      toast.success(message);
    }
  };

  const handleMasterAiToggle = (enable: boolean) => {
    const updated = AdminStore.setAllAiFeatures(enable);
    setSettings(updated);
    if (enable) {
      toast.success("All AI capabilities, Assistant, Models page & AI buttons are now ACTIVATED!");
    } else {
      toast.warning("All AI capabilities, Assistant & Models are DEACTIVATED! All AI buttons and pages are now gone from the website.");
    }
  };

  const handleToggleRoute = (path: string, label: string) => {
    const nextState = AdminStore.togglePageRoute(path);
    setSettings(AdminStore.getUiSettings());
    if (nextState) {
      toast.success(`Page "${label}" (${path}) is now ACTIVE.`);
    } else {
      toast.warning(`Page "${label}" (${path}) is now DISABLED.`);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all UI & Page Tree settings to system defaults?")) {
      const reset = AdminStore.resetUiSettingsToDefault();
      setSettings(reset);
      toast.success("Reset all UI & Page Tree settings to factory defaults.");
    }
  };

  const toggleCategoryExpand = (cat: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const map: Record<string, typeof tools> = {};
    for (const cat of TOOL_CATEGORIES) {
      map[cat] = tools.filter((t) => t.category === cat);
    }
    return map;
  }, []);

  // Filtered Core Pages
  const filteredCorePages = useMemo(() => {
    return CORE_PAGE_ROUTES.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        categoryFilter === "all" ||
        (categoryFilter === "ai" && r.isAiRelated) ||
        (categoryFilter === "core" && !r.isAiRelated);
      return matchSearch && matchCat;
    });
  }, [searchQuery, categoryFilter]);

  // Filtered Tools
  const filteredToolsCount = useMemo(() => {
    return tools.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === "all" || categoryFilter === "tools" || categoryFilter === t.category;
      return matchSearch && matchCat;
    }).length;
  }, [searchQuery, categoryFilter]);

  const allAiActive =
    settings.aiMasterEnabled &&
    settings.aiAssistantEnabled &&
    settings.aiModelsPageEnabled;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-accent/10 border border-accent/25 px-2.5 py-0.5 font-mono text-[11px] font-extrabold uppercase text-accent">
              Pro Feature Control
            </span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground mt-1">
            Pro UI & Page Tree Settings
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Turn pages ON/OFF dynamically, edit UI components, or deactivate all AI models and assistant buttons with 1 click.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer shadow-xs"
            title="Reset all settings to defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* ─── MASTER AI KILL SWITCH / DEACTIVATION BANNER ─────────────────── */}
      <div
        className={`rounded-3xl border p-6 sm:p-7 transition-all shadow-md relative overflow-hidden ${
          allAiActive
            ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
            : "border-rose-500/40 bg-rose-500/10 dark:bg-rose-950/30"
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${
                  allAiActive
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {allAiActive ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    AI Engine & Assistant Online
                  </>
                ) : (
                  <>
                    <BotOff className="h-3.5 w-3.5 text-rose-500" />
                    All AI Features Deactivated
                  </>
                )}
              </span>

              <span className="text-[11px] font-mono text-muted-foreground">
                Master AI Controller
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-foreground">
              {allAiActive
                ? "AI Assistant & Model Pages are Currently ACTIVE"
                : "AI Assistant & Model Pages are CURRENTLY TURNED OFF"}
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {allAiActive
                ? "Smart AI Assistant (/chat), Models page (/models), header links, floating Karudi button, and home page AI cards are currently visible to all visitors."
                : "All AI entry points are gone: /chat and /models are disabled, header 'Smart Assistant.' and 'Models.' links are hidden, floating AI button is removed, and home AI cards are hidden."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {allAiActive ? (
              <button
                type="button"
                onClick={() => handleMasterAiToggle(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-3.5 text-sm font-black shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Power className="h-4 w-4" />
                <span>Deactivate All AI Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleMasterAiToggle(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-sm font-black shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap className="h-4 w-4" />
                <span>Activate All AI Features</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("ai-control")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ai-control"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>AI & Feature Toggles</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tree")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "tree"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Page Tree (ON / OFF)</span>
          <span className="rounded-full bg-accent/20 text-accent px-1.5 py-0.2 text-[10px] font-mono">
            {CORE_PAGE_ROUTES.length + tools.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ui-edit")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "ui-edit"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>UI Edit Options</span>
        </button>
      </div>

      {/* ─── TAB 1: AI & FEATURE TOGGLES ─────────────────────────────────── */}
      {activeTab === "ai-control" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. AI Assistant Chat Route */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">AI Chat Assistant (/chat)</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">Route & Agent Loop</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { aiAssistantEnabled: !settings.aiAssistantEnabled },
                      settings.aiAssistantEnabled ? "AI Chat disabled" : "AI Chat enabled"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.aiAssistantEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={settings.aiAssistantEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.aiAssistantEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When OFF, user cannot access /chat or start AI threads. A polite offline screen is displayed.
              </p>
            </div>

            {/* 2. AI Models Page */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">AI Models Page (/models)</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">Model Specs & FAQ</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { aiModelsPageEnabled: !settings.aiModelsPageEnabled },
                      settings.aiModelsPageEnabled ? "Models page disabled" : "Models page enabled"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.aiModelsPageEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={settings.aiModelsPageEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.aiModelsPageEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Controls access to the /models route detailing Karudi, Ganga, Brahmaputra, Narmada, and Saraswati.
              </p>
            </div>

            {/* 3. Floating Karudi Assistant FAB */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Floating AI Widget (FAB)</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">Bottom-Right Corner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { aiFabWidgetEnabled: !settings.aiFabWidgetEnabled },
                      settings.aiFabWidgetEnabled ? "Floating AI widget hidden" : "Floating AI widget shown"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.aiFabWidgetEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={settings.aiFabWidgetEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.aiFabWidgetEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Shows the floating Karudi avatar button on all public pages with quick questions popup.
              </p>
            </div>

            {/* 4. Header AI Links */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Header AI Links</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">"Smart Assistant." & "Models."</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { aiHeaderLinksEnabled: !settings.aiHeaderLinksEnabled },
                      settings.aiHeaderLinksEnabled ? "Header AI links hidden" : "Header AI links shown"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.aiHeaderLinksEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={settings.aiHeaderLinksEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.aiHeaderLinksEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Displays or hides the "Smart Assistant." and "Models." navigation items in the top navbar.
              </p>
            </div>

            {/* 5. Home Page AI Sections */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Home Page AI Cards</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">Hero & Showcase Sections</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { aiHomeSectionsEnabled: !settings.aiHomeSectionsEnabled },
                      settings.aiHomeSectionsEnabled ? "Home AI cards hidden" : "Home AI cards shown"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.aiHomeSectionsEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={settings.aiHomeSectionsEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.aiHomeSectionsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hides the "Try Karudi 1.0 Prime" hero button, the "Five Neural Engines" section, and "Meet Karudi" section.
              </p>
            </div>

            {/* 6. Footer AI Links */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Footer AI Suite Column</h4>
                    <p className="text-[11px] font-mono text-muted-foreground">Footer Navigation</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdate(
                      { aiFooterLinksEnabled: !settings.aiFooterLinksEnabled },
                      settings.aiFooterLinksEnabled ? "Footer AI links hidden" : "Footer AI links shown"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.aiFooterLinksEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                  }`}
                  role="switch"
                  aria-checked={settings.aiFooterLinksEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      settings.aiFooterLinksEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hides the "AI Models Suite" and Karudi assistant shortcuts in the website footer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: PAGE TREE ON / OFF ──────────────────────────────────── */}
      {activeTab === "tree" && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search page tree by route path or title…"
                className="w-full rounded-2xl border border-input bg-card pl-10 pr-4 py-2.5 text-xs font-medium text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === "all" ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All Pages
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("core")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === "core" ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Core Site Pages
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("ai")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === "ai" ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                AI Pages
              </button>
              <button
                type="button"
                onClick={() => setCategoryFilter("tools")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  categoryFilter === "tools" ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Tool Pages ({tools.length})
              </button>
            </div>
          </div>

          {/* Core Routes Group */}
          {(categoryFilter === "all" || categoryFilter === "core" || categoryFilter === "ai") && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <Compass className="h-5 w-5 text-accent" />
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Core Website Pages & Navigation
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Main entry points, portals, legal pages, and AI centers.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-mono font-bold text-muted-foreground">
                  {filteredCorePages.filter((r) => AdminStore.isPageEnabled(r.path)).length} / {filteredCorePages.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredCorePages.map((route) => {
                  const isEnabled = AdminStore.isPageEnabled(route.path);
                  return (
                    <div
                      key={route.id}
                      className={`rounded-2xl border p-4 transition-all flex items-start justify-between gap-4 ${
                        isEnabled
                          ? "border-border bg-background hover:border-foreground/20"
                          : "border-destructive/20 bg-destructive/5 opacity-70"
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-foreground truncate">{route.name}</h4>
                          <span className="font-mono text-[11px] rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
                            {route.path}
                          </span>
                          {route.isAiRelated && (
                            <span className="rounded-md bg-accent/15 border border-accent/30 px-1.5 py-0.2 text-[10px] font-black text-accent uppercase">
                              AI Engine
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{route.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleRoute(route.path, route.name)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          isEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                        }`}
                        role="switch"
                        aria-checked={isEnabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                            isEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tools Hierarchy Tree */}
          {(categoryFilter === "all" || categoryFilter === "tools" || TOOL_CATEGORIES.includes(categoryFilter as any)) && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <Layers className="h-5 w-5 text-accent" />
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Tools Directory Sub-Pages (/tools/$slug)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Toggle any individual tool page on or off. Disabled tools show maintenance state.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-mono font-bold text-muted-foreground">
                  {tools.filter((t) => AdminStore.isToolEnabled(t.slug)).length} / {tools.length} Active
                </span>
              </div>

              {/* Grouped by Category */}
              <div className="space-y-3">
                {TOOL_CATEGORIES.map((cat) => {
                  const catTools = toolsByCategory[cat] || [];
                  const activeInCat = catTools.filter((t) => AdminStore.isToolEnabled(t.slug)).length;
                  const isExpanded = expandedCategories[cat] ?? false;

                  const filteredCatTools = catTools.filter((t) => {
                    if (!searchQuery) return true;
                    return (
                      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.slug.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                  });

                  if (filteredCatTools.length === 0) return null;

                  return (
                    <div key={cat} className="rounded-2xl border border-border/80 bg-background/60 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCategoryExpand(cat)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-bold text-xs sm:text-sm text-foreground">{cat}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            ({activeInCat}/{catTools.length} Active)
                          </span>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            activeInCat === catTools.length
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {activeInCat === catTools.length ? "All Enabled" : `${catTools.length - activeInCat} Disabled`}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredCatTools.map((t) => {
                            const isEnabled = AdminStore.isToolEnabled(t.slug);
                            return (
                              <div
                                key={t.slug}
                                className={`rounded-xl border p-3 flex items-center justify-between gap-3 transition-all ${
                                  isEnabled
                                    ? "border-border bg-card hover:border-foreground/20"
                                    : "border-destructive/20 bg-destructive/5 opacity-70"
                                }`}
                              >
                                <div className="space-y-0.5 min-w-0">
                                  <p className="font-bold text-xs text-foreground truncate">{t.name}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                                    /tools/{t.slug}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleRoute(`/tools/${t.slug}`, t.name)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                    isEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                                  }`}
                                  role="switch"
                                  aria-checked={isEnabled}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                                      isEnabled ? "translate-x-4" : "translate-x-0"
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: UI EDIT OPTIONS ─────────────────────────────────────── */}
      {activeTab === "ui-edit" && (
        <div className="space-y-6">
          {/* Header Branding & Elements */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <Palette className="h-5 w-5 text-accent" />
              <div>
                <h3 className="font-display text-base font-bold text-foreground">Header & Navigation Customizer</h3>
                <p className="text-xs text-muted-foreground">Customize branding text, icons, and navbar links.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Brand Text */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Site Logo / Brand Text</label>
                <input
                  type="text"
                  value={settings.headerBrandText}
                  onChange={(e) => handleUpdate({ headerBrandText: e.target.value })}
                  placeholder="e.g. bg."
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                />
                <p className="text-[11px] text-muted-foreground">Displayed prominently in the center of SiteHeader.</p>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Festival Offer Wand Icon */}
                <div className="rounded-xl border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Festival Offer Icon</p>
                      <p className="text-[10px] text-muted-foreground">Header Wand Button</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ showFestivalOfferButton: !settings.showFestivalOfferButton })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      settings.showFestivalOfferButton ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        settings.showFestivalOfferButton ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Theme Toggle Icon */}
                <div className="rounded-xl border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Theme Switcher</p>
                      <p className="text-[10px] text-muted-foreground">Day/Night Pill</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ showThemeToggle: !settings.showThemeToggle })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      settings.showThemeToggle ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        settings.showThemeToggle ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Token Balance Pill */}
                <div className="rounded-xl border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Token Balance Pill</p>
                      <p className="text-[10px] text-muted-foreground">Header Token Count</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ showTokenPill: !settings.showTokenPill })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      settings.showTokenPill ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        settings.showTokenPill ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Pricing Link */}
                <div className="rounded-xl border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Pricing Link</p>
                      <p className="text-[10px] text-muted-foreground">"Pricing." In Nav</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ showPricingLink: !settings.showPricingLink })}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      settings.showPricingLink ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        settings.showPricingLink ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Announcement Bar Customizer */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <Megaphone className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">Top Site Announcement Banner</h3>
                  <p className="text-xs text-muted-foreground">Show a promotional message or maintenance alert across all pages.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleUpdate({ announcementEnabled: !settings.announcementEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.announcementEnabled ? "bg-emerald-500" : "bg-muted-foreground/30"
                }`}
                role="switch"
                aria-checked={settings.announcementEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    settings.announcementEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Banner Text</label>
                <input
                  type="text"
                  value={settings.announcementText}
                  onChange={(e) => handleUpdate({ announcementText: e.target.value })}
                  placeholder="e.g. 🚀 Special 60% OFF Creator Offer Live!"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Action Link URL</label>
                <input
                  type="text"
                  value={settings.announcementLink}
                  onChange={(e) => handleUpdate({ announcementLink: e.target.value })}
                  placeholder="e.g. /pricing or /tools"
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Banner Theme Color */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Banner Theme Style</label>
              <div className="flex items-center gap-2.5">
                {(["amber", "emerald", "indigo", "rose", "violet"] as const).map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleUpdate({ announcementBgColor: color })}
                    className={`rounded-xl px-3 py-1.5 text-xs font-extrabold capitalize border transition-all cursor-pointer ${
                      settings.announcementBgColor === color
                        ? "border-foreground bg-foreground text-background scale-105"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
