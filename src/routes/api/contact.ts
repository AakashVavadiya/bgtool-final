import { createFileRoute } from "@tanstack/react-router";
import fs from "fs";
import path from "path";

function getInquiriesFilePath() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, "contact-inquiries.json");
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
  return filePath;
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const filePath = getInquiriesFilePath();
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
          const filePath = getInquiriesFilePath();
          let current: any[] = [];
          try {
            current = JSON.parse(fs.readFileSync(filePath, "utf-8") || "[]");
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
      },
    },
  },
});
