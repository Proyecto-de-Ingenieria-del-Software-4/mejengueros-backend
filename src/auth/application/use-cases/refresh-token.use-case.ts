import type { IssueTokensResult } from '../../domain/services/issue-tokens.result';
import type { RefreshTokenDependencies } from '../contracts';
import type { RefreshTokenCommand } from '../dto';

export class RefreshTokenUseCase {
  constructor(private readonly deps: RefreshTokenDependencies) {}

  execute(command: RefreshTokenCommand): Promise<IssueTokensResult> {
    return this.deps.tokenIssuer.rotateRefreshToken(command.refreshToken);
  }
}
