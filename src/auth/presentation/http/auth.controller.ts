import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LoginLocalUseCase } from '../../application/use-cases/login-local.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RegisterLocalUseCase } from '../../application/use-cases/register-local.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { ResendVerificationUseCase } from '../../application/use-cases/resend-verification.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { AuthenticateWithGoogleWebUseCase } from '../../application/use-cases/authenticate-with-google-web.use-case';
import { AuthenticateWithGoogleMobileUseCase } from '../../application/use-cases/authenticate-with-google-mobile.use-case';
import { GetCurrentProfileUseCase } from '../../application/use-cases/get-current-profile.use-case';
import { UpdateUserRoleUseCase } from '../../application/use-cases/update-user-role.use-case';
import type { AuthUserContext } from './auth-user-context';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { mapAuthErrorToHttpException } from './auth-error.mapper';
import { AUTH_TOKENS } from '../../domain/constants/injection-tokens';
import {
  GoogleAuthRequestBody,
  LoginRequestBody,
  LogoutRequestBody,
  RefreshRequestBody,
  RegisterRequestBody,
  RequestPasswordResetRequestBody,
  ResendVerificationRequestBody,
  ResetPasswordRequestBody,
  UpdateRoleRequestBody,
  VerifyEmailRequestBody,
} from './contracts';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_TOKENS.LOGIN_LOCAL_USE_CASE)
    private readonly loginLocalUseCase: LoginLocalUseCase,
    @Inject(AUTH_TOKENS.REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(AUTH_TOKENS.LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCase,
    @Inject(AUTH_TOKENS.REGISTER_LOCAL_USE_CASE)
    private readonly registerLocalUseCase: RegisterLocalUseCase,
    @Inject(AUTH_TOKENS.VERIFY_EMAIL_USE_CASE)
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    @Inject(AUTH_TOKENS.RESEND_VERIFICATION_USE_CASE)
    private readonly resendVerificationUseCase: ResendVerificationUseCase,
    @Inject(AUTH_TOKENS.REQUEST_PASSWORD_RESET_USE_CASE)
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
    @Inject(AUTH_TOKENS.RESET_PASSWORD_USE_CASE)
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    @Inject(AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_WEB_USE_CASE)
    private readonly authenticateWithGoogleWebUseCase: AuthenticateWithGoogleWebUseCase,
    @Inject(AUTH_TOKENS.AUTHENTICATE_WITH_GOOGLE_MOBILE_USE_CASE)
    private readonly authenticateWithGoogleMobileUseCase: AuthenticateWithGoogleMobileUseCase,
    @Inject(AUTH_TOKENS.GET_CURRENT_PROFILE_USE_CASE)
    private readonly getCurrentProfileUseCase: GetCurrentProfileUseCase,
    @Inject(AUTH_TOKENS.UPDATE_USER_ROLE_USE_CASE)
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
  ) {}

  private async execute<T>(handler: () => Promise<T>): Promise<T> {
    try {
      return await handler();
    } catch (error) {
      throw mapAuthErrorToHttpException(error);
    }
  }

  @Post('register')
  @Public()
  register(@Body() body: RegisterRequestBody) {
    return this.execute(() => this.registerLocalUseCase.execute(body));
  }

  @Post('verify-email')
  @Public()
  verifyEmail(@Body() body: VerifyEmailRequestBody) {
    return this.execute(() =>
      this.verifyEmailUseCase.execute({ token: body.token }),
    );
  }

  @Post('resend-verification')
  @Public()
  resendVerification(@Body() body: ResendVerificationRequestBody) {
    return this.execute(() =>
      this.resendVerificationUseCase.execute({ email: body.email }),
    );
  }

  @Post('login')
  @Public()
  login(@Body() body: LoginRequestBody) {
    return this.execute(() => this.loginLocalUseCase.execute(body));
  }

  @Post('refresh')
  @Public()
  refresh(@Body() body: RefreshRequestBody) {
    return this.execute(() => this.refreshTokenUseCase.execute(body));
  }

  @Post('logout')
  logout(@Body() body: LogoutRequestBody) {
    return this.execute(() => this.logoutUseCase.execute(body));
  }

  @Post('request-password-reset')
  @Public()
  requestPasswordReset(@Body() body: RequestPasswordResetRequestBody) {
    return this.execute(() =>
      this.requestPasswordResetUseCase.execute({ email: body.email }),
    );
  }

  @Post('reset-password')
  @Public()
  resetPassword(@Body() body: ResetPasswordRequestBody) {
    return this.execute(() => this.resetPasswordUseCase.execute(body));
  }

  @Post('google/web')
  @Public()
  @UseGuards(GoogleAuthGuard)
  googleWeb(@Body() body: GoogleAuthRequestBody) {
    return this.execute(() =>
      this.authenticateWithGoogleWebUseCase.execute({ idToken: body.idToken }),
    );
  }

  @Post('google/mobile')
  @Public()
  @UseGuards(GoogleAuthGuard)
  googleMobile(@Body() body: GoogleAuthRequestBody) {
    return this.execute(() =>
      this.authenticateWithGoogleMobileUseCase.execute({
        idToken: body.idToken,
      }),
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUserContext) {
    return this.execute(() =>
      this.getCurrentProfileUseCase.execute({ userId: user.userId }),
    );
  }

  @Patch('roles/:targetUserId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateRole(
    @CurrentUser() user: AuthUserContext,
    @Param('targetUserId') targetUserId: string,
    @Body() body: UpdateRoleRequestBody,
  ) {
    return this.execute(() =>
      this.updateUserRoleUseCase.execute({
        actorUserId: user.userId,
        targetUserId,
        role: body.role,
      }),
    );
  }
}
