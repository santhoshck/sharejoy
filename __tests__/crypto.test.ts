import { hashPassword, verifyPassword } from '../src/auth/crypto';

describe('crypto hashing', () => {
  it('hashPassword returns deterministic hex for given salt', () => {
    const password = 'S3cr3t!';
    const salt = 'a1b2c3d4e5f60123456789abcdef0001'; // 16 bytes hex
    const hash = hashPassword(password, salt);
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    // hashing same inputs should produce same result
    const hash2 = hashPassword(password, salt);
    expect(hash).toBe(hash2);
  });

  it('verifyPassword validates correct password and rejects wrong', () => {
    const password = 'hunter2';
    const salt = '00112233445566778899aabbccddeeff';
    const hash = hashPassword(password, salt);
    expect(verifyPassword(password, salt, hash)).toBe(true);
    expect(verifyPassword('wrong', salt, hash)).toBe(false);
  });
});
