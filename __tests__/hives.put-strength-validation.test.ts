import { PUT } from "@/app/api/hives/[id]/route";
import { getAuthUserFromRequest } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

jest.mock("@/app/lib/auth", () => ({
  getAuthUserFromRequest: jest.fn(),
}));

jest.mock("@/app/lib/prisma", () => ({
  prisma: {
    hive: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

function makeCtx(id: string) {
  return { params: Promise.resolve({ id }) } as any;
}

describe("PUT /api/hives/:id - strength validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("400 when strength is outside 0-10", async () => {
    (getAuthUserFromRequest as jest.Mock).mockReturnValue({ userId: 1, role: "BEEKEEPER" });

    (prisma.hive.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Kosnica 1",
      ownerId: 1,
      strength: 5,
      location: null,
      status: null,
    });

    const req = new Request("http://localhost/api/hives/1", {
      method: "PUT",
      headers: { Authorization: "Bearer x" },
      body: JSON.stringify({ strength: 999 }),
    });

    const res = await PUT(req, makeCtx("1"));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.error).toMatch(/0-10/i);

    // update se ne sme ni pozvati kad je invalid
    expect(prisma.hive.update).not.toHaveBeenCalled();
  });

  test("200 when strength is valid number", async () => {
    (getAuthUserFromRequest as jest.Mock).mockReturnValue({ userId: 1, role: "BEEKEEPER" });

    (prisma.hive.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Kosnica 1",
      ownerId: 1,
      strength: 5,
      location: null,
      status: null,
    });

    (prisma.hive.update as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Kosnica 1",
      ownerId: 1,
      strength: 8,
    });

    const req = new Request("http://localhost/api/hives/1", {
      method: "PUT",
      headers: { Authorization: "Bearer x" },
      body: JSON.stringify({ strength: 8 }),
    });

    const res = await PUT(req, makeCtx("1"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hive.strength).toBe(8);
  });
});
