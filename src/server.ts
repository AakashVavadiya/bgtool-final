import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";

function getPythonCommand(): string {
  const pythonPath = process.env["PYTHON_PATH"];
  if (pythonPath) {
    try {
      execSync(`"${pythonPath}" --version`, { stdio: "ignore" });
      return pythonPath;
    } catch {
      return pythonPath;
    }
  }
  const commands = ["python", "python3", "py"];
  for (const cmd of commands) {
    try {
      execSync(`"${cmd}" --version`, { stdio: "ignore" });
      return cmd;
    } catch {
      // try next
    }
  }
  return "python";
}

let isSpawningPython = false;

async function ensurePythonServerRunning(): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ping = await fetch("http://127.0.0.1:5000/ping", { signal: AbortSignal.timeout(2000) });
      if (ping.ok) return true;
    } catch {}
    if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
  }

  if (isSpawningPython) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const ping = await fetch("http://127.0.0.1:5000/ping", { signal: AbortSignal.timeout(2000) });
        if (ping.ok) return true;
      } catch {}
    }
    return false;
  }

  isSpawningPython = true;
  try {
    const pyCmd = getPythonCommand();
    const serverScript = path.join(process.cwd(), "scripts", "bg_remover_server.py");
    console.log(`[Auto-Spawn] Launching Python background remover server: ${pyCmd} "${serverScript}" 5000`);
    const child = spawn(pyCmd, [serverScript, "5000"], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const ping = await fetch("http://127.0.0.1:5000/ping", { signal: AbortSignal.timeout(2000) });
        if (ping.ok) {
          console.log("[Auto-Spawn] Python background remover server is online!");
          return true;
        }
      } catch {}
    }
    return false;
  } catch (err) {
    console.error("[Auto-Spawn] Failed to spawn Python server:", err);
    return false;
  } finally {
    isSpawningPython = false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Proxy API requests directly to the Python AI backend
    if (url.pathname === "/api/remove-bg") {
      try {
        const bodyText = await request.text();
        let pythonResponse: Response;
        try {
          pythonResponse = await fetch("http://127.0.0.1:5000/remove-base64", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: bodyText,
          });
        } catch {
          console.warn("[Server] Python backend unreachable. Attempting auto-spawn...");
          const running = await ensurePythonServerRunning();
          if (!running) {
            throw new Error("Python background remover server is offline and auto-spawn failed.");
          }
          pythonResponse = await fetch("http://127.0.0.1:5000/remove-base64", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: bodyText,
          });
        }
        return pythonResponse;
      } catch (err: any) {
        console.error("Proxy error /api/remove-bg:", err);
        return new Response(
          JSON.stringify({ success: false, error: "Server is busy. Please try again in a few moments." }),
          {
            status: 502,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    if (url.pathname === "/api/remove-watermark") {
      try {
        const bodyText = await request.text();
        let pythonResponse: Response;
        try {
          pythonResponse = await fetch("http://127.0.0.1:5001/remove-watermark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyText,
          });
        } catch {
          console.warn("[Server] Python watermark backend unreachable. Auto-spawning port 5001...");
          const pyCmd = getPythonCommand();
          const serverScript = path.join(process.cwd(), "scripts", "watermark_server.py");
          const child = spawn(pyCmd, [serverScript, "5001"], { detached: true, stdio: "ignore" });
          child.unref();
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 800));
            try {
              const ping = await fetch("http://127.0.0.1:5001/ping");
              if (ping.ok) break;
            } catch {}
          }
          pythonResponse = await fetch("http://127.0.0.1:5001/remove-watermark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyText,
          });
        }
        return pythonResponse;
      } catch (err: any) {
        console.error("Proxy error /api/remove-watermark:", err);
        return new Response(
          JSON.stringify({ success: false, error: "Watermark Engine is busy. Please try again in a few moments." }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (url.pathname === "/api/blur-face" || url.pathname === "/api/detect-faces") {
      try {
        const bodyText = await request.text();
        const targetPath = url.pathname === "/api/detect-faces" ? "/detect-faces" : "/blur-face";
        let pythonResponse: Response;
        try {
          pythonResponse = await fetch(`http://127.0.0.1:5001${targetPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyText,
          });
        } catch {
          console.warn("[Server] Python face blur backend unreachable. Auto-spawning port 5001...");
          const pyCmd = getPythonCommand();
          const serverScript = path.join(process.cwd(), "scripts", "watermark_server.py");
          const child = spawn(pyCmd, [serverScript, "5001"], { detached: true, stdio: "ignore" });
          child.unref();
          for (let i = 0; i < 10; i++) {
            await new Promise((r) => setTimeout(r, 800));
            try {
              const ping = await fetch("http://127.0.0.1:5001/ping");
              if (ping.ok) break;
            } catch {}
          }
          pythonResponse = await fetch(`http://127.0.0.1:5001${targetPath}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyText,
          });
        }
        return pythonResponse;
      } catch (err: any) {
        console.error(`Proxy error ${url.pathname}:`, err);
        return new Response(
          JSON.stringify({ success: false, error: "Face Blur Engine is busy. Please try again in a few moments." }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (url.pathname === "/api/contact") {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "contact-inquiries.json");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf-8");
      }

      if (request.method === "GET") {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          return new Response(content || "[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }

      if (request.method === "POST") {
        try {
          const body = (await request.json()) as any;
          let current: any[] = [];
          try {
            if (fs.existsSync(filePath)) {
              current = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
            }
          } catch {
            current = [];
          }

          const newTicket = {
            id: `TCK_${Math.floor(100 + Math.random() * 900)}`,
            name: body.name || "Anonymous",
            email: body.email || "",
            subject: body.subject || "General Inquiry",
            message: body.message || "",
            toolContext: body.toolContext || "",
            createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            status: "open",
            priority: "medium",
            replies: [],
          };

          current.unshift(newTicket);
          fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf-8");

          return new Response(JSON.stringify({ success: true, ticket: newTicket }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    if (url.pathname === "/api/tools-config") {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "tools-config.json");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf-8");
      }

      if (request.method === "GET") {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          return new Response(content || "[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    if (url.pathname === "/api/plans-config") {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "plans-config.json");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (request.method === "GET") {
        try {
          if (!fs.existsSync(filePath)) {
            return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
          }
          const content = fs.readFileSync(filePath, "utf-8");
          return new Response(content || "[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    if (url.pathname === "/api/users") {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, "users.json");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (request.method === "GET") {
        try {
          if (!fs.existsSync(filePath)) {
            return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
          }
          const content = fs.readFileSync(filePath, "utf-8");
          return new Response(content || "[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          return new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
        }
      }

      if (request.method === "POST") {
        try {
          const body = await request.json();
          fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
