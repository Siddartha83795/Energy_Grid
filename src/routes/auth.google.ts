import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/google")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(null, {
          status: 302,
          headers: { Location: "/api/auth/google/login" },
        });
      },
    },
  },
});
