import { env } from '../../env.js';
import { ApiError } from '../../lib/http.js';
import { hashPassword, randomCode, randomToken, verifyPassword } from '../../lib/crypto.js';
import { signAccessToken } from '../../lib/jwt.js';
import { sendMail } from '../../lib/mailer.js';
import { profilesRepo, usersRepo } from '../users/users.repo.js';
import { tokensRepo } from './tokens.repo.js';
import { authTokensRepo } from './authTokens.repo.js';
import type { Profile, User } from '../../types.js';

const CODE_TTL_MS = 15 * 60 * 1000;

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

  /** Create + "email" an email-verification code. Returns the code (for dev use). */
  async requestEmailVerification(userId: string, email: string): Promise<string> {
    const code = randomCode();
    await authTokensRepo.create(userId, 'verify', code, new Date(Date.now() + CODE_TTL_MS));
    await sendMail({
      to: email,
      subject: 'Verify your Forge email',
      text: `Your verification code is ${code}. It expires in 15 minutes.`,
    });
    return code;
  },

  async confirmEmailVerification(userId: string, code: string): Promise<void> {
    const ok = await authTokensRepo.consume(userId, 'verify', code);
    if (!ok) throw ApiError.badRequest('Invalid or expired code');
    await usersRepo.setEmailVerified(userId, true);
  },

  /**
   * Start a password reset. Always resolves (no account enumeration).
   * Returns the code when a matching account exists, else null.
   */
  async requestPasswordReset(email: string): Promise<string | null> {
    const found = await usersRepo.findByEmail(email.trim().toLowerCase());
    if (!found) return null;
    const code = randomCode();
    await authTokensRepo.create(found.user.id, 'reset', code, new Date(Date.now() + CODE_TTL_MS));
    await sendMail({
      to: found.user.email,
      subject: 'Reset your Forge password',
      text: `Your password reset code is ${code}. It expires in 15 minutes.`,
    });
    return code;
  },

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    const found = await usersRepo.findByEmail(email.trim().toLowerCase());
    if (!found) throw ApiError.badRequest('Invalid or expired code');
    const ok = await authTokensRepo.consume(found.user.id, 'reset', code);
    if (!ok) throw ApiError.badRequest('Invalid or expired code');
    const passwordHash = await hashPassword(newPassword);
    await usersRepo.setPassword(found.user.id, passwordHash);
    // Invalidate existing sessions after a password change.
    await tokensRepo.revokeAllForUser(found.user.id);
  },
};
