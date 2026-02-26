import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const PASSWORD_ADMIN = "Admin123!";
const PASSWORD_DEFAULT = "Honey123!";

type SeedUser = {
  email: string;
  fullName: string;
  role: Role;
};

type SeedHive = {
  name: string;
  location: string | null;
  status: string | null;    
  strength: number | null;  
  ownerEmail: string;
};

type SeedComment = {
  text: string;
  hiveName: string;
  hiveOwnerEmail: string;
  authorEmail: string;
};

async function main(): Promise<void> {
  const userCount: number = await prisma.user.count();

  if (userCount > 0) {
    console.log("🌿 Baza nije prazna. Cloud seed preskačem.");
    return;
  }

  console.log("🌱 Baza je prazna. Pokrećem cloud seed...");

  const hashAdmin: string = await bcrypt.hash(PASSWORD_ADMIN, 10);
  const hashDefault: string = await bcrypt.hash(PASSWORD_DEFAULT, 10);

  // ===== USERS  =====
  const users: SeedUser[] = [
    { email: "test@test.com", fullName: "Test User", role: Role.BEEKEEPER },
    { email: "admin@test.com", fullName: "Admin User", role: Role.ADMIN },
    { email: "lena@gmail.com", fullName: "Lena Jovanovic", role: Role.BEEKEEPER },
    { email: "nadja@gmail.com", fullName: "Nadja Milanovic", role: Role.BEEKEEPER },
    { email: "glorija@gmail.com", fullName: "Glorija Milikic", role: Role.BEEKEEPER },
    { email: "katarina@gmail.com", fullName: "Katarina Markovic", role: Role.ASSOCIATION_REP },
    { email: "milos@gmail.com", fullName: "Milos Milosevic", role: Role.ADMIN },
    { email: "jana@gmail.com", fullName: "Jana Jankovic", role: Role.BEEKEEPER },
    { email: "naca@gmail.com", fullName: "Naca Milosevic", role: Role.ADMIN },
  ];

  const userIdByEmail = new Map<string, number>();

  for (const u of users) {
    const passwordHash: string = u.role === Role.ADMIN ? hashAdmin : hashDefault;

    const created = await prisma.user.create({
      data: {
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        passwordHash,
        // associationId ostaje null 
      },
      select: { id: true, email: true },
    });

    userIdByEmail.set(created.email, created.id);
  }

  const getUserId = (email: string): number => {
    const id = userIdByEmail.get(email);
    if (!id) throw new Error(`Nedostaje userId za email: ${email}`);
    return id;
  };

  // ===== HIVES  =====
  const hives: SeedHive[] = [
    // owner = test@test.com
    { name: "Košnica 1", location: "Novi Sad", status: "OK", strength: 8, ownerEmail: "test@test.com" },
    { name: "Košnica 2", location: "Fruška Gora", status: "ACTIVE", strength: 6, ownerEmail: "test@test.com" },
    { name: "Zimska košnica", location: "Sremski Karlovci", status: "INACTIVE", strength: 3, ownerEmail: "test@test.com" },
    { name: "Bagremova košnica", location: "Bačka Palanka", status: "ACTIVE", strength: 4, ownerEmail: "test@test.com" },
    { name: "Lipova košnica", location: "Sombor", status: "ACTIVE", strength: 7, ownerEmail: "test@test.com" },
    { name: "Šumska košnica", location: "Tara", status: "ACTIVE", strength: 9, ownerEmail: "test@test.com" },

    // owner = nadja@gmail.com
    { name: "Sjenička košnica 2", location: "Sjenica", status: "INACTIVE", strength: 10, ownerEmail: "nadja@gmail.com" },
    { name: "Kv košnica", location: "Kraljevo", status: "ACTIVE", strength: 7, ownerEmail: "nadja@gmail.com" },
    { name: "Jagodina kosnica", location: "Jagodina", status: "ACTIVE", strength: 7, ownerEmail: "nadja@gmail.com" },
  ];

  const hiveIdByKey = new Map<string, number>();
  const hiveKey = (ownerEmail: string, hiveName: string): string => `${ownerEmail}__${hiveName}`;

  for (const h of hives) {
    const created = await prisma.hive.create({
      data: {
        name: h.name,
        location: h.location,
        status: h.status,
        strength: h.strength,
        ownerId: getUserId(h.ownerEmail),
      },
      select: { id: true },
    });

    hiveIdByKey.set(hiveKey(h.ownerEmail, h.name), created.id);
  }

  const getHiveId = (ownerEmail: string, hiveName: string): number => {
    const id = hiveIdByKey.get(hiveKey(ownerEmail, hiveName));
    if (!id) throw new Error(`Nedostaje hiveId za: ${ownerEmail} / ${hiveName}`);
    return id;
  };

  // ===== COMMENTS =====
  const comments: SeedComment[] = [
    { text: "Prvi komentar", hiveName: "Košnica 1", hiveOwnerEmail: "test@test.com", authorEmail: "test@test.com" },
    { text: "Redovan pregled, stanje...", hiveName: "Košnica 1", hiveOwnerEmail: "test@test.com", authorEmail: "test@test.com" },
    { text: "Potrebno dodatno hranje...", hiveName: "Košnica 2", hiveOwnerEmail: "test@test.com", authorEmail: "test@test.com" },
    { text: "Priprema za zimu završe...", hiveName: "Zimska košnica", hiveOwnerEmail: "test@test.com", authorEmail: "test@test.com" },
  ];

  await prisma.comment.createMany({
    data: comments.map((c) => ({
      text: c.text,
      hiveId: getHiveId(c.hiveOwnerEmail, c.hiveName),
      authorId: getUserId(c.authorEmail),
    })),
  });

  console.log("✅ Cloud seed završen.");
  console.log("Demo kredencijali:");
  console.log("- ADMIN (admin@test.com, milos@gmail.com, naca@gmail.com): Admin123!");
  console.log("- Ostali: Honey123!");
  console.log("Primer:");
  console.log("- admin@test.com / Admin123!");
  console.log("- test@test.com / Honey123!");
}

main()
  .catch((error: unknown) => {
    console.error("❌ Cloud seed error:", error);
    process.exit(1);
  })
  .finally(async (): Promise<void> => {
    await prisma.$disconnect();
  });