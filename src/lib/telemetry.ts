// Real-time Client Telemetry & Analytics Engine for bg.tools

export interface RealPageView {
  id: string;
  path: string;
  title: string;
  referrer: string;
  device: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  language: string;
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  timestamp: number; // Unix epoch ms
  timeStr: string;
  sessionId: string;
}

export interface RealSessionHeartbeat {
  sessionId: string;
  lastPing: number;
  path: string;
  device: string;
  referrer: string;
  timezone: string;
}

const STORAGE_KEYS = {
  PAGE_VIEWS: "bg.telemetry.pageviews.v1",
  SESSIONS: "bg.telemetry.sessions.v1",
  CURRENT_SESSION: "bg.telemetry.current_session.v1",
  TOOL_EVENTS: "bg.telemetry.tool_events.v1",
};

export const REALTIME_EVENT_NAME = "bg:telemetry:update";

function parseDevice(ua: string): { device: "Desktop" | "Mobile" | "Tablet"; os: string; browser: string } {
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Tablet|PlayBook/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));

  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  if (isTablet) device = "Tablet";
  else if (isMobile) device = "Mobile";

  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Chrome";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Chrome/i.test(ua)) browser = "Chrome";

  return { device, os, browser };
}

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  let sId = sessionStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  if (!sId) {
    sId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sId);
  }
  return sId;
}

export const Telemetry = {
  trackPageView(pathname: string, title?: string) {
    if (typeof window === "undefined") return;

    try {
      const ua = navigator.userAgent || "";
      const { device, os, browser } = parseDevice(ua);
      const sessionId = getOrCreateSessionId();
      const now = Date.now();

      const pageView: RealPageView = {
        id: `pv_${now.toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        path: pathname || window.location.pathname,
        title: title || document.title || "bg Image Toolkit",
        referrer: document.referrer ? new URL(document.referrer, window.location.href).hostname : "Direct / Bookmarks",
        device,
        os,
        browser,
        language: navigator.language || "en-US",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timestamp: now,
        timeStr: new Date().toISOString().replace("T", " ").slice(0, 19),
        sessionId,
      };

      // Read existing views and prepend
      const existingViews = this.getRawPageViews();
      existingViews.unshift(pageView);
      // Keep up to latest 5,000 real hits
      if (existingViews.length > 5000) existingViews.length = 5000;
      localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, JSON.stringify(existingViews));

      // Update active session heartbeat
      this.sendHeartbeat(pageView.path, device, pageView.referrer, pageView.timezone);

      // Broadcast realtime event
      window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "pageview", data: pageView } }));
    } catch {
      /* ignore storage quotas */
    }
  },

  sendHeartbeat(path?: string, device?: string, referrer?: string, timezone?: string) {
    if (typeof window === "undefined") return;
    try {
      const sessionId = getOrCreateSessionId();
      const sessions = this.getRawSessions();
      const now = Date.now();

      sessions[sessionId] = {
        sessionId,
        lastPing: now,
        path: path || window.location.pathname,
        device: device || "Desktop",
        referrer: referrer || "Direct",
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      };

      // Clean sessions older than 45 seconds
      const cutoff = now - 45000;
      Object.keys(sessions).forEach((s) => {
        if (sessions[s] && sessions[s].lastPing < cutoff) {
          delete sessions[s];
        }
      });

      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "heartbeat" } }));
    } catch {
      /* ignore */
    }
  },

  trackToolUsage(toolSlug: string, toolName: string, durationMs?: number) {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOOL_EVENTS) || "[]";
      const events = JSON.parse(raw) as { toolSlug: string; toolName: string; timestamp: number; durationMs?: number }[];
      const entry: { toolSlug: string; toolName: string; timestamp: number; durationMs?: number } = {
        toolSlug,
        toolName,
        timestamp: Date.now(),
      };
      if (durationMs !== undefined) {
        entry.durationMs = durationMs;
      }
      events.unshift(entry);
      if (events.length > 3000) events.length = 3000;
      localStorage.setItem(STORAGE_KEYS.TOOL_EVENTS, JSON.stringify(events));

      window.dispatchEvent(new CustomEvent(REALTIME_EVENT_NAME, { detail: { type: "tool_usage", toolSlug } }));
    } catch {
      /* ignore */
    }
  },

  getRawPageViews(): RealPageView[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PAGE_VIEWS);
      return raw ? (JSON.parse(raw) as RealPageView[]) : [];
    } catch {
      return [];
    }
  },

  getRawSessions(): Record<string, RealSessionHeartbeat> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return raw ? (JSON.parse(raw) as Record<string, RealSessionHeartbeat>) : {};
    } catch {
      return {};
    }
  },

  getRawToolEvents(): { toolSlug: string; toolName: string; timestamp: number; durationMs?: number }[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TOOL_EVENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  getLiveActiveUsersCount(): number {
    const sessions = this.getRawSessions();
    const now = Date.now();
    const cutoff = now - 45000;
    return Object.values(sessions).filter((s) => s.lastPing >= cutoff).length || 1;
  },
};
