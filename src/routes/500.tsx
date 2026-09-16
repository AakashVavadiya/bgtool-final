import { createFileRoute } from "@tanstack/react-router";
import { ErrorPage } from "@/components/ErrorPage";

export const Route = createFileRoute("/500")({
  head: () => ({
    meta: [
      { title: "500 - Server & Processing Error | bg" },
      { name: "description", content: "Something went wrong processing this image request." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <ErrorPage error={new Error("Manual 500 test error simulation")} />,
});
