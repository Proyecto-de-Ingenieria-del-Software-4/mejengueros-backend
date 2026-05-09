import type { AuthFoundationPrisma } from './auth-foundation-prisma.type';
import { buildAuthFoundationPlan } from './auth-foundation-plan';

export async function ensureAuthFoundation(
  prisma: AuthFoundationPrisma,
): Promise<void> {
  const plan = buildAuthFoundationPlan();

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

  await prisma.appKey.upsert({
    where: { kid: plan.appKey.kid },
    update: {
      algorithm: plan.appKey.algorithm,
      purpose: plan.appKey.purpose,
      status: plan.appKey.status,
      fingerprint: plan.appKey.fingerprint,
      activatedAt: new Date(),
      retiredAt: null,
    },
    create: {
      kid: plan.appKey.kid,
      algorithm: plan.appKey.algorithm,
      purpose: plan.appKey.purpose,
      status: plan.appKey.status,
      fingerprint: plan.appKey.fingerprint,
      activatedAt: new Date(),
    },
  });

  const existingPolicy = await prisma.passwordPolicy.findFirst();
  if (!existingPolicy) {
    await prisma.passwordPolicy.create({ data: plan.passwordPolicy });
  }
}
