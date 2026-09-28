import { createFileRoute } from "@tanstack/react-router";
import fs from "fs";
import path from "path";

function getDataFilePath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "users.json");
}

export const Route = createFileRoute("/api/users")({
  loader: async () => {
    try {
      const filePath = getDataFilePath();
      if (!fs.existsSync(filePath)) {
        return { users: [] };
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const users = JSON.parse(raw || "[]");
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      let modified = false;
      if (Array.isArray(users)) {
        for (const u of users) {
          if (u.lastCreditReset !== today) {
            u.freeCredits = 10;
            if (typeof u.paidCredits !== "number") {
              u.paidCredits = Math.max(0, (u.credits || 0) > 10 ? Math.round(((u.credits || 0) - 10) * 100) / 100 : 0);
            }
            u.credits = Math.round((u.freeCredits + u.paidCredits) * 100) / 100;
            u.lastCreditReset = today;
            modified = true;
          }
        }
        if (modified) {
          const newStr = JSON.stringify(users, null, 2);
          let currentStr = "";
          try {
            if (fs.existsSync(filePath)) currentStr = fs.readFileSync(filePath, "utf-8");
          } catch {}
          if (currentStr !== newStr) {
            fs.writeFileSync(filePath, newStr, "utf-8");
          }
        }
      }
      return { users };
    } catch {
      return { users: [] };
    }
  },
});
