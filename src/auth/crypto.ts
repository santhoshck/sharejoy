import * as CryptoJS from 'crypto-js';

// Generate a random salt as hex string using expo-crypto for secure native entropy.
export async function generateSalt(): Promise<string> {
  // dynamic import so tests that don't call generateSalt won't load expo-crypto ESM module
  const ExpoCrypto = await import('expo-crypto');
  // 16 bytes = 128 bits salt
  const bytes = await ExpoCrypto.getRandomBytesAsync(16);
  return Array.from(bytes)
    .map((b: number) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Derive a key/hash using PBKDF2. Returns hex string.
export function hashPassword(password: string, saltHex: string): string {
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const derived = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 10000 });
  return derived.toString(CryptoJS.enc.Hex);
}

export function verifyPassword(password: string, saltHex: string, expectedHashHex: string): boolean {
  const hash = hashPassword(password, saltHex);
  // simple string compare of hex representations
  return hash === expectedHashHex;
}
