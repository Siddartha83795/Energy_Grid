import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @tanstack/react-start before importing functions
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

import { getActionQueue, updateActionStatus } from "../src/lib/new-features.functions";

// Mock the dependencies
const mockCollection = {
  find: vi.fn(),
  findOne: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
  toArray: vi.fn(),
};

const mockDb = {
  collection: vi.fn(() => mockCollection),
};

vi.mock("../src/lib/mongodb.server", () => ({
  getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

vi.mock("../src/lib/auth-cookie.server", () => ({
  getSessionCookie: vi.fn(() => Promise.resolve("mock-token")),
}));

vi.mock("../src/lib/auth-session.server", () => ({
  verifySession: vi.fn(() => ({ userId: "test-user-id" })),
}));

describe("Approval Queue (Agentic Action Layer) Guardrails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY = "mock-groq-key";
  });

  it("1. Should auto-execute a low-impact action (< ₹500 weekly savings) upon creation", async () => {
    // Mock database checks
    // First call to find action_queue returns empty array to trigger creation logic
    mockCollection.find.mockReturnValue({
      toArray: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          _id: "507f1f77bcf86cd799439011",
          machine_id: "CNC-01",
          issue: "Excessive standby draw",
          action: "Send automatic low-power standby command",
          estimated_weekly_savings_inr: 100, // < 500
          root_cause: "Operator left CNC-01 standby",
          risk_level: "Low",
          status: "Executed",
          timestamp: new Date(),
        }
      ])
    });

    // Mock runs table lookup for offenders
    mockCollection.findOne.mockResolvedValueOnce({
      run_id: "run-123",
      machines: [
        {
          machine_name: "CNC-01",
          idle_kwh: 60,
          utilization_pct: 50,
          idle_cost_inr: 400, // savings = 400. weekly savings = savings / 4 = 100 (< 500)
        }
      ]
    });

    const queue = await getActionQueue();

    // Verify insertion occurred
    expect(mockCollection.insertOne).toHaveBeenCalled();
    const insertedDoc = mockCollection.insertOne.mock.calls[0][0];
    expect(insertedDoc.risk_level).toBe("Low");
    expect(insertedDoc.status).toBe("Executed");

    // Verify final returned structure
    expect(queue).toHaveLength(1);
    expect(queue[0].status).toBe("Executed");
    expect(queue[0].risk_level).toBe("Low");
  });

  it("2. Should queue a high-impact action (>= ₹500 weekly savings) as Pending", async () => {
    mockCollection.find.mockReturnValue({
      toArray: vi.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          _id: "507f1f77bcf86cd799439012",
          machine_id: "CNC-02",
          issue: "Excessive standby draw",
          action: "Power down main breaker switch",
          estimated_weekly_savings_inr: 600, // >= 500
          root_cause: "Operator left CNC-02 standby",
          risk_level: "High",
          status: "Pending",
          timestamp: new Date(),
        }
      ])
    });

    // Mock runs lookup
    mockCollection.findOne.mockResolvedValueOnce({
      run_id: "run-123",
      machines: [
        {
          machine_name: "CNC-02",
          idle_kwh: 300,
          utilization_pct: 40,
          idle_cost_inr: 2400, // weekly savings = 2400 / 4 = 600 (>= 500)
        }
      ]
    });

    const queue = await getActionQueue();

    expect(mockCollection.insertOne).toHaveBeenCalled();
    const insertedDoc = mockCollection.insertOne.mock.calls[0][0];
    expect(insertedDoc.risk_level).toBe("High");
    expect(insertedDoc.status).toBe("Pending");

    expect(queue).toHaveLength(1);
    expect(queue[0].status).toBe("Pending");
    expect(queue[0].risk_level).toBe("High");
  });

  it("3. Should prevent updating a High-risk action to Executed directly", async () => {
    // Find action mock returns a High risk action
    mockCollection.findOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439013",
      risk_level: "High",
      status: "Pending"
    });

    // Call updateActionStatus with status "Executed"
    const badCall = () => updateActionStatus({
      data: {
        actionId: "507f1f77bcf86cd799439013",
        status: "Executed" as any // force invalid transition
      }
    });

    await expect(badCall).rejects.toThrow();
    expect(mockCollection.updateOne).not.toHaveBeenCalled();
  });

  it("4. Should reject invalid statuses and only accept Approved and Rejected for High-risk actions", async () => {
    // Approved casing
    mockCollection.findOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439014",
      risk_level: "High",
      status: "Pending"
    });
    const goodCall = await updateActionStatus({
      data: {
        actionId: "507f1f77bcf86cd799439014",
        status: "Approved"
      }
    });
    expect(goodCall.success).toBe(true);
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      expect.any(Object),
      { $set: { status: "Approved", updated_at: expect.any(Date) } }
    );

    // Rejected casing
    mockCollection.findOne.mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439015",
      risk_level: "High",
      status: "Pending"
    });
    const goodCall2 = await updateActionStatus({
      data: {
        actionId: "507f1f77bcf86cd799439015",
        status: "Rejected"
      }
    });
    expect(goodCall2.success).toBe(true);

    // Invalid casing / status throws error
    const badCall = () => updateActionStatus({
      data: {
        actionId: "507f1f77bcf86cd799439016",
        status: "invalid-status" as any
      }
    });
    await expect(badCall).rejects.toThrow();
  });
});
