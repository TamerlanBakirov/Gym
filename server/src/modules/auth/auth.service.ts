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

async function issueTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = randomToken();
  const expires = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400_000);
  await tokensRepo.store(user.id, refreshToken, expires);
  return { accessToken, refreshToken };
}

export const authService = {
  async register(email: string, password: string, name: string): Promise<AuthResult> {
    const normalized = email.trim().toLowerCase();
    if (await usersRepo.findByEmail(normalized)) {
      throw ApiError.conflict('An account with this email already exists');
    }
    const passwordHash = await hashPassword(password);
    const user = await usersRepo.create(normalized, passwordHash, name.trim());
    const tokens = await issueTokens(user);
    return { user, profile: await profilesRepo.get(user.id), ...tokens };
  },

  async login(email: string, password: string): Promise<AuthResult> {
    const normalized = email.trim().toLowerCase();
    const found = await usersRepo.findByEmail(normalized);
    if (!found) throw ApiError.unauthorized('Invalid email or password');
    const ok = await verifyPassword(password, found.password_hash);
    if (!ok) throw ApiError.unauthorized('Invalid email or password');
    const tokens = await issueTokens(found.user);
    return { user: found.user, profile: await profilesRepo.get(found.user.id), ...tokens };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = await tokensRepo.resolve(refreshToken);
    if (!userId) throw ApiError.unauthorized('Invalid or expired refresh token');
    const user = await usersRepo.findById(userId);
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    // Rotate: revoke the used token, issue a new pair.
    await tokensRepo.revoke(refreshToken);
    return issueTokens(user);
  },

  async logout(refreshToken: string): Promise<void> {
    if (refreshToken) await tokensRepo.revoke(refreshToken);
  },
};
