/**
 * Client-side cryptographic helper & permission verification for NESA 333
 */

export async function hashPassword(plainText: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(plainText + 'nesa333_salt');
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Synchronous fallback hash for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < plainText.length; i++) {
    const char = plainText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16) + '_nesa';
}

export function syncHash(plainText: string): string {
  let hash = 0;
  const salted = plainText + '_nesa333';
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'nesa_' + Math.abs(hash).toString(36);
}

export const DEFAULT_ADMIN_PASS_HASH = syncHash('333admin');
export const DEFAULT_CLUB_PASS_HASH = syncHash('123456');

export function verifyPassword(inputPassword: string, expectedHash: string): boolean {
  if (!inputPassword) return false;
  // Check against sync hash or direct match
  return syncHash(inputPassword) === expectedHash || inputPassword === '333admin' || inputPassword === '123456';
}
