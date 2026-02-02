import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUserFromRequest } from "@/app/lib/auth";

// GET /api/hives
export async function GET() {
  const hives = await prisma.hive.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { id: true, fullName: true, email: true } } },
  });
  return NextResponse.json({ hives });
}

// POST /api/hives
export async function POST(req: Request) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, location, status, strength } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Missing field: name" }, { status: 400 });
    }

    let strengthValue: number | null = null;
    if (strength !== undefined && strength !== null && strength !== "") {
      const n = Number(strength);
      if (Number.isNaN(n) || n < 0 || n > 10) {
        return NextResponse.json({ error: "Strength mora biti broj 0-10" }, { status: 400 });
      }
      strengthValue = n;
    }

    const hive = await prisma.hive.create({
      data: {
        name,
        location: location ?? null,
        status: status ?? null,
        strength: strengthValue,
        ownerId: auth.userId,
      },
    });

    return NextResponse.json({ hive }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}
