import { env } from '../../env.js';
import { ApiError } from '../../lib/http.js';
import { hashPassword, randomToken, verifyPassword } from '../../lib/crypto.js';
import { signAccessToken } from '../../lib/jwt.js';
import { profilesRepo, usersRepo } from '../users/users.repo.js';
import { tokensRepo } from './tokens.repo.js';
import type { Profile, User } from '../../types.js';

export interface AuthResult {
  user: User;
  profile: Profile | null;
  accessToken: string;
  refreshToken: string;
}

function issueTokens(user: User): { accessToken: string; refreshToken: string } {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = randomToken();
  const expires = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400_000);
  tokensRepo.store(user.id, refreshToken, expires);
  return { accessToken, refreshToken };
}

export const authService = {
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    const normalized = email.trim().toLowerCase();
    if (usersRepo.findByEmail(normalized)) {
      throw ApiError.conflict('An account with this email already exists');
    }
    const passwordHash = await hashPassword(password);
    const user = usersRepo.create(normalized, passwordHash, name.trim());
    const tokens = issueTokens(user);
    return { user, profile: profilesRepo.get(user.id), ...tokens };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const normalized = email.trim().toLowerCase();
    const found = usersRepo.findByEmail(normalized);
    if (!found) throw ApiError.unauthorized('Invalid email or password');
    const ok = await verifyPassword(password, found.password_hash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');
    const tokens = issueTokens(found.user);
    return { user: found.user, profile: profilesRepo.get(found.user.id), ...tokens };
  },

  refresh(refreshToken: string): { accessToken: string; refreshToken: string } {
    const userId = tokensRepo.resolve(refreshToken);
    if (!userId) throw ApiError.unauthorized('Invalid or expired refresh token');
    const user = usersRepo.findById(userId);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    // Rotate: revoke the used token, issue a new pair.
    tokensRepo.revoke(refreshToken);
    return issueTokens(user);
  },

  logout(refreshToken: string): void {
    if (refreshToken) tokensRepo.revoke(refreshToken);
  },
};
