import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/Alexandria")({
  head: () => ({ meta: [{ name: "robots", content: "noindex, follow" }] }),
  component: AlexandriaPage,
});

function AlexandriaPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6">
      <h1 className="text-center text-4xl font-bold tracking-tight sm:text-6xl">
        Something is happening
      </h1>
    </main>
  );
}
