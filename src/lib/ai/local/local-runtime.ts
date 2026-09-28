import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import { getLocalModelConfig, type KarudiLocalModelConfig } from "./local-config";

class LocalModelRuntimeManager {
  private static instance: LocalModelRuntimeManager;
  private process: ChildProcess | null = null;
  private isStarting = false;
  private isReady = false;
  private startPromise: Promise<boolean> | null = null;
  private config: KarudiLocalModelConfig;

  private constructor() {
    this.config = getLocalModelConfig();
  }

  public static getInstance(): LocalModelRuntimeManager {
    if (!LocalModelRuntimeManager.instance) {
      LocalModelRuntimeManager.instance = new LocalModelRuntimeManager();
    }
    return LocalModelRuntimeManager.instance;
  }

  public getBaseUrl(): string {
    return `http://${this.config.host}:${this.config.port}/v1`;
  }

  public isAvailable(): boolean {
    return this.isReady || (fs.existsSync(this.config.serverBinPath) && fs.existsSync(this.config.modelPath));
  }

  public async ensureRunning(): Promise<boolean> {
    if (this.isReady) return true;
    if (this.startPromise) return this.startPromise;

    this.startPromise = this.startInternal();
    const result = await this.startPromise;
    this.startPromise = null;
    return result;
  }

  private async startInternal(): Promise<boolean> {
    this.config = getLocalModelConfig();

    if (!fs.existsSync(this.config.serverBinPath)) {
      console.warn(`[LocalRuntime] Server binary missing at ${this.config.serverBinPath}`);
      return false;
    }
    if (!fs.existsSync(this.config.modelPath)) {
      console.warn(`[LocalRuntime] Model weights missing at ${this.config.modelPath}`);
      return false;
    }

    // Check if port is already active (e.g. from previous run)
    try {
      const probe = await fetch(`http://${this.config.host}:${this.config.port}/health`, {
        signal: AbortSignal.timeout(2000),
      });
      if (probe.ok) {
        this.isReady = true;
        console.log(`[LocalRuntime] Connected to active local llama-server on port ${this.config.port}`);
        return true;
      }
    } catch {
      // not yet running
    }

    console.log(`[LocalRuntime] Spawning local model: ${this.config.modelPath}`);

    const args = [
      "-m", this.config.modelPath,
      "--host", this.config.host,
      "--port", this.config.port.toString(),
      "-c", this.config.contextSize.toString(),
      "-t", "4", // 4 CPU threads for i7
      "-b", "512",
      "--temp", this.config.temperature.toString(),
    ];

    try {
      this.process = spawn(this.config.serverBinPath, args, {
        stdio: ["ignore", "pipe", "pipe"],
        detached: false,
      });

      this.process.stdout?.on("data", (data) => {
        const text = data.toString();
        if (text.includes("HTTP server listening") || text.includes("listening on")) {
          this.isReady = true;
        }
      });

      this.process.stderr?.on("data", (data) => {
        const text = data.toString();
        if (text.includes("HTTP server listening") || text.includes("listening on") || text.includes("all slots are idle")) {
          this.isReady = true;
        }
      });

      this.process.on("exit", (code) => {
        console.log(`[LocalRuntime] llama-server process exited with code ${code}`);
        this.isReady = false;
        this.process = null;
      });

      // Poll until server is ready or timeout (30 seconds)
      const start = Date.now();
      while (Date.now() - start < 30000) {
        if (this.isReady) return true;
        try {
          const res = await fetch(`http://${this.config.host}:${this.config.port}/health`, {
            signal: AbortSignal.timeout(1000),
          });
          if (res.ok) {
            this.isReady = true;
            console.log(`[LocalRuntime] Local Karudi Model Server is READY on port ${this.config.port}`);
            return true;
          }
        } catch {
          // keep waiting
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      console.warn("[LocalRuntime] Timed out waiting for local llama-server.");
      return false;
    } catch (e) {
      console.error("[LocalRuntime] Failed to start local model runtime:", e);
      return false;
    }
  }

  public stop(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
      this.isReady = false;
    }
  }
}

export const localModelRuntime = LocalModelRuntimeManager.getInstance();
