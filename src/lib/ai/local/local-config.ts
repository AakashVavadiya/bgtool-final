import path from "path";
import fs from "fs";

export interface KarudiLocalModelConfig {
  modelPath: string;
  serverBinPath: string;
  contextSize: number;
  maxTokens: number;
  temperature: number;
  maxToolSteps: number;
  port: number;
  host: string;
}

export function getLocalModelConfig(): KarudiLocalModelConfig {
  const cwd = process.cwd();
  const defaultModelPath = path.resolve(cwd, "models/karudi/karudi-instruct-q4_k_m.gguf");
  const defaultServerBin = path.resolve(cwd, "bin/llama/llama-server.exe");

  return {
    modelPath: process.env["KARUDI_MODEL_PATH"] || defaultModelPath,
    serverBinPath: process.env["KARUDI_SERVER_BIN_PATH"] || defaultServerBin,
    contextSize: parseInt(process.env["KARUDI_MODEL_CONTEXT"] || "4096", 10),
    maxTokens: parseInt(process.env["KARUDI_MAX_TOKENS"] || "512", 10),
    temperature: parseFloat(process.env["KARUDI_TEMPERATURE"] || "0.2"),
    maxToolSteps: parseInt(process.env["KARUDI_MAX_TOOL_STEPS"] || "8", 10),
    port: parseInt(process.env["KARUDI_LOCAL_PORT"] || "11435", 10),
    host: process.env["KARUDI_LOCAL_HOST"] || "127.0.0.1",
  };
}
