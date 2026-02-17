/* eslint-disable @typescript-eslint/no-explicit-any */

import jwt from "jsonwebtoken";

describe("JWT test", () => {
  test("sign + verify", () => {
    const token = jwt.sign(
      { userId: 1, role: "ADMIN" },
      "test_secret"
    );

    const decoded = jwt.verify(token, "test_secret") as any;

    expect(decoded.userId).toBe(1);
    expect(decoded.role).toBe("ADMIN");
  });
});
