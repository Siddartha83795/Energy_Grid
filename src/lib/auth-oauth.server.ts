import crypto from "node:crypto";
import { getDb } from "./mongodb.server";

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function verifyOAuthState(cookieState?: string, queryState?: string): boolean {
  if (!cookieState || !queryState) return false;
  if (cookieState.length !== queryState.length) return false;
  try {
    const a = Buffer.from(cookieState, "utf8");
    const b = Buffer.from(queryState, "utf8");
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
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
