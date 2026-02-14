import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  const pass = await bcrypt.hash("Demo123!", 10);

  // ADMIN USER
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      fullName: "Admin Demo",
      passwordHash: pass,
      role: Role.ADMIN,
    },
  });

  // BEEKEEPER USER
  const beekeeper = await prisma.user.upsert({
    where: { email: "beekeeper@demo.com" },
    update: {},
    create: {
      email: "beekeeper@demo.com",
      fullName: "Pčelar Demo",
      passwordHash: pass,
      role: Role.BEEKEEPER,
    },
  });

  // HIVES
  await prisma.hive.createMany({
    data: [
      {
        name: "Hive 1",
        location: "Novi Sad",
        status: "ACTIVE",
        strength: 8,
        ownerId: beekeeper.id,
      },
      {
        name: "Hive 2",
        location: "Beograd",
        status: "WEAK",
        strength: 4,
        ownerId: beekeeper.id,
      },
    ],
  });

  console.log("Seed završen.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
