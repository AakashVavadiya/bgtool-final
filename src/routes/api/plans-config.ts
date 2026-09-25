import { createFileRoute } from "@tanstack/react-router";
import fs from "fs";
import path from "path";

function getDataFilePath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "plans-config.json");
}

export const Route = createFileRoute("/api/plans-config")({
  loader: async () => {
    try {
      const filePath = getDataFilePath();
      if (!fs.existsSync(filePath)) {
        return { plans: [] };
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      return { plans: JSON.parse(raw) };
    } catch {
      return { plans: [] };
    }
  },
});
