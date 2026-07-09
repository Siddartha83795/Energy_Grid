import crypto from "node:crypto";
import process from "node:process";

const SECRET =
  process.env.JWT_SECRET ||
  "default-jwt-secret-please-configure-in-env-file-at-least-32-chars-long";

export function hashPassword(password: string): string {
  const iterations = 600000;
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return `${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  if (parts.length === 2) {
    // Legacy support: salt:hash (1000 iterations)
    const [salt, hash] = parts;
    const check = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const checkBuf = Buffer.from(check, "hex");
    if (hashBuf.length !== checkBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, checkBuf);
  } else if (parts.length === 3) {
    // Hardened support: iterations:salt:hash (e.g. 600000:salt:hash)
    const [iterationsStr, salt, hash] = parts;
    const iterations = parseInt(iterationsStr, 10) || 600000;
    const check = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
    const hashBuf = Buffer.from(hash, "hex");
    const checkBuf = Buffer.from(check, "hex");
    if (hashBuf.length !== checkBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, checkBuf);
  }
  return false;
}

export function signSession(payload: any): string {
  const now = Date.now();
  const duration = 30 * 24 * 60 * 60 * 1000; // 30 days
  const fullPayload = {
    ...payload,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + duration) / 1000),
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
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

  // Timing-safe comparison of the HMAC signature
  const sigBuf = Buffer.from(signature, "utf8");
  const expSigBuf = Buffer.from(expectedSignature, "utf8");
  if (sigBuf.length !== expSigBuf.length || !crypto.timingSafeEqual(sigBuf, expSigBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    // Validate JWT expiration claim (payload.exp is in UNIX seconds)
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
