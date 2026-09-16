import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadThreads, newId, upsertThread } from "@/lib/chat-threads";
import { notifyThreadsChanged } from "@/hooks/use-threads";

export const Route = createFileRoute("/chat/")({
  component: ChatIndex,
});

function ChatIndex() {
  const navigate = useNavigate();

  useEffect(() => {
    const existing = loadThreads();
    const target = existing[0]?.id ?? newId();
    if (!existing[0]) {
      upsertThread({
        id: target,
        title: "New chat",
        updatedAt: Date.now(),
        tier: "prime-1.0",
        messages: [],
      });
      notifyThreadsChanged();
    }
    void navigate({ to: "/chat/$threadId", params: { threadId: target }, replace: true });
  }, [navigate]);

  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Opening Karudi…
    </div>
  );
}
