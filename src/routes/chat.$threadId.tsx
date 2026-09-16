import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { loadThreads, type ChatThread } from "@/lib/chat-threads";

export const Route = createFileRoute("/chat/$threadId")({
  component: ChatThreadPage,
});

function ChatThreadPage() {
  const { threadId } = Route.useParams();
  const [thread, setThread] = useState<ChatThread | null>(null);

  useEffect(() => {
    const found = loadThreads().find((t) => t.id === threadId);
    setThread(
      found ?? {
        id: threadId,
        title: "New chat",
        updatedAt: Date.now(),
        tier: "prime-1.0",
        messages: [],
      },
    );
  }, [threadId]);

  if (!thread) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Loading conversation…
      </div>
    );
  }

  return <ChatWindow key={thread.id} thread={thread} />;
}
