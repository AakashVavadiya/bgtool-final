import { tools } from "@/lib/tools";
import {
  AdminStore,
  type SiteHealthRouteItem,
  type SiteHealthAuditReport,
} from "@/admin/lib/admin-store";

function getTimestamp(): string {
  const d = new Date();
  const time = d.toTimeString().split(" ")[0];
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${time}.${ms}`;
}

/**
 * Builds the comprehensive catalog of every page, tool, and endpoint
 * across the entire website for automated testing.
 */
export function getSiteCatalog(): SiteHealthRouteItem[] {
  const catalog: SiteHealthRouteItem[] = [
    // Core Application Pages
    {
      id: "core_home",
      name: "Home Landing Page",
      url: "/",
      category: "core",
      categoryLabel: "Core Page",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_chat",
      name: "Karudi 1.0 Prime Assistant",
      url: "/chat",
      category: "chat",
      categoryLabel: "AI Chat Orchestrator",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_models",
      name: "Karudi AI Models Architecture",
      url: "/models",
      category: "core",
      categoryLabel: "Core Page",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_pricing",
      name: "Pricing & Credit Store",
      url: "/pricing",
      category: "account",
      categoryLabel: "Billing Portal",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_auth",
      name: "User Login & Registration",
      url: "/auth",
      category: "account",
      categoryLabel: "Auth Portal",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_contact",
      name: "Support Desk & Contact Form",
      url: "/contact",
      category: "core",
      categoryLabel: "Support",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_terms",
      name: "Terms of Service",
      url: "/terms",
      category: "core",
      categoryLabel: "Legal",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_privacy",
      name: "Privacy & Data Policy",
      url: "/privacy",
      category: "core",
      categoryLabel: "Legal",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "core_admin",
      name: "Admin Control Console",
      url: "/admin",
      category: "core",
      categoryLabel: "Administration",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
  ];

  // Dynamically index all tools from tools library
  tools.forEach((t) => {
    const isPdf =
      t.slug.includes("pdf") ||
      t.slug.includes("word") ||
      t.slug.includes("excel") ||
      t.slug.includes("powerpoint") ||
      t.slug.includes("document");

    catalog.push({
      id: `tool_${t.slug}`,
      name: t.name,
      url: `/tools/${t.slug}`,
      category: isPdf ? "pdf-tool" : "image-tool",
      categoryLabel: isPdf ? "PDF & Document Tool" : "Image Processing Tool",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    });
  });

  // API Endpoints
  catalog.push(
    {
      id: "api_plans",
      name: "Plans & Festival Offers API",
      url: "/api/plans-config",
      category: "api",
      categoryLabel: "REST API",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "api_contact",
      name: "Support Tickets API",
      url: "/api/contact",
      category: "api",
      categoryLabel: "REST API",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    },
    {
      id: "api_users",
      name: "User Accounts Directory API",
      url: "/api/users",
      category: "api",
      categoryLabel: "REST API",
      status: "idle",
      errorsCaptured: [],
      logs: [],
    }
  );

  return catalog;
}

/**
 * Deep Multi-Vector Health Checkup for an individual route:
 * 1. Measures HTTP status & network latency
 * 2. Mounts headless DOM sandbox (for HTML routes)
 * 3. Traps window.onerror, unhandledrejection, console.error
 * 4. AUTO-CAPTURES any runtime exception into AdminStore
 * 5. Verifies document title & root element rendering
 */
export async function testSingleRouteHealth(
  route: SiteHealthRouteItem,
  onLog?: (log: { timestamp: string; level: "info" | "success" | "warn" | "error"; message: string }) => void
): Promise<SiteHealthRouteItem> {
  const result: SiteHealthRouteItem = {
    ...route,
    status: "testing",
    errorsCaptured: [],
    logs: [],
  };

  const addLog = (level: "info" | "success" | "warn" | "error", message: string) => {
    const entry = { timestamp: getTimestamp(), level, message };
    result.logs.push(entry);
    if (onLog) onLog(entry);
  };

  addLog("info", `Starting health audit probe for: ${route.name} (${route.url})`);

  const startTime = performance.now();
  let httpStatus = 200;
  let pageTitle = "";
  let hasRootElements = false;
  const isApi = route.category === "api";

  // ─── STEP 1: Pre-flight HTTP fetch probe ────────────────────────────────────
  try {
    const res = await fetch(route.url, {
      cache: "no-store",
      headers: { "X-BG-Health-Probe": "1" },
    });
    httpStatus = res.status;
    const latency = Math.round(performance.now() - startTime);
    result.latencyMs = latency;
    result.httpStatus = httpStatus;

    if (res.ok) {
      addLog("success", `HTTP ${res.status} OK received in ${latency}ms`);
    } else {
      addLog("error", `HTTP failure status: ${res.status} ${res.statusText}`);
    }
  } catch (fetchErr) {
    const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
    addLog("error", `Network probe failed: ${msg}`);
    httpStatus = 0;
    result.httpStatus = 0;
    result.latencyMs = Math.round(performance.now() - startTime);
  }

  // ─── STEP 2: Headless DOM Sandbox & Error Traps (For Frontend Pages) ────────
  if (!isApi && httpStatus === 200 && typeof document !== "undefined") {
    addLog("info", `Mounting isolated sandbox container to inspect runtime JavaScript execution...`);

    let iframe: HTMLIFrameElement | null = null;
    const cleanUrl = route.url.split("?")[0] || "/";
    const testUrl = `${cleanUrl}${cleanUrl.includes("?") ? "&" : "?"}__bg_health_test=${Date.now()}`;

    try {
      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "1024px";
      iframe.style.height = "768px";
      iframe.style.opacity = "0";
      iframe.style.pointerEvents = "none";
      iframe.setAttribute("aria-hidden", "true");

      document.body.appendChild(iframe);

      const win = iframe.contentWindow;
      if (win) {
        // Intercept runtime window.onerror
        win.addEventListener("error", (e: ErrorEvent) => {
          const msg = e.message || String(e);
          if (msg.includes("Hydration failed") || msg.includes("hydrating")) return;

          const capturedError = {
            name: e.error?.name || "UnhandledWindowError",
            message: msg,
            stack: e.error?.stack,
            capturedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
          };

          result.errorsCaptured.push(capturedError);
          addLog("error", `🚨 Runtime exception caught: ${msg}`);

          // AUTO-CAPTURE into AdminStore
          AdminStore.addErrorLog({
            url: route.url,
            errorName: capturedError.name,
            message: capturedError.message,
            stack: capturedError.stack,
            userAgent: navigator.userAgent,
            userFeedback: `Auto-captured during automated site health checkup of ${route.name}`,
            severity: "critical",
          });
          addLog("warn", `✓ Auto-captured into Admin Error Logs registry`);
        });

        // Intercept unhandledrejection
        win.addEventListener("unhandledrejection", (e: PromiseRejectionEvent) => {
          const msg = String(e.reason?.message || e.reason || "Unhandled promise rejection");
          const capturedError = {
            name: "UnhandledPromiseRejection",
            message: msg,
            stack: e.reason?.stack,
            capturedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
          };

          result.errorsCaptured.push(capturedError);
          addLog("error", `🚨 Async promise rejection: ${msg}`);

          AdminStore.addErrorLog({
            url: route.url,
            errorName: capturedError.name,
            message: capturedError.message,
            stack: capturedError.stack,
            userAgent: navigator.userAgent,
            userFeedback: `Auto-captured during automated site health checkup of ${route.name}`,
            severity: "warning",
          });
        });

        // Intercept console.error
        const winWithConsole = win as unknown as Window & { console?: Console };
        if (winWithConsole.console) {
          const origConsoleError = winWithConsole.console.error;
          winWithConsole.console.error = (...args: unknown[]) => {
            try {
              origConsoleError.apply(winWithConsole.console, args);
            } catch {
              /* ignore */
            }
            const text = args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
            if (
              text.includes("Hydration failed") ||
              text.includes("Minified React error") ||
              text.includes("ResizeObserver")
            ) {
              return;
            }

            if (text.toLowerCase().includes("error") || text.toLowerCase().includes("not defined")) {
              const captured = {
                name: "ReactConsoleError",
                message: text.slice(0, 300),
                capturedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
              };
              result.errorsCaptured.push(captured);
              addLog("error", `🚨 Console error logged: ${captured.message.slice(0, 120)}`);

              AdminStore.addErrorLog({
                url: route.url,
                errorName: captured.name,
                message: captured.message,
                userAgent: navigator.userAgent,
                userFeedback: `Auto-captured console error during health checkup of ${route.name}`,
                severity: "warning",
              });
            }
          };
        }
      }

      // Navigate sandbox to URL
      iframe.src = testUrl;

      // Allow 2000ms for script execution and hydration
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            const doc = iframe?.contentDocument;
            pageTitle = doc?.title || "";
            const root = doc?.getElementById("root") || doc?.body;
            hasRootElements = (root?.children.length ?? 0) > 0;
            addLog("info", `Document title: "${pageTitle}"`);
            addLog("info", `Rendered DOM elements: ${hasRootElements ? "Yes (Healthy)" : "Blank/Empty (Warning)"}`);
          } catch {
            /* cross origin guard */
          }
          resolve();
        }, 1800);
      });
    } catch (sandboxErr) {
      const msg = sandboxErr instanceof Error ? sandboxErr.message : String(sandboxErr);
      addLog("warn", `Sandbox execution notice: ${msg}`);
    } finally {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }
  }

  result.pageTitle = pageTitle;
  result.hasRootElements = hasRootElements;
  result.testedAt = new Date().toISOString().replace("T", " ").slice(0, 19);

  // ─── STEP 3: Formulate Verdict ─────────────────────────────────────────────
  if (result.errorsCaptured.length > 0 || (httpStatus >= 400 || httpStatus === 0)) {
    result.status = "error";
    result.summary =
      result.errorsCaptured.length > 0
        ? `CRITICAL: ${result.errorsCaptured.length} runtime error(s) detected and auto-captured into Error Logs.`
        : `CRITICAL: Route returned HTTP failure status ${httpStatus}.`;
    addLog("error", `❌ Verdict: ERROR — ${result.summary}`);
  } else if ((result.latencyMs ?? 0) > 1800 || (!isApi && !hasRootElements)) {
    result.status = "warning";
    result.summary =
      (result.latencyMs ?? 0) > 1800
        ? `WARNING: High latency response (${result.latencyMs}ms).`
        : `WARNING: Page loaded but rendered zero child elements.`;
    addLog("warn", `⚠️ Verdict: DEGRADED — ${result.summary}`);
  } else {
    result.status = "healthy";
    result.summary = `OPERATIONAL: Route rendered cleanly with 0 exceptions in ${result.latencyMs}ms.`;
    addLog("success", `✅ Verdict: HEALTHY — ${result.summary}`);
  }

  return result;
}

/**
 * Runs a complete site-wide health audit across all routes.
 */
export async function runFullSiteHealthAudit(
  routes: SiteHealthRouteItem[],
  options?: {
    onProgress?: (
      currentRoute: SiteHealthRouteItem,
      completedCount: number,
      totalCount: number,
      currentReport: SiteHealthAuditReport
    ) => void;
    shouldCancel?: () => boolean;
  }
): Promise<SiteHealthAuditReport> {
  const startedAt = new Date().toISOString().replace("T", " ").slice(0, 19);
  const auditedRoutes: SiteHealthRouteItem[] = [];

  for (let i = 0; i < routes.length; i++) {
    if (options?.shouldCancel && options.shouldCancel()) {
      break;
    }

    const route = routes[i];
    if (!route) continue;
    const audited = await testSingleRouteHealth(route);
    auditedRoutes.push(audited);

    const healthyCount = auditedRoutes.filter((r) => r.status === "healthy").length;
    const warningCount = auditedRoutes.filter((r) => r.status === "warning").length;
    const errorCount = auditedRoutes.filter((r) => r.status === "error").length;
    const totalLatencies = auditedRoutes.reduce((acc, r) => acc + (r.latencyMs || 0), 0);
    const avgLatencyMs = Math.round(totalLatencies / auditedRoutes.length);
    const healthScorePercent = Math.round((healthyCount / auditedRoutes.length) * 100);

    const currentReport: SiteHealthAuditReport = {
      id: `AUDIT_${Date.now().toString(36).toUpperCase()}`,
      startedAt,
      completedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
      totalRoutes: auditedRoutes.length,
      healthyCount,
      warningCount,
      errorCount,
      healthScorePercent,
      avgLatencyMs,
      routes: auditedRoutes,
    };

    if (options?.onProgress) {
      options.onProgress(audited, auditedRoutes.length, routes.length, currentReport);
    }
  }

  const healthyCount = auditedRoutes.filter((r) => r.status === "healthy").length;
  const warningCount = auditedRoutes.filter((r) => r.status === "warning").length;
  const errorCount = auditedRoutes.filter((r) => r.status === "error").length;
  const totalLatencies = auditedRoutes.reduce((acc, r) => acc + (r.latencyMs || 0), 0);
  const avgLatencyMs = Math.round(totalLatencies / (auditedRoutes.length || 1));
  const healthScorePercent = Math.round((healthyCount / (auditedRoutes.length || 1)) * 100);

  const finalReport: SiteHealthAuditReport = {
    id: `AUDIT_${Date.now().toString(36).toUpperCase()}`,
    startedAt,
    completedAt: new Date().toISOString().replace("T", " ").slice(0, 19),
    totalRoutes: auditedRoutes.length,
    healthyCount,
    warningCount,
    errorCount,
    healthScorePercent,
    avgLatencyMs,
    routes: auditedRoutes,
  };

  AdminStore.saveHealthAudit(finalReport);
  return finalReport;
}
