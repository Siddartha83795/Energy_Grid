import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import process from "node:process";

export async function getSessionCookie(): Promise<string | undefined> {
  return getCookie("session_token");
}

export async function setSessionCookie(token: string) {
  setCookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

export async function deleteSessionCookie() {
  deleteCookie("session_token", { path: "/" });
}

