import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  buildAuthFoundationPlan,
} from '../src/auth/infrastructure/bootstrap/auth-foundation-plan';
import { ensureAuthFoundation } from '../src/auth/infrastructure/bootstrap/ensure-auth-foundation';

export { buildAuthFoundationPlan as buildAuthSeedPlan };

export async function seedAuthFoundation(prisma: PrismaClient): Promise<void> {
  const plan = buildAuthFoundationPlan();

  await ensureAuthFoundation(prisma);

  await Promise.all(
    plan.roles.map((role) =>
      prisma.user.upsert({
        where: {
          email: `${role.toLowerCase()}-seed@invalid.local`,
        },
        update: {},
        create: {
          email: `${role.toLowerCase()}-seed@invalid.local`,
          username: `${role.toLowerCase()}_seed`,
          emailVerified: false,
          userRoles: {
            create: [
              {
                role: {
                  connect: {
                    code: role,
                  },
                },
              },
            ],
          },
        },
      }),
    ),
  );

  const existingPolicy = await prisma.passwordPolicy.findFirst();
  if (!existingPolicy) {
    await prisma.passwordPolicy.create({ data: plan.passwordPolicy });
  }
}

async function main() {
  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres',
  });
  const prisma = new PrismaClient({ adapter });
  await seedAuthFoundation(prisma);
  await prisma.$disconnect();
}

void main();
