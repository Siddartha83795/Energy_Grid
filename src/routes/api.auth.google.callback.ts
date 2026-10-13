import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const error = url.searchParams.get("error");

        const { getOAuthStateCookie, deleteOAuthStateCookie, setSessionCookie } =
          await import("../lib/auth-cookie.server");
        const { verifyOAuthState, handleGoogleOAuthCallback } =
          await import("../lib/auth-oauth.server");
        const { signSession } = await import("../lib/auth-session.server");

        const storedState = await getOAuthStateCookie();
        await deleteOAuthStateCookie();

        // 1. Verify CSRF State token before token exchange!
        if (!verifyOAuthState(storedState, state || undefined)) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/auth?error=invalid_state" },
          });
        }

        if (error || !code) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/auth?error=oauth_failed" },
          });
        }

        const clientId = (process.env.GOOGLE_CLIENT_ID || "").trim();
        const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || "").trim();
        const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
        const host =
          request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
        const origin = `${proto}://${host}`;

        let redirectUri = (process.env.GOOGLE_REDIRECT_URI || "").trim();
        // Fallback to request origin if not configured or if running on deployed remote domain while configured as localhost
        if (!redirectUri || (!origin.includes("localhost") && redirectUri.includes("localhost"))) {
          redirectUri = `${origin}/api/auth/google/callback`;
        }

        // 2. Exchange authorization code for Google access token
        try {
          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: "authorization_code",
            }),
          });

          if (!tokenRes.ok) {
            console.error("Google token exchange error:", await tokenRes.text());
            return new Response(null, {
              status: 302,
              headers: { Location: "/auth?error=oauth_failed" },
            });
          }

          const tokens = (await tokenRes.json()) as { access_token?: string };
          if (!tokens.access_token) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/auth?error=oauth_failed" },
            });
          }

          // 3. Fetch Google User Profile
          const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!profileRes.ok) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/auth?error=oauth_failed" },
            });
          }

          const profile = (await profileRes.json()) as {
            email: string;
            verified_email?: boolean;
            email_verified?: boolean;
            id?: string;
            sub?: string;
            name?: string;
            picture?: string;
          };

          const sub = profile.sub || profile.id;
          const isVerified = profile.email_verified ?? profile.verified_email ?? true;

          if (!profile.email || !sub) {
            return new Response(null, {
              status: 302,
              headers: { Location: "/auth?error=oauth_failed" },
            });
          }

          // 4. Run user lookup / linking / creation logic
          const result = await handleGoogleOAuthCallback({
            email: profile.email,
            email_verified: isVerified,
            sub,
            name: profile.name,
            picture: profile.picture,
          });

          // 5. Issue JWT Session Cookie
          const token = signSession({
            userId: result.user.id,
            role: result.user.role,
            sessionVersion: 1,
          });
          await setSessionCookie(token);

          // 6. Redirect based on user role / authorization
          // Elevated roles (admin, staff) go to dashboard; new restricted roles (viewer) land on /pending-approval
          const destination =
            result.user.role === "admin" || result.user.role === "staff"
              ? "/dashboard"
              : "/pending-approval";

          const headers = new Headers();
          headers.set("Location", destination);
          headers.append(
            "Set-Cookie",
            `session_token=${encodeURIComponent(token)}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax${origin.startsWith("https") ? "; Secure" : ""}`,
          );
          headers.append("Set-Cookie", "oauth_state=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");

          return new Response(null, {
            status: 302,
            headers,
          });
        } catch (err: any) {
          console.error("Google OAuth callback exception:", err);
          const errCode = err?.message === "unverified_email" ? "unverified_email" : "oauth_failed";
          return new Response(null, {
            status: 302,
            headers: { Location: `/auth?error=${errCode}` },
          });
        }
      },
    },
  },
});
