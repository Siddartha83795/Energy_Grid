import { createServerFn } from "@tanstack/react-start";

export function validatePasswordStrength(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one number" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: "Password must contain at least one special character" };
  }
  return { isValid: true };
}

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { email?: string; password?: string; fullName?: string };
    if (!o.email || !o.password || !o.fullName) {
      throw new Error("Missing required fields");
    }
    const email = o.email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address format");
    }
    const strength = validatePasswordStrength(o.password);
    if (!strength.isValid) {
      throw new Error(strength.message);
    }
    return {
      email,
      password: o.password,
      fullName: o.fullName.trim(),
    };
  })
  .handler(async ({ data }) => {
    const { getDb } = await import("./mongodb.server");
    const { hashPassword, signSession } = await import("./auth-session.server");
    const { setSessionCookie } = await import("./auth-cookie.server");
    const { getRequestHeaders } = await import("@tanstack/react-start/server");

    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: data.email });
    if (existing) {
      // Use generic error message to prevent account enumeration
      throw new Error("Invalid email or password");
    }

    const count = await db.collection("users").countDocuments();
    const role = count === 0 ? "admin" : "staff";

    const passwordHash = hashPassword(data.password);
    const userDoc = {
      email: data.email,
      password_hash: passwordHash,
      full_name: data.fullName,
      company: "",
      role: role,
      theme: "system",
      currency: "INR",
      tariff_per_kwh: 8.0,
      notifications_enabled: true,
      session_version: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const res = await db.collection("users").insertOne(userDoc);
    const userId = res.insertedId.toString();

    // Create session token with initial sessionVersion = 1
    const token = signSession({ userId, role, sessionVersion: 1 });

    // Set HTTP-only cookie
    await setSessionCookie(token);

    // Resolve client IP
    const rawIp = getRequestHeaders().get("x-forwarded-for") || "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    // Write audit log
    await db.collection("security_events").insertOne({
      event: "account_created",
      email: data.email,
      userId,
      ip,
      created_at: new Date(),
    });

    return {
      user: {
        id: userId,
        email: data.email,
        fullName: data.fullName,
        role: role,
      },
    };
  });

export const signIn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { email?: string; password?: string };
    if (!o.email || !o.password) {
      throw new Error("Missing required fields");
    }
    return { email: o.email.toLowerCase().trim(), password: o.password };
  })
  .handler(async ({ data }) => {
    const { getDb } = await import("./mongodb.server");
    const { verifyPassword, signSession, hashPassword } = await import("./auth-session.server");
    const { setSessionCookie } = await import("./auth-cookie.server");
    const { getRequestHeaders } = await import("@tanstack/react-start/server");

    // 1. Resolve client IP
    const rawIp = getRequestHeaders().get("x-forwarded-for") || "127.0.0.1";
    const ip = rawIp.split(",")[0].trim();

    const db = await getDb();

    // 2. Rate limiting & Lockout check scoped to IP + email
    const attemptsDoc = await db.collection("login_attempts").findOne({ ip, email: data.email });
    const now = new Date();

    if (attemptsDoc) {
      // Check lockout expiration
      if (attemptsDoc.locked_until && new Date(attemptsDoc.locked_until) > now) {
        throw new Error("Too many attempts. Try again later.");
      }

      // Check exponential backoff delays
      const attempts = attemptsDoc.attempts || 0;
      let requiredDelay = 0;
      if (attempts === 2)
        requiredDelay = 2000; // 2s delay
      else if (attempts === 3)
        requiredDelay = 5000; // 5s delay
      else if (attempts === 4) requiredDelay = 15000; // 15s delay

      if (requiredDelay > 0 && attemptsDoc.last_attempt_at) {
        const elapsed = now.getTime() - new Date(attemptsDoc.last_attempt_at).getTime();
        if (elapsed < requiredDelay) {
          throw new Error("Too many attempts. Try again later.");
        }
      }
    }

    // 3. Find user
    const user = await db.collection("users").findOne({ email: data.email });

    if (!user) {
      // Timing attack mitigation: verify a dummy hash so response time matches real users
      verifyPassword(
        data.password,
        "600000:dummy_salt:79a5bebe8c21345f1b1b017b2b0ff877b0d71a81bc7d9c670a3db571d4734896",
      );

      // Record failed attempt
      const newAttempts = (attemptsDoc?.attempts || 0) + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await db.collection("login_attempts").updateOne(
        { ip, email: data.email },
        {
          $set: {
            attempts: newAttempts,
            last_attempt_at: now,
            locked_until: lockedUntil,
          },
        },
        { upsert: true },
      );

      // Audit log failed login
      await db.collection("security_events").insertOne({
        event: lockedUntil ? "account_lockout" : "failed_login",
        email: data.email,
        ip,
        created_at: now,
      });

      throw new Error("Invalid email or password");
    }

    // 4. Verify password
    const valid = verifyPassword(data.password, user.password_hash);

    if (!valid) {
      // Record failed attempt
      const newAttempts = (attemptsDoc?.attempts || 0) + 1;
      const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await db.collection("login_attempts").updateOne(
        { ip, email: data.email },
        {
          $set: {
            attempts: newAttempts,
            last_attempt_at: now,
            locked_until: lockedUntil,
          },
        },
        { upsert: true },
      );

      // Audit log failed login
      await db.collection("security_events").insertOne({
        event: lockedUntil ? "account_lockout" : "failed_login",
        email: data.email,
        ip,
        created_at: now,
      });

      if (newAttempts >= 5) {
        throw new Error("Too many attempts. Try again later.");
      } else {
        throw new Error("Invalid email or password");
      }
    }

    // 5. Successful login
    // Clear login attempts
    await db.collection("login_attempts").deleteOne({ ip, email: data.email });

    // Initialize/read session version (Option A - multi-session)
    let sessionVersion = user.session_version ?? 1;

    // Check password format upgrade (legacy format: salt:hash)
    const passwordParts = user.password_hash.split(":");
    const isLegacyHash = passwordParts.length === 2;
    const updateFields: any = {
      last_login_at: now,
    };

    if (isLegacyHash) {
      // Auto-upgrade to PBKDF2 600k iterations
      updateFields.password_hash = hashPassword(data.password);
      // Bump session version on password upgrade for safety
      sessionVersion = sessionVersion + 1;
      updateFields.session_version = sessionVersion;

      await db.collection("security_events").insertOne({
        event: "password_hash_upgrade",
        email: user.email,
        userId: user._id.toString(),
        ip,
        created_at: now,
      });
    } else if (user.session_version === undefined) {
      updateFields.session_version = sessionVersion;
    }

    if (Object.keys(updateFields).length > 1 || updateFields.session_version !== undefined) {
      await db.collection("users").updateOne({ _id: user._id }, { $set: updateFields });
    }

    // Prevent Session Fixation by generating a completely fresh token with rotated payload
    const userId = user._id.toString();
    const token = signSession({ userId, role: user.role, sessionVersion });

    await setSessionCookie(token);

    // Audit log successful login
    await db.collection("security_events").insertOne({
      event: "successful_login",
      email: user.email,
      userId,
      ip,
      created_at: now,
    });

    return {
      user: {
        id: userId,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteSessionCookie } = await import("./auth-cookie.server");
  await deleteSessionCookie();
  return { success: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionCookie } = await import("./auth-cookie.server");
  const { verifySession } = await import("./auth-session.server");
  const { getDb } = await import("./mongodb.server");
  const { ObjectId } = await import("mongodb");

  const token = await getSessionCookie();
  if (!token) return null;

  const session = verifySession(token);
  if (!session || !session.userId || session.sessionVersion === undefined) return null;

  const db = await getDb();
  let objId;
  try {
    objId = new ObjectId(session.userId);
  } catch {
    return null;
  }

  const user = await db.collection("users").findOne({ _id: objId });
  if (!user) return null;

  // Compare session version to enforce revocation
  const dbVersion = user.session_version ?? 1;
  if (session.sessionVersion !== dbVersion) {
    const { deleteSessionCookie } = await import("./auth-cookie.server");
    await deleteSessionCookie();
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    fullName: user.full_name,
    company: user.company || "",
    role: user.role || "staff",
    theme: user.theme || "system",
    currency: user.currency || "INR",
    tariff_per_kwh: user.tariff_per_kwh ?? 8.0,
    notifications_enabled: user.notifications_enabled ?? true,
    grid_emission_factor: user.grid_emission_factor ?? 0.82,
  };
});

export const revokeAllUserSessions = createServerFn({ method: "POST" }).handler(async () => {
  const { getSessionCookie, deleteSessionCookie } = await import("./auth-cookie.server");
  const { verifySession } = await import("./auth-session.server");
  const { getDb } = await import("./mongodb.server");
  const { getRequestHeaders } = await import("@tanstack/react-start/server");
  const { ObjectId } = await import("mongodb");

  const token = await getSessionCookie();
  if (!token) throw new Error("Unauthorized");

  const session = verifySession(token);
  if (!session || !session.userId) throw new Error("Unauthorized");

  const db = await getDb();
  let objId;
  try {
    objId = new ObjectId(session.userId);
  } catch {
    throw new Error("Invalid user ID");
  }

  const user = await db.collection("users").findOne({ _id: objId });
  if (!user) throw new Error("User not found");

  // Bump the session version to invalidate all active session tokens
  const newVersion = (user.session_version || 1) + 1;
  await db
    .collection("users")
    .updateOne({ _id: objId }, { $set: { session_version: newVersion, updated_at: new Date() } });

  // Resolve client IP
  const rawIp = getRequestHeaders().get("x-forwarded-for") || "127.0.0.1";
  const ip = rawIp.split(",")[0].trim();

  // Audit log session revocation
  await db.collection("security_events").insertOne({
    event: "session_revocation",
    email: user.email,
    userId: session.userId,
    ip,
    created_at: new Date(),
  });

  // Delete session cookie
  await deleteSessionCookie();
  return { success: true };
});


