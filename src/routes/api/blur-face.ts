import { createFileRoute } from "@tanstack/react-router";
import { execSync, spawn } from "child_process";
import path from "path";

function getPythonCommand(): string {
  if (process.env["PYTHON_PATH"]) return process.env["PYTHON_PATH"];
  const commands = ["python", "python3", "py"];
  for (const cmd of commands) {
    try {
      execSync(`"${cmd}" --version`, { stdio: "ignore" });
      return cmd;
    } catch {}
  }
  return "python";
}

let isSpawningFacePython = false;

async function ensureFaceServerRunning(): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const ping = await fetch("http://127.0.0.1:5001/ping", { signal: AbortSignal.timeout(1500) });
      if (ping.ok) return true;
    } catch {}
    if (attempt < 2) await new Promise((r) => setTimeout(r, 400));
  }

  if (isSpawningFacePython) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 800));
      try {
        const ping = await fetch("http://127.0.0.1:5001/ping", { signal: AbortSignal.timeout(1500) });
        if (ping.ok) return true;
      } catch {}
    }
    return false;
  }

  isSpawningFacePython = true;
  try {
    const pyCmd = getPythonCommand();
    const serverScript = path.join(process.cwd(), "scripts", "watermark_server.py");
    console.log(`[Auto-Spawn] Launching Python Face Blur server: ${pyCmd} "${serverScript}" 5001`);
    const child = spawn(pyCmd, [serverScript, "5001"], {
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      try {
        const ping = await fetch("http://127.0.0.1:5001/ping", { signal: AbortSignal.timeout(1500) });
        if (ping.ok) {
          console.log("[Auto-Spawn] Python Face Blur server online!");
          return true;
        }
      } catch {}
    }
    return false;
  } catch (err) {
    console.error("[Auto-Spawn] Face blur server spawn failed:", err);
    return false;
  } finally {
    isSpawningFacePython = false;
  }
}

export const Route = createFileRoute("/api/blur-face")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const bodyText = await request.text();

          let pythonResponse: Response;
          try {
            pythonResponse = await fetch("http://127.0.0.1:5001/blur-face", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: bodyText,
            });
          } catch {
            console.warn("[API Route] Face blur Python backend unreachable. Auto-spawning...");
            const running = await ensureFaceServerRunning();
            if (!running) {
              return new Response(
                JSON.stringify({
                  success: false,
                  error: "Face Blur AI Engine is starting up. Please try again in a moment.",
                }),
                { status: 503, headers: { "Content-Type": "application/json" } }
              );
            }
            pythonResponse = await fetch("http://127.0.0.1:5001/blur-face", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: bodyText,
            });
          }

          const responseData = await pythonResponse.text();
          return new Response(responseData, {
            status: pythonResponse.status,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("API /api/blur-face error:", err);
          return new Response(
            JSON.stringify({
              success: false,
              error: err.message || "Failed to blur faces.",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
