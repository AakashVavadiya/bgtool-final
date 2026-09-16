import { useCallback, useEffect, useState } from "react";
import { loadThreads, type ChatThread } from "@/lib/chat-threads";

const EVENT = "bg-threads-changed";

export const notifyThreadsChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
};

export function useThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);

  const refresh = useCallback(() => setThreads(loadThreads()), []);

  useEffect(() => {
    refresh();
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  return { threads, refresh };
}
