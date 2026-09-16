import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

import { NotFoundPage } from "@/components/NotFoundPage";
import { ErrorPage } from "@/components/ErrorPage";
import { Telemetry } from "@/lib/telemetry";
import { initWebsiteTranslator } from "@/lib/translator";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google", content: "notranslate" },
      { title: "BG Remover Magic | Free Background Removal & Image Tools" },
      { name: "description", content: "Free online background removal, upscaling, compression, and image editing tools." },
      { name: "author", content: "BG Remover Magic" },
      { property: "og:title", content: "BG Remover Magic | Free Background Removal & Image Tools" },
      { property: "og:description", content: "Free online background removal, upscaling, compression, and image editing tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],

  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="notranslate" translate="no">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    // Initialize full website translation engine with regional auto-detection
    initWebsiteTranslator();

    // Track Real Page View on Route change
    Telemetry.trackPageView(currentPath, document.title);

    // Heartbeat every 20s to keep real-time live visitors counter accurate
    const timer = setInterval(() => {
      Telemetry.sendHeartbeat(currentPath);
    }, 20000);

    // Global Error & Promise Rejection listener to auto-send crash logs to Admin
    const handleGlobalError = (event: ErrorEvent) => {
      import("@/admin/lib/admin-store").then(({ AdminStore }) => {
        AdminStore.addErrorLog({
          url: window.location.pathname,
          errorName: event.error?.name || "GlobalWindowError",
          message: event.message || "Uncaught window exception",
          stack: event.error?.stack,
          userAgent: navigator.userAgent,
          userFeedback: "Auto-captured global browser exception",
          severity: "critical",
        });
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      import("@/admin/lib/admin-store").then(({ AdminStore }) => {
        AdminStore.addErrorLog({
          url: window.location.pathname,
          errorName: "UnhandledPromiseRejection",
          message: String(event.reason?.message || event.reason || "Unhandled async rejection"),
          stack: event.reason?.stack,
          userAgent: navigator.userAgent,
          userFeedback: "Auto-captured async promise rejection",
          severity: "warning",
        });
      });
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      clearInterval(timer);
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [currentPath]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
