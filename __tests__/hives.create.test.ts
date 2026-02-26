// __tests__/hives.create.test.ts

import { POST } from "@/app/api/hives/route";
import { prisma } from "@/app/lib/prisma";
import { getAuthUserFromRequest } from "@/app/lib/auth";

// Mock auth
jest.mock("@/app/lib/auth", () => ({
  getAuthUserFromRequest: jest.fn(),
}));

// Mock prisma
jest.mock("@/app/lib/prisma", () => ({
  prisma: {
    hive: {
      create: jest.fn(),
    },
  },
}));

describe("POST /api/hives", () => {
  it("creates a hive for authenticated beekeeper and returns 201", async () => {
    // 1) auth mock (ulogovan BEEKEEPER)
    (getAuthUserFromRequest as jest.Mock).mockReturnValue({
      userId: 7,
      role: "BEEKEEPER",
    });

    // 2) prisma mock (šta “baza” vraća)
    (prisma.hive.create as jest.Mock).mockResolvedValue({
      id: 123,
      name: "K2",
      location: "Novi Sad",
      status: "ACTIVE",
      strength: 6,
      ownerId: 7,
      owner: { id: 7, fullName: "Pčelar Demo", email: "beekeeper@demo.com" },
    });

    // 3) request body kao u tvojoj ruti
    const req = new Request("http://localhost/api/hives", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        name: "  K2  ",
        location: "Novi Sad",
        status: "ACTIVE",
        strength: 6,
      }),
    });

    // 4) poziv rute
    const res = await POST(req);
    const data = await res.json();

    // 5) očekivanja (tvoja ruta vraća 201)
    expect(res.status).toBe(201);
    expect(data).toHaveProperty("hive");
    expect(data.hive.name).toBe("K2"); // trim radi

    // 6) proveri da je prisma pozvana sa pravilnim data + include
    expect(prisma.hive.create).toHaveBeenCalledTimes(1);
    expect(prisma.hive.create).toHaveBeenCalledWith({
      data: {
        name: "K2",
        location: "Novi Sad",
        status: "ACTIVE",
        strength: 6,
        ownerId: 7,
      },
      include: { owner: { select: { id: true, fullName: true, email: true } } },
    });
  });
});
