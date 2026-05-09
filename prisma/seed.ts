import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export type AuthSeedPlan = {
  roles: string[];
  authProviders: string[];
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumber: boolean;
    requireSymbol: boolean;
  };
};

export function buildAuthSeedPlan(): AuthSeedPlan {
  return {
    roles: ['USER', 'ADMIN'],
    authProviders: ['LOCAL', 'GOOGLE'],
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSymbol: false,
    },
  };
}

export async function seedAuthFoundation(prisma: PrismaClient): Promise<void> {
  const plan = buildAuthSeedPlan();

  await Promise.all(
    plan.roles.map((role) =>
      prisma.role.upsert({
        where: { code: role },
        update: {
          name: role,
          isActive: true,
        },
        create: {
          code: role,
          name: role,
          isActive: true,
        },
      }),
    ),
  );

  await Promise.all(
    plan.authProviders.map((provider) =>
      prisma.authProvider.upsert({
        where: { code: provider },
        update: {
          name: provider,
          isEnabled: true,
        },
        create: {
          code: provider,
          name: provider,
          isEnabled: true,
        },
      }),
    ),
  );

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
          userRole: {
            create: {
              role: {
                connect: {
                  code: role,
                },
              },
            },
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
