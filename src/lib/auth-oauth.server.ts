import crypto from "node:crypto";
import process from "node:process";
import { getDb } from "./mongodb.server";

const OAUTH_SECRET =
  process.env.JWT_SECRET || "oauth-csrf-state-secret-energy-grid-secure-production";

export function generateOAuthState(): string {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomBytes(16).toString("hex");
  const data = `${timestamp}.${nonce}`;
  const hmac = crypto.createHmac("sha256", OAUTH_SECRET).update(data).digest("hex");
  return `${data}.${hmac}`;
}

export function verifyOAuthState(cookieState?: string, queryState?: string): boolean {
  if (!queryState) return false;

  // 1. Direct match with stored cookie if available
  if (cookieState && cookieState === queryState) {
    return true;
  }

  // 2. Cryptographic signature and timestamp verification (resilient against cookie stripping on cross-site redirect)
  const parts = queryState.split(".");
  if (parts.length === 3) {
    const [timestampStr, nonce, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiration: valid for 15 minutes
    if (Date.now() - timestamp > 15 * 60 * 1000) return false;

    const data = `${timestampStr}.${nonce}`;
    const expectedHmac = crypto.createHmac("sha256", OAUTH_SECRET).update(data).digest("hex");

    if (hmac.length !== expectedHmac.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hmac, "hex"), Buffer.from(expectedHmac, "hex"));
  }

  return false;
}

export type GoogleProfileInput = {
  email: string;
  email_verified?: boolean;
  sub: string;
  name?: string;
  picture?: string;
};

export async function handleGoogleOAuthCallback(profile: GoogleProfileInput): Promise<{
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  isNew: boolean;
  accountLinked: boolean;
}> {
  const db = await getDb();

  const email = profile.email.toLowerCase().trim();
  const sub = profile.sub;

  // 1. Check by google_sub first
  let user = await db.collection("users").findOne({ google_sub: sub });
  if (user) {
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.full_name,
        role: user.role || "viewer",
      },
      isNew: false,
      accountLinked: false,
    };
  }

  // 2. Check by email for existing account linking
  user = await db.collection("users").findOne({ email });
  if (user) {
    // If email is not verified by Google, reject linking to prevent account takeover!
    if (profile.email_verified === false) {
      throw new Error("unverified_email");
    }

    // Link google_sub to existing row, preserve role and password_hash
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          google_sub: sub,
          updated_at: new Date(),
        },
      },
    );

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.full_name,
        role: user.role || "viewer",
      },
      isNew: false,
      accountLinked: true,
    };
  }

  // 3. New user registration via Google OAuth
  const count = await db.collection("users").countDocuments();
  // First user gets admin, subsequent Google sign-ups get "viewer" (lowest-privilege / restricted role)
  const role = count === 0 ? "admin" : "viewer";

  const newUserDoc = {
    email,
    google_sub: sub,
    auth_provider: "google",
    password_hash: null,
    full_name: profile.name || email.split("@")[0],
    picture: profile.picture || "",
    company: "",
    role,
    theme: "system",
    currency: "INR",
    tariff_per_kwh: 8.0,
    notifications_enabled: true,
    session_version: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const res = await db.collection("users").insertOne(newUserDoc);
  const userId = res.insertedId.toString();

  // Write security audit log
  await db.collection("security_events").insertOne({
    event: "google_signup",
    email,
    userId,
    created_at: new Date(),
  });

  return {
    user: {
      id: userId,
      email,
      fullName: newUserDoc.full_name,
      role,
    },
    isNew: true,
    accountLinked: false,
  };
}
