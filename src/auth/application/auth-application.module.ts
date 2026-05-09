import { Module } from '@nestjs/common';
import { AUTH_TOKENS } from '../domain/constants/injection-tokens';
import { SHARED_TOKENS } from '../../shared/tokens/shared-tokens';
import { AppConfigService } from '../../shared/config/app-config.service';
import { LoginLocalUseCase } from './use-cases/login-local.use-case';
import { RefreshTokenUseCase } from './use-cases/refresh-token.use-case';
import { LogoutUseCase } from './use-cases/logout.use-case';
import { RegisterLocalUseCase } from './use-cases/register-local.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { ResendVerificationUseCase } from './use-cases/resend-verification.use-case';
import { RequestPasswordResetUseCase } from './use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { AuthenticateWithGoogleWebUseCase } from './use-cases/authenticate-with-google-web.use-case';
import { AuthenticateWithGoogleMobileUseCase } from './use-cases/authenticate-with-google-mobile.use-case';
import { GetCurrentProfileUseCase } from './use-cases/get-current-profile.use-case';
import { UpdateUserRoleUseCase } from './use-cases/update-user-role.use-case';
import type {
  CredentialsRepository,
  PasswordResetTokenRepository,
  RefreshSessionRepository,
  UserRepository,
  VerificationTokenRepository,
} from '../domain/repositories';
import type { TokenIssuer } from '../domain/services';
import type { GoogleAuthVerifier } from '../domain/services/google-auth-verifier.service';

@Module({
  providers: [
    {
      provide: AUTH_TOKENS.LOGIN_LOCAL_USE_CASE,
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.CREDENTIALS_REPOSITORY,
        AUTH_TOKENS.TOKEN_ISSUER,
        SHARED_TOKENS.PASSWORD_HASHER,
      ],
      useFactory: (
        userRepository: UserRepository,
        credentialsRepository: CredentialsRepository,
        tokenIssuer: TokenIssuer,
        passwordHasher: {
          verify(plain: string, hash: string): Promise<boolean>;
        },
      ) =>
        new LoginLocalUseCase({
          userRepository,
          credentialsRepository,
          tokenIssuer,
          verifyPassword: (plain, hash) => passwordHasher.verify(plain, hash),
          now: () => new Date(),
          lockoutThreshold: 5,
          lockoutDurationMs: 1000 * 60 * 15,
        }),
    },
    {
      provide: AUTH_TOKENS.REFRESH_TOKEN_USE_CASE,
      inject: [AUTH_TOKENS.TOKEN_ISSUER],
      useFactory: (tokenIssuer: TokenIssuer) =>
        new RefreshTokenUseCase({ tokenIssuer }),
    },
    {
      provide: AUTH_TOKENS.LOGOUT_USE_CASE,
      inject: [AUTH_TOKENS.REFRESH_SESSION_REPOSITORY],
      useFactory: (refreshSessionRepository: RefreshSessionRepository) =>
        new LogoutUseCase({ refreshSessionRepository }),
    },
    {
      provide: AUTH_TOKENS.REGISTER_LOCAL_USE_CASE,
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.CREDENTIALS_REPOSITORY,
        AUTH_TOKENS.VERIFICATION_TOKEN_REPOSITORY,
        AUTH_TOKENS.TOKEN_ISSUER,
        SHARED_TOKENS.PASSWORD_HASHER,
        SHARED_TOKENS.PASSWORD_POLICY_VALIDATOR,
        SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
        SHARED_TOKENS.DOMAIN_EVENT_BUS,
        AppConfigService,
      ],
      useFactory: (
        users: UserRepository,
        credentials: CredentialsRepository,
        verificationTokens: VerificationTokenRepository,
        tokenIssuer: TokenIssuer,
        passwordHasher: unknown,
        passwordPolicyValidator: unknown,
        tokenKeyManagement: unknown,
        eventBus: unknown,
        appConfigService: AppConfigService,
      ) =>
        new RegisterLocalUseCase({
          userRepository: users,
          credentialsRepository: credentials,
          verificationTokenRepository: verificationTokens,
          tokenIssuer,
          passwordHasher: passwordHasher as never,
          passwordPolicyValidator: passwordPolicyValidator as never,
          tokenKeyManagement: tokenKeyManagement as never,
          eventBus: eventBus as never,
          passwordPolicy: appConfigService.passwordPolicy,
        }),
    },
    {
      provide: AUTH_TOKENS.VERIFY_EMAIL_USE_CASE,
      inject: [
        AUTH_TOKENS.VERIFICATION_TOKEN_REPOSITORY,
        AUTH_TOKENS.USER_REPOSITORY,
        SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
      ],
      useFactory: (
        verificationTokens: VerificationTokenRepository,
        users: UserRepository,
        tokenKeyManagement: unknown,
      ) =>
        new VerifyEmailUseCase({
          verificationTokenRepository: verificationTokens,
          userRepository: users,
          tokenKeyManagement: tokenKeyManagement as never,
          now: () => new Date(),
        }),
    },
    {
      provide: AUTH_TOKENS.RESEND_VERIFICATION_USE_CASE,
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.VERIFICATION_TOKEN_REPOSITORY,
        SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
        AUTH_TOKENS.RESEND_VERIFICATION_THROTTLE_STORE,
        SHARED_TOKENS.DOMAIN_EVENT_BUS,
      ],
      useFactory: (
        users: UserRepository,
        verificationTokens: VerificationTokenRepository,
        tokenKeyManagement: unknown,
        throttleStore: unknown,
        eventBus: unknown,
      ) =>
        new ResendVerificationUseCase({
          userRepository: users,
          verificationTokenRepository: verificationTokens,
          tokenKeyManagement: tokenKeyManagement as never,
          throttleStore: throttleStore as never,
          eventBus: eventBus as never,
          now: () => new Date(),
          resendCooldownMs: 1000 * 60,
        }),
    },
    {
      provide: AUTH_TOKENS.REQUEST_PASSWORD_RESET_USE_CASE,
      inject: [
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
        SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
        SHARED_TOKENS.DOMAIN_EVENT_BUS,
      ],
      useFactory: (
        users: UserRepository,
        passwordResetTokens: PasswordResetTokenRepository,
        tokenKeyManagement: unknown,
        eventBus: unknown,
      ) =>
        new RequestPasswordResetUseCase({
          userRepository: users,
          passwordResetTokenRepository: passwordResetTokens,
          tokenKeyManagement: tokenKeyManagement as never,
          eventBus: eventBus as never,
        }),
    },
    {
      provide: AUTH_TOKENS.RESET_PASSWORD_USE_CASE,
      inject: [
        AUTH_TOKENS.PASSWORD_RESET_TOKEN_REPOSITORY,
        AUTH_TOKENS.USER_REPOSITORY,
        AUTH_TOKENS.CREDENTIALS_REPOSITORY,
        SHARED_TOKENS.TOKEN_KEY_MANAGEMENT,
        SHARED_TOKENS.PASSWORD_HASHER,
        SHARED_TOKENS.PASSWORD_POLICY_VALIDATOR,
        AppConfigService,
      ],
      useFactory: (
        passwordResetTokens: PasswordResetTokenRepository,
        users: UserRepository,
        credentials: CredentialsRepository,
        tokenKeyManagement: unknown,
        passwordHasher: unknown,
        passwordPolicyValidator: unknown,
        appConfigService: AppConfigService,
      ) =>
        new ResetPasswordUseCase({
          passwordResetTokenRepository: passwordResetTokens,
          userRepository: users,
          credentialsRepository: credentials,
          tokenKeyManagement: tokenKeyManagement as never,
          passwordHasher: passwordHasher as never,
          passwordPolicyValidator: passwordPolicyValidator as never,
          passwordPolicy: appConfigService.passwordPolicy,
          now: () => new Date(),
        }),
    },
    {
      provide: AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_WEB_USE_CASE,
      inject: [AUTH_TOKENS.USER_REPOSITORY, AUTH_TOKENS.GOOGLE_AUTH_VERIFIER],
      useFactory: (
        users: UserRepository,
        googleAuthVerifier: GoogleAuthVerifier,
      ) =>
        new AuthenticateWithGoogleWebUseCase({
          userRepository: users,
          googleAuthVerifier,
        }),
    },
    {
      provide: AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_MOBILE_USE_CASE,
      inject: [AUTH_TOKENS.USER_REPOSITORY, AUTH_TOKENS.GOOGLE_AUTH_VERIFIER],
      useFactory: (
        users: UserRepository,
        googleAuthVerifier: GoogleAuthVerifier,
      ) =>
        new AuthenticateWithGoogleMobileUseCase({
          userRepository: users,
          googleAuthVerifier,
        }),
    },
    {
      provide: AUTH_TOKENS.GET_CURRENT_PROFILE_USE_CASE,
      inject: [AUTH_TOKENS.USER_REPOSITORY],
      useFactory: (users: UserRepository) =>
        new GetCurrentProfileUseCase({
          userRepository: users,
        }),
    },
    {
      provide: AUTH_TOKENS.UPDATE_USER_ROLE_USE_CASE,
      inject: [AUTH_TOKENS.USER_REPOSITORY],
      useFactory: (users: UserRepository) =>
        new UpdateUserRoleUseCase({
          userRepository: users,
        }),
    },
  ],
  exports: [
    AUTH_TOKENS.LOGIN_LOCAL_USE_CASE,
    AUTH_TOKENS.REFRESH_TOKEN_USE_CASE,
    AUTH_TOKENS.LOGOUT_USE_CASE,
    AUTH_TOKENS.REGISTER_LOCAL_USE_CASE,
    AUTH_TOKENS.VERIFY_EMAIL_USE_CASE,
    AUTH_TOKENS.RESEND_VERIFICATION_USE_CASE,
    AUTH_TOKENS.REQUEST_PASSWORD_RESET_USE_CASE,
    AUTH_TOKENS.RESET_PASSWORD_USE_CASE,
    AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_WEB_USE_CASE,
    AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_MOBILE_USE_CASE,
    AUTH_TOKENS.GET_CURRENT_PROFILE_USE_CASE,
    AUTH_TOKENS.UPDATE_USER_ROLE_USE_CASE,
  ],
})
export class AuthApplicationModule {}
