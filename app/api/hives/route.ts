import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUserFromRequest } from "@/app/lib/auth";

// GET /api/hives
export async function GET(req: Request) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (auth.role === "BEEKEEPER") {
      const hives = await prisma.hive.findMany({
        where: { ownerId: auth.userId },
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { id: true, fullName: true, email: true } } },
      });
      return NextResponse.json({ hives });
    }

    if (auth.role === "ADMIN") {
      const hives = await prisma.hive.findMany({
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { id: true, fullName: true, email: true } } },
      });
      return NextResponse.json({ hives });
    }

    if (auth.role === "ASSOCIATION_REP") {
      const total = await prisma.hive.count();

      const active = await prisma.hive.count({ where: { status: "ACTIVE" } });
      const inactive = await prisma.hive.count({ where: { status: "INACTIVE" } });
      const unknown = total - active - inactive;

      const strengthAgg = await prisma.hive.aggregate({
        _avg: { strength: true },
      });

      const byLocationRaw = await prisma.hive.groupBy({
        by: ["location"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      });

      const byLocation = byLocationRaw.map((x) => ({
        location: x.location ?? "Nepoznata lokacija",
        count: x._count.id,
      }));


      return NextResponse.json({
        stats: {
          total,
          active,
          inactive,
          unknown,
          avgStrength: strengthAgg._avg.strength ?? null,
          topLocations: byLocation,
        },
      });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

