import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import process from "node:process";

export async function getSessionCookie(): Promise<string | undefined> {
  return getCookie("session_token");
}

export async function setSessionCookie(token: string) {
  setCookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

export async function deleteSessionCookie() {
  deleteCookie("session_token", { path: "/" });
  setCookie("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  });
}

export async function getOAuthStateCookie(): Promise<string | undefined> {
  return getCookie("oauth_state");
}

export async function setOAuthStateCookie(state: string) {
  setCookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60, // 10 minutes short-lived
    path: "/",
  });
}

export async function deleteOAuthStateCookie() {
  deleteCookie("oauth_state", { path: "/" });
}
