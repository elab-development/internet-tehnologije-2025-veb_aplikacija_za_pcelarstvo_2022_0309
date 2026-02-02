import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing fields: email, password, fullName" },
        { status: 400 }
      );
    }

    const allowedRoles = ["BEEKEEPER", "ADMIN", "ASSOCIATION_REP"] as const;
    const roleValue = allowedRoles.includes(role) ? role : "BEEKEEPER";

    const existing = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        email: String(email).trim().toLowerCase(),
        passwordHash,
        fullName: String(fullName).trim(),
        role: roleValue,
      },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true },
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "JWT_SECRET missing" }, { status: 500 });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      secret,
      { expiresIn: "7d" }
    );

    return NextResponse.json({ token, user }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}

