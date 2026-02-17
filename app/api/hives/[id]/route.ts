import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAuthUserFromRequest } from "@/app/lib/auth";

type Context = {
  params: Promise<{ id: string }>;
};

// GET /api/hives/:id
export async function GET(req: Request, ctx: Context) {
   const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const hive = await prisma.hive.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, fullName: true, email: true } },
      comments: true,
    },
  });

  if (!hive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const isOwner = hive.ownerId === auth.userId;
  const isAdmin = auth.role === "ADMIN";

 
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ hive });
}

// PUT /api/hives/:id
export async function PUT(req: Request, ctx: Context) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.hive.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = existing.ownerId === auth.userId;
  const isAdmin = auth.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const name = body?.name;
  const location = body?.location;
  const status = body?.status;
  const strength = body?.strength;

  let strengthValue = existing.strength;
  if (strength !== undefined) {
    if (strength === null || strength === "") {
      strengthValue = null;
    } else {
      const n = Number(strength);
      if (Number.isNaN(n) || n < 0 || n > 10) {
        return NextResponse.json({ error: "Strength mora biti broj 0-10" }, { status: 400 });
      }
      strengthValue = n;
    }
  }

  const hive = await prisma.hive.update({
    where: { id },
    data: {
      name: typeof name === "string" && name.length > 0 ? name : existing.name,
      location: location === undefined ? existing.location : (location ?? null),
      status: status === undefined ? existing.status : (status ?? null),
      strength: strengthValue,
    },
  });

  return NextResponse.json({ hive });
}

// DELETE /api/hives/:id
export async function DELETE(req: Request, ctx: Context) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const existing = await prisma.hive.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = existing.ownerId === auth.userId;
  const isAdmin = auth.role === "ADMIN";
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.hive.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
