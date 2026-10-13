import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/google/login")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const { setOAuthStateCookie } = await import("../lib/auth-cookie.server");
        const { generateOAuthState } = await import("../lib/auth-oauth.server");

        const state = generateOAuthState();
        await setOAuthStateCookie(state);

        const clientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
        const url = new URL(request.url);
        const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
        const host =
          request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
        const origin = `${proto}://${host}`;

        let redirectUri = (process.env.GOOGLE_REDIRECT_URI || "").trim();
        // Fallback to request origin if not configured or if running on deployed remote domain while configured as localhost
        if (!redirectUri || (!origin.includes("localhost") && redirectUri.includes("localhost"))) {
          redirectUri = `${origin}/api/auth/google/callback`;
        }

        if (!clientId) {
          return new Response(
            JSON.stringify({ error: "GOOGLE_CLIENT_ID environment variable is not configured." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "code",
          scope: "openid email profile",
          state: state,
          prompt: "select_account",
        });

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        const headers = new Headers();
        headers.set("Location", googleAuthUrl);
        headers.append(
          "Set-Cookie",
          `oauth_state=${encodeURIComponent(state)}; Path=/; Max-Age=900; HttpOnly; SameSite=Lax${origin.startsWith("https") ? "; Secure" : ""}`,
        );

        return new Response(null, {
          status: 302,
          headers,
        });
      },
    },
  },
});
