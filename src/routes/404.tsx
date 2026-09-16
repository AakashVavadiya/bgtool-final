import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "404 - Page Not Found | bg" },
      { name: "description", content: "The page you are looking for does not exist." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NotFoundPage,
});
