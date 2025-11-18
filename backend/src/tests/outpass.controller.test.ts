import type { AuthRequest } from "../../middleware/auth";
import { applyOutpass } from "../../controllers/outpass.controller";

const saveMock = jest.fn();

jest.mock("../../models", () => ({
  OutpassModel: {
    create: jest.fn().mockResolvedValue({
      _id: "OPS-1",
      id: "OPS-1",
      save: saveMock,
      status: "pending"
    })
  },
  OutpassLogModel: {},
  SecurityLogModel: {}
}));

jest.mock("../../services/qr.service", () => ({
  buildQr: jest.fn().mockResolvedValue({
    dataUrl: "qr-string",
    payload: { outpassId: "OPS-1", token: "OPS-1", studentId: "user-1", issuedAt: Date.now(), signature: "sig" }
  })
}));

jest.mock("../../sockets", () => ({
  io: { emit: jest.fn() }
}));

describe("Outpass controller", () => {
  it("applies outpass and responds with 201", async () => {
    const req = {
      authUser: { id: "user-1", role: "student", collegeId: "COL-1" },
      body: {
        reason: "Family visit",
        type: "day",
        fromDate: new Date(),
        toDate: new Date()
      }
    } as unknown as AuthRequest;
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as unknown as Parameters<typeof applyOutpass>[1];
    await applyOutpass(req, res, jest.fn());
    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 201
      })
    );
  });
});

