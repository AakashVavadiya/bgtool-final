import { createFileRoute, Link, Outlet, useNavigate, useParams } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { KrishnaAvatar } from "@/components/KrishnaAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useThreads, notifyThreadsChanged } from "@/hooks/use-threads";
import { deleteThread, newId, upsertThread } from "@/lib/chat-threads";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Karudi Smart Assistant — Ask, Upload & Analyse Files | bg" },
      {
        name: "description",
        content:
          "Karudi Smart Assistant by bg. Upload PDFs, images, Excel, Word, PowerPoint or text and get answers in seconds with Karudi 1.0 Prime.",
      },
      { property: "og:title", content: "Karudi Smart Assistant — bg" },
      {
        property: "og:description",
        content: "An animated AI chat with file uploads: PDF, image, Excel, Word, PowerPoint, text powered by Karudi 1.0 Prime.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatLayout,
});

export function ChatLayout() {
  const { threads } = useThreads();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { threadId?: string };

  const createThread = () => {
    const id = newId();
    upsertThread({ id, title: "New conversation", updatedAt: Date.now(), tier: "prime-1.0", messages: [] });
    notifyThreadsChanged();
    void navigate({ to: "/chat/$threadId", params: { threadId: id } });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Main Header Bar */}
      <header className="flex items-center justify-between border-b-2 border-border px-6 py-4 bg-card/60">
        <Link to="/" className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
          bg<span className="text-accent">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <KrishnaAvatar size="md" />
          <div>
            <span className="font-display text-lg md:text-xl font-bold tracking-tight block">
              Karudi Smart Assistant
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Ask questions, analyze documents & edit images with AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            to="/auth"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-bold transition-all hover:bg-foreground hover:text-background"
          >
            Log in / Register
          </Link>
          <Link to="/" className="text-sm font-bold text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left Sidebar */}
        <aside className="hidden w-72 sm:w-80 shrink-0 flex-col border-r-2 border-border bg-card/30 md:flex">
          <div className="p-4">
            <button
              type="button"
              onClick={createThread}
              className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-foreground px-6 py-4 text-base font-bold text-background shadow-lg transition-all hover:scale-[1.02]"
            >
              <Plus className="h-5 w-5" /> New chat
            </button>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recent Chats
            </p>
            {threads.length === 0 ? (
              <p className="px-3 py-4 text-sm font-medium text-muted-foreground">No conversations yet.</p>
            ) : null}
            {threads.map((t) => (
              <div
                key={t.id}
                className={`group mb-1.5 flex items-center gap-1.5 rounded-xl pr-2 transition-all ${
                  params.threadId === t.id
                    ? "bg-foreground text-background shadow-md font-bold"
                    : "hover:bg-secondary text-foreground font-semibold"
                }`}
              >
                <Link
                  to="/chat/$threadId"
                  params={{ threadId: t.id }}
                  className="min-w-0 flex-1 truncate px-4 py-3.5 text-left text-sm md:text-base"
                >
                  {t.title}
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${t.title}`}
                  onClick={() => {
                    const rest = deleteThread(t.id);
                    notifyThreadsChanged();
                    if (params.threadId === t.id) {
                      if (rest[0])
                        void navigate({
                          to: "/chat/$threadId",
                          params: { threadId: rest[0].id },
                        });
                      else void navigate({ to: "/chat" });
                    }
                  }}
                  className={`rounded-lg p-2 transition-opacity ${
                    params.threadId === t.id
                      ? "text-background/80 hover:text-background"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </nav>
        </aside>

        <main className="min-h-0 min-w-0 flex-1 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
