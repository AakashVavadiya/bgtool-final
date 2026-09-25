import { createFileRoute } from "@tanstack/react-router";
import fs from "fs";
import path from "path";

function getToolsConfigFilePath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, "tools-config.json");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
  return filePath;
}

export const Route = createFileRoute("/api/tools-config")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const filePath = getToolsConfigFilePath();
          const content = fs.readFileSync(filePath, "utf-8");
          return new Response(content || "[]", {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const filePath = getToolsConfigFilePath();
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
      },
    },
  },
});
