import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUserFromRequest } from "@/app/lib/auth";

// GET /api/hives  (javno ili možeš da ostaviš javno za sada)
export async function GET() {
  const hives = await prisma.hive.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { id: true, fullName: true, email: true } } },
  });
  return NextResponse.json({ hives });
}

// POST /api/hives  (SAMO ulogovan)
export async function POST(req: Request) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, location, status } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Missing field: name" }, { status: 400 });
    }

    const hive = await prisma.hive.create({
      data: {
        name,
        location: location ?? null,
        status: status ?? null,
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
