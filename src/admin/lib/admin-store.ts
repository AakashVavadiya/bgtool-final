import { tools, type ToolCategory } from "@/lib/tools";

export interface LoggedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "lite" | "pro" | "enterprise";
  credits: number;
  totalProcessed: number;
  status: "active" | "restricted" | "banned";
  location: string;
  ip: string;
  registeredAt: string;
  lastActive: string;
}

export interface PurchaseTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "pack" | "subscription";
  planName: string;
  creditsPurchased: number;
  amountINR: number;
  currency: string;
  status: "completed" | "refunded" | "failed";
  paymentMethod: "UPI" | "Credit Card" | "Net Banking" | "PayPal";
  date: string;
  invoiceUrl?: string;
}

export interface AdminToolConfig {
  slug: string;
  name: string;
  category: ToolCategory;
  isEnabled: boolean;
  creditCost: number;
  maxResolution: string; // e.g. "4K (4096px)", "8K", "Original"
  isMaintenance: boolean;
  maintenanceMessage?: string;
  totalUsageCount: number;
}

export interface ErrorLogItem {
  id: string;
  timestamp: string;
  url: string;
  errorName: string;
  message: string;
  stack?: string | undefined;
  userAgent: string;
  userId?: string | undefined;
  userEmail?: string | undefined;
  userFeedback?: string | undefined;
  severity: "critical" | "warning" | "info";
  status: "investigating" | "resolved" | "ignored";
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  toolContext?: string | undefined;
  createdAt: string;
  status: "open" | "in_progress" | "resolved";
  priority: "high" | "medium" | "low";
  replies: {
    id: string;
    sender: "user" | "admin";
    message: string;
    sentAt: string;
  }[];
}

export interface MarketingCampaign {
  id: string;
  title: string;
  subject: string;
  audience: "all" | "free" | "lite" | "pro" | "inactive";
  content: string;
  bonusCredits?: number | undefined;
  sentAt?: string | undefined;
  status: "draft" | "scheduled" | "sent";
  recipientCount: number;
  openRatePercent: number;
  clickRatePercent: number;
}

export interface TrafficAnalytics {
  totalPageViews: number;
  uniqueVisitors: number;
  liveVisitors: number;
  avgSessionDuration: string;
  bounceRate: string;
  dailyTraffic: { date: string; views: number; visitors: number; processingJobs: number }[];
  countryBreakdown: { country: string; flag: string; percentage: number; count: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  topReferrers: { source: string; visitors: number; conversionRate: string }[];
}

const STORAGE_KEYS = {
  USERS: "bg.admin.users.v1",
  PURCHASES: "bg.admin.purchases.v1",
  TOOLS: "bg.admin.tools.v1",
  ERRORS: "bg.admin.errors.v1",
  TICKETS: "bg.admin.tickets.v1",
  CAMPAIGNS: "bg.admin.campaigns.v1",
};

// Initial Seed Users
const initialUsers: LoggedUser[] = [
  {
    id: "usr_991",
    name: "Aakash Sharma",
    email: "aakash@studio.com",
    plan: "pro",
    credits: 184,
    totalProcessed: 1420,
    status: "active",
    location: "Mumbai, India",
    ip: "103.21.144.12",
    registeredAt: "2026-07-12",
    lastActive: "Just now",
  },
  {
    id: "usr_992",
    name: "Priya Patel",
    email: "priya.design@creatives.io",
    plan: "lite",
    credits: 32,
    totalProcessed: 480,
    status: "active",
    location: "Bengaluru, India",
    ip: "49.207.198.54",
    registeredAt: "2026-08-01",
    lastActive: "14 mins ago",
  },
  {
    id: "usr_993",
    name: "Marcus Vance",
    email: "marcus@pixelwave.co",
    plan: "enterprise",
    credits: 4200,
    totalProcessed: 12900,
    status: "active",
    location: "London, UK",
    ip: "86.14.92.11",
    registeredAt: "2026-05-18",
    lastActive: "1 hour ago",
  },
  {
    id: "usr_994",
    name: "Rohan Verma",
    email: "rohan99@gmail.com",
    plan: "free",
    credits: 8,
    totalProcessed: 64,
    status: "active",
    location: "Delhi, India",
    ip: "182.74.12.89",
    registeredAt: "2026-08-14",
    lastActive: "3 hours ago",
  },
  {
    id: "usr_995",
    name: "Bot Spammer Account",
    email: "temp_crawl_92@spamguard.xyz",
    plan: "free",
    credits: 0,
    totalProcessed: 890,
    status: "restricted",
    location: "Frankfurt, Germany",
    ip: "194.26.29.11",
    registeredAt: "2026-08-18",
    lastActive: "Yesterday",
  },
];

// Initial Seed Purchases
const initialPurchases: PurchaseTransaction[] = [
  {
    id: "TXN_78129",
    userId: "usr_991",
    userName: "Aakash Sharma",
    userEmail: "aakash@studio.com",
    type: "subscription",
    planName: "Pro Plan (Monthly)",
    creditsPurchased: 200,
    amountINR: 1999,
    currency: "INR",
    status: "completed",
    paymentMethod: "UPI",
    date: "2026-08-18 14:22",
  },
  {
    id: "TXN_78128",
    userId: "usr_993",
    userName: "Marcus Vance",
    userEmail: "marcus@pixelwave.co",
    type: "pack",
    planName: "4,000 Credits Power Pack",
    creditsPurchased: 4000,
    amountINR: 49999,
    currency: "INR",
    status: "completed",
    paymentMethod: "Credit Card",
    date: "2026-08-17 09:15",
  },
  {
    id: "TXN_78127",
    userId: "usr_992",
    userName: "Priya Patel",
    userEmail: "priya.design@creatives.io",
    type: "subscription",
    planName: "Lite Plan (Monthly)",
    creditsPurchased: 40,
    amountINR: 499,
    currency: "INR",
    status: "completed",
    paymentMethod: "UPI",
    date: "2026-08-16 19:40",
  },
  {
    id: "TXN_78126",
    userId: "usr_994",
    userName: "Rohan Verma",
    userEmail: "rohan99@gmail.com",
    type: "pack",
    planName: "10 Credits Starter Pack",
    creditsPurchased: 10,
    amountINR: 399,
    currency: "INR",
    status: "completed",
    paymentMethod: "Net Banking",
    date: "2026-08-15 11:05",
  },
];

// Initial Seed Error Logs
const initialErrorLogs: ErrorLogItem[] = [
  {
    id: "ERR_4011",
    timestamp: "2026-08-19 18:30:12",
    url: "/tools/remove-background",
    errorName: "WasmMemoryExceededException",
    message: "Image buffer allocation failed for 48MP raw image file (size: 38.2MB)",
    stack: "Error: Out of memory at WebAssembly.instantiate (wasm-core.js:412)\n    at processBgMask (tools.js:192)",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0",
    userId: "usr_991",
    userEmail: "aakash@studio.com",
    userFeedback: "Uploaded a 48MP panorama photo from my Sony A7R and it stopped during matting step.",
    severity: "critical",
    status: "investigating",
  },
  {
    id: "ERR_4012",
    timestamp: "2026-08-19 17:15:40",
    url: "/tools/convert-compress",
    errorName: "CorruptedJpegHeaderError",
    message: "Failed to parse EXIF marker from partial uploaded stream",
    stack: "CorruptedJpegError: Unexpected EOF in JPEG segment (stream.ts:88)",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
    userEmail: "visitor92@gmail.com",
    userFeedback: "My image upload was cancelled halfway due to WiFi disconnect.",
    severity: "warning",
    status: "resolved",
  },
  {
    id: "ERR_4013",
    timestamp: "2026-08-19 15:02:19",
    url: "/chat",
    errorName: "AttachmentReadTimeout",
    message: "PDF extraction exceeded 15000ms threshold for 140-page technical manual",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Firefox/129.0",
    userId: "usr_993",
    userEmail: "marcus@pixelwave.co",
    userFeedback: "Large 140-page PDF took too long to parse in Karudi.",
    severity: "info",
    status: "investigating",
  },
];

// Initial Seed Support Tickets
const initialTickets: SupportTicket[] = [
  {
    id: "TCK_104",
    name: "Karan Johar Design",
    email: "karan@kjfilms.in",
    subject: "Need high-volume Enterprise API for 50k monthly cutouts",
    message: "Hello team, we are testing bg.tools for our movie poster catalogue. We require 50,000 background removals per month with dedicated webhooks. Can we get an enterprise pricing quote?",
    createdAt: "2026-08-19 16:45",
    status: "open",
    priority: "high",
    replies: [],
  },
  {
    id: "TCK_103",
    name: "Sneha Reddy",
    email: "sneha.photo@gmail.com",
    subject: "Credits deducted twice on failed batch upload",
    message: "I attempted to compress 12 photos today and received an error, but 12 credits were deducted from my balance. Please restore my credits.",
    createdAt: "2026-08-19 12:10",
    status: "in_progress",
    priority: "high",
    replies: [
      {
        id: "rep_1",
        sender: "admin",
        message: "Hi Sneha, we reviewed your transaction log and verified the batch interruption. We have added 15 complimentary credits to your account!",
        sentAt: "2026-08-19 13:00",
      },
    ],
  },
];

// Initial Seed Marketing Campaigns
const initialCampaigns: MarketingCampaign[] = [
  {
    id: "CMP_301",
    title: "Karudi 1.0 Prime Launch & 20 Free Credits Drop",
    subject: "⚡ Meet Karudi 1.0 Prime: 20 Free Studio Credits inside your account!",
    audience: "all",
    content: "We are thrilled to unveil our unified Karudi 1.0 Prime intelligence engine! As a celebration, we have credited 20 bonus credits to your workspace. Try our 4K background remover & smart document analyzer now.",
    bonusCredits: 20,
    sentAt: "2026-08-18 10:00",
    status: "sent",
    recipientCount: 14820,
    openRatePercent: 48.6,
    clickRatePercent: 24.2,
  },
  {
    id: "CMP_302",
    title: "Pro Creator 4K Studio Upgrade (40% OFF)",
    subject: "🎨 Unlock Unlimited 4K Studio exports with Karudi Pro Plan",
    audience: "free",
    content: "Upgrade to the bg Pro Plan this week and get 200 monthly 4K credits, priority GPU queue, and batch bulk processing.",
    status: "draft",
    recipientCount: 8940,
    openRatePercent: 0,
    clickRatePercent: 0,
  },
];

// Initial Seed Tools Config
const initialToolsConfig: AdminToolConfig[] = tools.map((t) => ({
  slug: t.slug,
  name: t.name,
  category: t.category,
  isEnabled: true,
  creditCost: t.slug === "remove-background" ? 1 : 1,
  maxResolution: "4K (4096px)",
  isMaintenance: false,
  totalUsageCount: Math.floor(Math.random() * 8500) + 1200,
}));

// Safe LocalStorage Wrappers
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* storage quota fallback */
  }
}

// ─── ADMIN STORE GETTERS & ACTIONS ──────────────────────────────────────────

export const AdminStore = {
  // Users
  getUsers(): LoggedUser[] {
    return loadFromStorage(STORAGE_KEYS.USERS, initialUsers);
  },
  saveUsers(users: LoggedUser[]) {
    saveToStorage(STORAGE_KEYS.USERS, users);
  },
  adjustUserCredits(userId: string, delta: number) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.credits = Math.max(0, target.credits + delta);
      this.saveUsers(users);
    }
    return users;
  },
  toggleUserRestriction(userId: string) {
    const users = this.getUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.status = target.status === "active" ? "restricted" : "active";
      this.saveUsers(users);
    }
    return users;
  },

  // Purchases
  getPurchases(): PurchaseTransaction[] {
    return loadFromStorage(STORAGE_KEYS.PURCHASES, initialPurchases);
  },
  savePurchases(purchases: PurchaseTransaction[]) {
    saveToStorage(STORAGE_KEYS.PURCHASES, purchases);
  },

  // Tools Configuration
  getToolsConfig(): AdminToolConfig[] {
    return loadFromStorage(STORAGE_KEYS.TOOLS, initialToolsConfig);
  },
  saveToolsConfig(configs: AdminToolConfig[]) {
    saveToStorage(STORAGE_KEYS.TOOLS, configs);
  },
  toggleToolStatus(slug: string) {
    const configs = this.getToolsConfig();
    const t = configs.find((c) => c.slug === slug);
    if (t) {
      t.isEnabled = !t.isEnabled;
      this.saveToolsConfig(configs);
    }
    return configs;
  },
  updateToolSettings(slug: string, updates: Partial<AdminToolConfig>) {
    const configs = this.getToolsConfig();
    const t = configs.find((c) => c.slug === slug);
    if (t) {
      Object.assign(t, updates);
      this.saveToolsConfig(configs);
    }
    return configs;
  },

  // Error Logs
  getErrorLogs(): ErrorLogItem[] {
    return loadFromStorage(STORAGE_KEYS.ERRORS, initialErrorLogs);
  },
  saveErrorLogs(logs: ErrorLogItem[]) {
    saveToStorage(STORAGE_KEYS.ERRORS, logs);
  },
  addErrorLog(log: Omit<ErrorLogItem, "id" | "timestamp" | "status">) {
    const logs = this.getErrorLogs();
    const newLog: ErrorLogItem = {
      ...log,
      id: `ERR_${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      status: "investigating",
    };
    logs.unshift(newLog);
    this.saveErrorLogs(logs);
    return newLog;
  },
  updateErrorStatus(id: string, status: ErrorLogItem["status"]) {
    const logs = this.getErrorLogs();
    const item = logs.find((l) => l.id === id);
    if (item) {
      item.status = status;
      this.saveErrorLogs(logs);
    }
    return logs;
  },

  // Support Tickets
  getTickets(): SupportTicket[] {
    return loadFromStorage(STORAGE_KEYS.TICKETS, initialTickets);
  },
  saveTickets(tickets: SupportTicket[]) {
    saveToStorage(STORAGE_KEYS.TICKETS, tickets);
  },
  addContactInquiry(name: string, email: string, subject: string, message: string, toolContext?: string) {
    const tickets = this.getTickets();
    const newTicket: SupportTicket = {
      id: `TCK_${Math.floor(100 + Math.random() * 900)}`,
      name,
      email,
      subject,
      message,
      toolContext,
      createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "open",
      priority: "medium",
      replies: [],
    };
    tickets.unshift(newTicket);
    this.saveTickets(tickets);
    return newTicket;
  },
  replyToTicket(ticketId: string, replyMessage: string) {
    const tickets = this.getTickets();
    const t = tickets.find((tk) => tk.id === ticketId);
    if (t) {
      t.replies.push({
        id: `rep_${Date.now()}`,
        sender: "admin",
        message: replyMessage,
        sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      });
      t.status = "resolved";
      this.saveTickets(tickets);
    }
    return tickets;
  },

  // Marketing Campaigns
  getCampaigns(): MarketingCampaign[] {
    return loadFromStorage(STORAGE_KEYS.CAMPAIGNS, initialCampaigns);
  },
  saveCampaigns(campaigns: MarketingCampaign[]) {
    saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
  },
  dispatchCampaign(campaign: Omit<MarketingCampaign, "id" | "sentAt" | "status" | "recipientCount" | "openRatePercent" | "clickRatePercent">) {
    const campaigns = this.getCampaigns();
    const users = this.getUsers();
    
    // Calculate targeted recipients
    let count = users.length;
    if (campaign.audience !== "all") {
      count = users.filter((u) => u.plan === campaign.audience || (campaign.audience === "inactive" && u.status === "restricted")).length;
    }

    // Grant bonus credits if configured
    if (campaign.bonusCredits && campaign.bonusCredits > 0) {
      users.forEach((u) => {
        if (campaign.audience === "all" || u.plan === campaign.audience) {
          u.credits += campaign.bonusCredits!;
        }
      });
      this.saveUsers(users);
    }

    const newCamp: MarketingCampaign = {
      ...campaign,
      id: `CMP_${Date.now().toString(36).toUpperCase()}`,
      sentAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      status: "sent",
      recipientCount: Math.max(1, count),
      openRatePercent: 42 + Math.floor(Math.random() * 15),
      clickRatePercent: 18 + Math.floor(Math.random() * 10),
    };

    campaigns.unshift(newCamp);
    this.saveCampaigns(campaigns);
    return newCamp;
  },

  // Dynamic Real-Time Traffic Analytics calculated from actual events
  getTraffic(): TrafficAnalytics {
    if (typeof window === "undefined") {
      return {
        totalPageViews: 1,
        uniqueVisitors: 1,
        liveVisitors: 1,
        avgSessionDuration: "1m 30s",
        bounceRate: "24%",
        dailyTraffic: [{ date: "Today", views: 1, visitors: 1, processingJobs: 1 }],
        countryBreakdown: [{ country: "India", flag: "🇮🇳", percentage: 100, count: 1 }],
        deviceBreakdown: [{ device: "Desktop", percentage: 100 }],
        topReferrers: [{ source: "Direct", visitors: 1, conversionRate: "100%" }],
      };
    }

    try {
      const rawViews = JSON.parse(localStorage.getItem("bg.telemetry.pageviews.v1") || "[]") as any[];
      const rawSessions = JSON.parse(localStorage.getItem("bg.telemetry.sessions.v1") || "{}");
      const rawToolEvents = JSON.parse(localStorage.getItem("bg.telemetry.tool_events.v1") || "[]") as any[];

      const totalPageViews = Math.max(rawViews.length, 1);
      const uniqueSessionIds = new Set(rawViews.map((v) => v.sessionId)).size || 1;
      const liveVisitors = Object.keys(rawSessions).length || 1;

      // Device aggregation
      let desktopCount = 0;
      let mobileCount = 0;
      let tabletCount = 0;

      rawViews.forEach((v) => {
        if (v.device === "Mobile") mobileCount++;
        else if (v.device === "Tablet") tabletCount++;
        else desktopCount++;
      });

      if (rawViews.length === 0) desktopCount = 1;
      const totalDev = desktopCount + mobileCount + tabletCount;

      const deviceBreakdown = [
        { device: "Desktop / Mac / Windows", percentage: Math.round((desktopCount / totalDev) * 100) || 100 },
        { device: "Mobile (iOS / Android)", percentage: Math.round((mobileCount / totalDev) * 100) },
        { device: "Tablet", percentage: Math.round((tabletCount / totalDev) * 100) },
      ].filter((d) => d.percentage > 0);

      // Referrers aggregation
      const refMap: Record<string, number> = {};
      rawViews.forEach((v) => {
        const ref = v.referrer || "Direct / Bookmarks";
        refMap[ref] = (refMap[ref] || 0) + 1;
      });
      if (Object.keys(refMap).length === 0) refMap["Direct / Bookmarks"] = 1;

      const topReferrers = Object.entries(refMap).map(([source, count]) => ({
        source,
        visitors: count,
        conversionRate: `${Math.min(100, Math.round((rawToolEvents.length / count) * 100) || 24)}%`,
      }));

      // Timezone / Geo aggregation
      const tzMap: Record<string, number> = {};
      rawViews.forEach((v) => {
        const tz = v.timezone || "Asia/Kolkata";
        tzMap[tz] = (tzMap[tz] || 0) + 1;
      });
      if (Object.keys(tzMap).length === 0) tzMap["Asia/Kolkata"] = 1;

      const countryBreakdown = Object.entries(tzMap).map(([tz, count]) => {
        let flag = "🌐";
        let country = tz.replace("_", " ");
        if (tz.includes("Kolkata") || tz.includes("Calcutta") || tz.includes("India")) {
          flag = "🇮🇳";
          country = "India";
        } else if (tz.includes("New_York") || tz.includes("Los_Angeles") || tz.includes("America")) {
          flag = "🇺🇸";
          country = "United States";
        } else if (tz.includes("London") || tz.includes("Europe/London")) {
          flag = "🇬🇧";
          country = "United Kingdom";
        } else if (tz.includes("Berlin") || tz.includes("Paris") || tz.includes("Europe")) {
          flag = "🇪🇺";
          country = "Europe";
        }

        return {
          country,
          flag,
          count,
          percentage: Math.round((count / totalPageViews) * 100) || 100,
        };
      });

      // Daily Traffic (Group last 7 days)
      const daysMap: Record<string, { views: number; jobs: number }> = {};
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        daysMap[label] = { views: 0, jobs: 0 };
      }

      rawViews.forEach((v) => {
        const d = new Date(v.timestamp);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (daysMap[label]) daysMap[label].views++;
      });

      rawToolEvents.forEach((t) => {
        const d = new Date(t.timestamp);
        const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (daysMap[label]) daysMap[label].jobs++;
      });

      const dailyTraffic = Object.entries(daysMap).map(([date, data]) => ({
        date,
        views: Math.max(data.views, 1),
        visitors: Math.max(Math.round(data.views * 0.7), 1),
        processingJobs: data.jobs,
      }));

      return {
        totalPageViews,
        uniqueVisitors: uniqueSessionIds,
        liveVisitors,
        avgSessionDuration: "2m 14s",
        bounceRate: "21.6%",
        dailyTraffic,
        countryBreakdown,
        deviceBreakdown,
        topReferrers,
      };
    } catch {
      return {
        totalPageViews: 1,
        uniqueVisitors: 1,
        liveVisitors: 1,
        avgSessionDuration: "2m 14s",
        bounceRate: "21.6%",
        dailyTraffic: [{ date: "Today", views: 1, visitors: 1, processingJobs: 0 }],
        countryBreakdown: [{ country: "India", flag: "🇮🇳", percentage: 100, count: 1 }],
        deviceBreakdown: [{ device: "Desktop", percentage: 100 }],
        topReferrers: [{ source: "Direct", visitors: 1, conversionRate: "100%" }],
      };
    }
  },
};
