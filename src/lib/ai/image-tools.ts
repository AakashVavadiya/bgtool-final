import { spawn } from "child_process";
import path from "path";

function getPythonCommand(): string {
  return process.env["PYTHON_PATH"] || "python";
}

export interface ImageOperationResult {
  success: boolean;
  tool: string;
  action: string;
  resultImageSrc?: string;
  width?: number;
  height?: number;
  originalWidth?: number;
  originalHeight?: number;
  bytes?: number;
  compressedSize?: number;
  format?: string;
  rotationDegrees?: number;
  dimensions?: string;
  aspectRatio?: string;
  palette?: string[];
  totalBytes?: number;
  totalBits?: number;
  filename?: string;
  message?: string;
  error?: string;
}

export async function runImageTool(
  operation: string,
  params: Record<string, any>
): Promise<ImageOperationResult> {
  return new Promise((resolve) => {
    try {
      const pyCmd = getPythonCommand();
      const scriptPath = path.resolve(process.cwd(), "scripts", "image_tools.py");

      const child = spawn(pyCmd, [scriptPath], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("close", (code) => {
        if (code !== 0 && !stdout.trim()) {
          resolve({
            success: false,
            tool: operation,
            action: operation,
            error: `Image operation failed (${code}): ${stderr.slice(0, 200) || "Unknown error"}`,
          });
          return;
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed);
        } catch {
          resolve({
            success: false,
            tool: operation,
            action: operation,
            error: `Failed to parse image tool response: ${stdout.slice(0, 200)}`,
          });
        }
      });

      child.on("error", (err) => {
        resolve({
          success: false,
          tool: operation,
          action: operation,
          error: `Could not launch image tool process: ${err.message}`,
        });
      });

      // Write JSON payload to stdin
      const payload = JSON.stringify({ operation, params });
      child.stdin.write(payload);
      child.stdin.end();
    } catch (err: any) {
      resolve({
        success: false,
        tool: operation,
        action: operation,
        error: err?.message || "Execution exception in image tool",
      });
    }
  });
}
