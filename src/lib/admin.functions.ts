import { createServerFn } from "@tanstack/react-start";
import { getSessionCookie } from "./auth-cookie.server";
import { getDb } from "./mongodb.server";
import { verifySession } from "./auth-session.server";
import { ObjectId } from "mongodb";

async function requireAdmin(): Promise<string> {
  const token = await getSessionCookie();
  if (!token) throw new Error("Unauthorized: No session token");
  const session = verifySession(token);
  if (!session || !session.userId) throw new Error("Unauthorized: Invalid session");
  
  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (user?.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return session.userId;
}

export const getAdminData = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();
    const db = await getDb();
    
    // Fetch all users
    const usersCursor = db.collection("users").find({});
    const users = await usersCursor.toArray();
    const staff = users.map((u) => ({
      id: u._id.toString(),
      email: u.email,
      full_name: u.full_name || "",
      company: u.company || "",
      role: u.role || "staff",
    }));
    
    // Fetch recent 200 energy entries
    const entriesCursor = db.collection("energy_entries")
      .find({})
      .sort({ created_at: -1 })
      .limit(200);
    const entriesRaw = await entriesCursor.toArray();
    const entries = entriesRaw.map((e) => ({
      id: e._id.toString(),
      user_id: e.user_id,
      kind: e.kind,
      source: e.source,
      machine_name: e.machine_name,
      total_kwh: e.total_kwh ?? null,
      idle_kwh: e.idle_kwh ?? null,
      kwh: e.kwh ?? null,
      recorded_at: e.recorded_at || null,
      entry_date: e.entry_date ?? null,
      status: e.status ?? null,
    }));
    
    return { staff, entries };
  });

export const toggleUserRole = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { userId: string; nextRole: string };
    if (!o.userId || !o.nextRole) throw new Error("Missing required fields");
    return { userId: o.userId, nextRole: o.nextRole };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    
    await db.collection("users").updateOne(
      { _id: new ObjectId(data.userId) },
      { $set: { role: data.nextRole, updated_at: new Date() } }
    );
    
    return { success: true };
  });

export const deleteUserProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { userId: string };
    return { userId: o.userId };
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    
    // Delete the user document
    await db.collection("users").deleteOne({ _id: new ObjectId(data.userId) });
    
    // Delete all energy entries for this user
    await db.collection("energy_entries").deleteMany({ user_id: data.userId });
    
    return { success: true };
  });

export const updateEnergyEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const o = input as { id: string; machine_name: string; total_kwh?: number | null; idle_kwh?: number | null; kwh?: number | null; status?: string | null };
    return o;
  })
  .handler(async ({ data }) => {
    await requireAdmin();
    const db = await getDb();
    
    const updateFields: any = {
      machine_name: data.machine_name,
      updated_at: new Date(),
    };
    
    if (data.total_kwh !== undefined) updateFields.total_kwh = data.total_kwh;
    if (data.idle_kwh !== undefined) updateFields.idle_kwh = data.idle_kwh;
    if (data.kwh !== undefined) updateFields.kwh = data.kwh;
    if (data.status !== undefined) updateFields.status = data.status;
    
    await db.collection("energy_entries").updateOne(
      { _id: new ObjectId(data.id) },
      { $set: updateFields }
    );
    
    return { success: true };
  });
