import { Module } from '@nestjs/common';
import { AUTH_TOKENS } from '../domain/constants/injection-tokens';
import { AuthPrismaCredentialsRepository } from './persistence/auth-prisma-credentials.repository';
import { AuthPrismaRefreshSessionRepository } from './persistence/auth-prisma-refresh-session.repository';
import {
  AuthPrismaPasswordResetTokensRepository,
  AuthPrismaVerificationTokensRepository,
} from './persistence/auth-prisma-tokens.repository';
import { AuthPrismaUsersRepository } from './persistence/auth-prisma-users.repository';
import {
  GoogleMobileIdTokenVerifier,
  GoogleWebIdTokenVerifier,
} from './security/google-id-token-verifiers';
import { JwtAccessTokenVerifierService } from './security/jwt-access-token-verifier.service';
import { RefreshTokenIssuerAdapter } from './security/refresh-token-issuer.adapter';
import { AppConfigService } from '../../shared/config/app-config.service';
import { JwtAuthGuard } from '../presentation/guards/jwt-auth.guard';
import { RolesGuard } from '../presentation/guards/roles.guard';
import { GoogleAuthGuard } from '../presentation/guards/google-auth.guard';
import { JwtStrategy } from '../presentation/strategies/jwt.strategy';
import { GoogleStrategy } from '../presentation/strategies/google.strategy';

@Module({
  providers: [
    AuthPrismaUsersRepository,
    AuthPrismaCredentialsRepository,
    AuthPrismaVerificationTokensRepository,
    AuthPrismaPasswordResetTokensRepository,
    AuthPrismaRefreshSessionRepository,
    RefreshTokenIssuerAdapter,
    JwtAccessTokenVerifierService,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: GoogleWebIdTokenVerifier,
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) =>
        new GoogleWebIdTokenVerifier({
          webClientIds: appConfigService.googleConfig.webClientIds,
          acceptedIssuers: appConfigService.googleConfig.acceptedIssuers,
        }),
    },
    {
      provide: GoogleMobileIdTokenVerifier,
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) =>
        new GoogleMobileIdTokenVerifier({
          mobileClientIds: appConfigService.googleConfig.mobileClientIds,
          acceptedIssuers: appConfigService.googleConfig.acceptedIssuers,
        }),
    },
    {
      provide: AUTH_TOKENS.USER_REPOSITORY,
      useExisting: AuthPrismaUsersRepository,
    },
    {
      provide: AUTH_TOKENS.CREDENTIALS_REPOSITORY,
      useExisting: AuthPrismaCredentialsRepository,
    },
    {
      provide: AUTH_TOKENS.VERIFICATION_TOKEN_REPOSITORY,
      useExisting: AuthPrismaVerificationTokensRepository,
    },
    {
      provide: AUTH_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
      useExisting: AuthPrismaPasswordResetTokensRepository,
    },
    {
      provide: AUTH_TOKENS.REFRESH_SESSION_REPOSITORY,
      useExisting: AuthPrismaRefreshSessionRepository,
    },
    {
      provide: AUTH_TOKENS.TOKEN_ISSUER,
      useExisting: RefreshTokenIssuerAdapter,
    },
    {
      provide: AUTH_TOKENS.GOOGLE_AUTH_VERIFIER,
      useExisting: GoogleStrategy,
    },
    {
      provide: AUTH_TOKENS.RESEND_VERIFICATION_THROTTLE_STORE,
      useValue: {
        isOnCooldown: () => Promise.resolve(false),
        mark: () => Promise.resolve(),
      },
    },
  ],
  exports: [
    AUTH_TOKENS.USER_REPOSITORY,
    AUTH_TOKENS.CREDENTIALS_REPOSITORY,
    AUTH_TOKENS.VERIFICATION_TOKEN_REPOSITORY,
    AUTH_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
    AUTH_TOKENS.REFRESH_SESSION_REPOSITORY,
    AUTH_TOKENS.TOKEN_ISSUER,
    AUTH_TOKENS.GOOGLE_AUTH_VERIFIER,
    AUTH_TOKENS.RESEND_VERIFICATION_THROTTLE_STORE,
    JwtAccessTokenVerifierService,
    GoogleStrategy,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
  ],
})
export class AuthInfrastructureModule {}
