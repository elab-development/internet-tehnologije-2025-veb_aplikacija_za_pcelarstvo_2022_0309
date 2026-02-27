import jwt from "jsonwebtoken";
import { getAuthUserFromRequest } from "@/app/lib/auth";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("getAuthUserFromRequest", () => {
  const oldEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...oldEnv, JWT_SECRET: "test_secret" };
  });

  afterAll(() => {
    process.env = oldEnv;
  });

  test("returns null when Authorization header missing", () => {
    const req = new Request("http://localhost/api/hives");
    const user = getAuthUserFromRequest(req);
    expect(user).toBeNull();
  });

  test("returns null when token invalid (jwt.verify throws)", () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("bad token");
    });

    const req = new Request("http://localhost/api/hives", {
      headers: { Authorization: "Bearer bad.token" },
    });

    const user = getAuthUserFromRequest(req);
    expect(user).toBeNull();
  });

  test("returns parsed user when token valid", () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: 7, role: "ADMIN" });

    const req = new Request("http://localhost/api/hives", {
      headers: { Authorization: "Bearer good.token" },
    });

    const user = getAuthUserFromRequest(req);
    expect(user).toEqual({ userId: 7, role: "ADMIN" });
  });
});
