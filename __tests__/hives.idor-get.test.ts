import { GET } from "@/app/api/hives/[id]/route";
import { getAuthUserFromRequest } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

jest.mock("@/app/lib/auth", () => ({
  getAuthUserFromRequest: jest.fn(),
}));

jest.mock("@/app/lib/prisma", () => ({
  prisma: {
    hive: {
      findUnique: jest.fn(),
    },
  },
}));

function makeCtx(id: string) {
  return { params: Promise.resolve({ id }) } as any;
}

describe("GET /api/hives/:id - IDOR protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("401 when not authenticated", async () => {
    (getAuthUserFromRequest as jest.Mock).mockReturnValue(null);

    const res = await GET(new Request("http://localhost/api/hives/1"), makeCtx("1"));
    expect(res.status).toBe(401);
  });

  test("403 when user is not owner and not admin", async () => {
    (getAuthUserFromRequest as jest.Mock).mockReturnValue({ userId: 5, role: "BEEKEEPER" });

    (prisma.hive.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Tudja kosnica",
      ownerId: 999, // nije vlasnik
      owner: { id: 999, fullName: "Neko", email: "neko@test.com" },
      comments: [],
    });

    const res = await GET(new Request("http://localhost/api/hives/1"), makeCtx("1"));
    expect(res.status).toBe(403);
  });

  test("200 when user is owner", async () => {
    (getAuthUserFromRequest as jest.Mock).mockReturnValue({ userId: 5, role: "BEEKEEPER" });

    (prisma.hive.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Moja kosnica",
      ownerId: 5, // vlasnik
      owner: { id: 5, fullName: "Ja", email: "ja@test.com" },
      comments: [],
    });

    const res = await GET(new Request("http://localhost/api/hives/1"), makeCtx("1"));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.hive.id).toBe(1);
  });

  test("200 when user is ADMIN", async () => {
    (getAuthUserFromRequest as jest.Mock).mockReturnValue({ userId: 123, role: "ADMIN" });

    (prisma.hive.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "Bilo cija kosnica",
      ownerId: 999,
      owner: { id: 999, fullName: "Neko", email: "neko@test.com" },
      comments: [],
    });

    const res = await GET(new Request("http://localhost/api/hives/1"), makeCtx("1"));
    expect(res.status).toBe(200);
  });
});
