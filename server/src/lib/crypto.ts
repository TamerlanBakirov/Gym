import bcrypt from 'bcryptjs';
import { randomUUID, randomBytes, createHash } from 'node:crypto';

export const uid = (): string => randomUUID();

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, 10);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

/** Opaque random token (used for refresh tokens). */
export const randomToken = (): string => randomBytes(48).toString('hex');

/** Store only a hash of refresh tokens at rest. */
export const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');
