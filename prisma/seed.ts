import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = ["Development", "Design", "Business", "Lifestyle", "Language", "Health"];

  for (const name of categories) {
    await prisma.skillCategory.upsert({
      where: { name },
      update: {},
      create: {
        name,
        skills: {
          create: [
            { name: `${name} Basics` },
            { name: `Advanced ${name}` },
          ],
        },
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
