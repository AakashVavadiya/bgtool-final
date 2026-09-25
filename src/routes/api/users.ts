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
      return { users: JSON.parse(raw) };
    } catch {
      return { users: [] };
    }
  },
});
