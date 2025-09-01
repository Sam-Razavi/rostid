import { describe, it, expect } from 'vitest';
import { signAccessToken, verifyAccessToken, signRefreshToken, verifyRefreshToken } from '../jwt';

describe('JWT utilities', () => {
  describe('access tokens', () => {
    const payload = { userId: 'user-123', email: 'test@test.com', role: 'customer' };

    it('signs and verifies an access token', () => {
      const token = signAccessToken(payload);
      expect(typeof token).toBe('string');
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe('user-123');
      expect(decoded.email).toBe('test@test.com');
      expect(decoded.role).toBe('customer');
    });

    it('throws on invalid access token', () => {
      expect(() => verifyAccessToken('not.a.valid.token')).toThrow();
    });

    it('throws on tampered access token', () => {
      const token = signAccessToken(payload);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => verifyAccessToken(tampered)).toThrow();
    });
  });

  describe('refresh tokens', () => {
    const payload = { userId: 'user-456', tokenId: 'tok-abc' };

    it('signs and verifies a refresh token', () => {
      const token = signRefreshToken(payload);
      expect(typeof token).toBe('string');
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe('user-456');
      expect(decoded.tokenId).toBe('tok-abc');
    });

    it('throws on invalid refresh token', () => {
      expect(() => verifyRefreshToken('garbage')).toThrow();
    });

    it('access token secret does not verify refresh token', () => {
      const refresh = signRefreshToken(payload);
      expect(() => verifyAccessToken(refresh)).toThrow();
    });
  });
});
