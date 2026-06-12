import crypto from "node:crypto";
import process from "node:process";

const SECRET =
  process.env.JWT_SECRET ||
  "default-jwt-secret-please-configure-in-env-file-at-least-32-chars-long";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const check = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === check;
}

export function signSession(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifySession(token: string): any | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, data, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${data}`)
    .digest("base64url");
  if (signature !== expectedSignature) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
