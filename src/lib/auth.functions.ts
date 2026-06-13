import { createServerFn } from "@tanstack/react-start";

export const signUp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { email?: string; password?: string; fullName?: string };
    if (!o.email || !o.password || !o.fullName) {
      throw new Error("Missing required fields");
    }
    return {
      email: o.email.toLowerCase().trim(),
      password: o.password,
      fullName: o.fullName.trim(),
    };
  })
  .handler(async ({ data }) => {
    const { getDb } = await import("./mongodb.server");
    const { hashPassword, signSession } = await import("./auth-session.server");
    const { setSessionCookie } = await import("./auth-cookie.server");

    const db = await getDb();
    const existing = await db.collection("users").findOne({ email: data.email });
    if (existing) {
      throw new Error("Email already registered");
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
      created_at: new Date(),
      updated_at: new Date(),
    };

    const res = await db.collection("users").insertOne(userDoc);
    const userId = res.insertedId.toString();

    // Create session token
    const token = signSession({ userId, role });

    // Set HTTP-only cookie
    await setSessionCookie(token);

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
    const { verifyPassword, signSession } = await import("./auth-session.server");
    const { setSessionCookie } = await import("./auth-cookie.server");

    const db = await getDb();
    const user = await db.collection("users").findOne({ email: data.email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const valid = verifyPassword(data.password, user.password_hash);
    if (!valid) {
      throw new Error("Invalid email or password");
    }

    const userId = user._id.toString();
    const token = signSession({ userId, role: user.role });

    await setSessionCookie(token);

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
  if (!session || !session.userId) return null;

  const db = await getDb();
  let objId;
  try {
    objId = new ObjectId(session.userId);
  } catch {
    return null;
  }

  const user = await db.collection("users").findOne({ _id: objId });
  if (!user) return null;

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
  };
});
