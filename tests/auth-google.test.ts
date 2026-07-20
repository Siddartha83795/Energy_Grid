import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @tanstack/react-start before imports
vi.mock("@tanstack/react-start", () => {
  return {
    createServerFn: vi.fn(() => {
      const builder = {
        inputValidator: vi.fn(() => builder),
        handler: vi.fn((handlerFn) => {
          const fn = async (args: any) => {
            return handlerFn({ data: args?.data !== undefined ? args.data : args });
          };
          return fn;
        }),
      };
      return builder;
    }),
  };
});

import {
  generateOAuthState,
  verifyOAuthState,
  handleGoogleOAuthCallback,
} from "../src/lib/auth.functions";

// Mock MongoDB
const mockCollection = {
  findOne: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
  countDocuments: vi.fn(),
};

const mockDb = {
  collection: vi.fn(() => mockCollection),
};

vi.mock("../src/lib/mongodb.server", () => ({
  getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

describe("Google OAuth Security & User Linking Guardrails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. Should generate a secure random hex state string", () => {
    const state = generateOAuthState();
    expect(state).toBeTypeOf("string");
    expect(state.length).toBe(64);
  });

  it("2. Should verify matching CSRF state tokens and reject mismatches", () => {
    const state = generateOAuthState();
    expect(verifyOAuthState(state, state)).toBe(true);
    expect(verifyOAuthState(state, "bad-state")).toBe(false);
    expect(verifyOAuthState(undefined, state)).toBe(false);
  });

  it("3. Should reject account linking if Google email is unverified (email_verified: false)", async () => {
    // Existing user found by email
    mockCollection.findOne.mockImplementation(({ google_sub, email }) => {
      if (google_sub) return Promise.resolve(null);
      if (email === "user@factory.com") {
        return Promise.resolve({
          _id: { toString: () => "existing-id" },
          email: "user@factory.com",
          role: "admin",
        });
      }
      return Promise.resolve(null);
    });

    await expect(
      handleGoogleOAuthCallback({
        email: "user@factory.com",
        email_verified: false,
        sub: "google-sub-123",
        name: "Test User",
      }),
    ).rejects.toThrow("unverified_email");

    expect(mockCollection.updateOne).not.toHaveBeenCalled();
  });

  it("4. Should link google_sub to existing account if email is verified (email_verified: true)", async () => {
    mockCollection.findOne.mockImplementation(({ google_sub, email }) => {
      if (google_sub) return Promise.resolve(null);
      if (email === "supervisor@factory.com") {
        return Promise.resolve({
          _id: { toString: () => "user-456" },
          email: "supervisor@factory.com",
          full_name: "Supervisor",
          role: "admin",
        });
      }
      return Promise.resolve(null);
    });

    const result = await handleGoogleOAuthCallback({
      email: "supervisor@factory.com",
      email_verified: true,
      sub: "google-sub-456",
      name: "Supervisor",
    });

    expect(result.accountLinked).toBe(true);
    expect(result.isNew).toBe(false);
    expect(result.user.id).toBe("user-456");
    expect(result.user.role).toBe("admin"); // Preserves existing elevated role!
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.anything() },
      { $set: expect.objectContaining({ google_sub: "google-sub-456" }) },
    );
  });

  it("5. Should create a new user with default viewer role if no existing account matches", async () => {
    mockCollection.findOne.mockResolvedValue(null);
    mockCollection.countDocuments.mockResolvedValue(2); // Non-first user
    mockCollection.insertOne.mockResolvedValue({ insertedId: { toString: () => "new-user-789" } });

    const result = await handleGoogleOAuthCallback({
      email: "newoperator@factory.com",
      email_verified: true,
      sub: "google-sub-789",
      name: "New Operator",
    });

    expect(result.isNew).toBe(true);
    expect(result.user.id).toBe("new-user-789");
    expect(result.user.role).toBe("viewer"); // Default restricted role for new signups!
    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "newoperator@factory.com",
        google_sub: "google-sub-789",
        auth_provider: "google",
        password_hash: null,
        role: "viewer",
      }),
    );
  });
});
