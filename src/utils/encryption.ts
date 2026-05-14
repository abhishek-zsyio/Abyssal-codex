/**
 * Encryption Utility for End-to-End Encryption (Zero-Knowledge)
 * Uses Web Crypto API (AES-GCM 256-bit)
 */

import { get, set } from "idb-keyval";

const VAULT_KEY_NAME = "abyssal-vault-key";
const ENCRYPTION_PEPPER = "abyssal-docs-fixed-pepper-v1-0xAF92"; // Static pepper for derivation

/**
 * Derives a deterministic 256-bit key from a User ID
 */
export async function getAccountKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  // Combine UserID with a secret pepper for security
  const baseKeyMaterial = encoder.encode(userId + ENCRYPTION_PEPPER);
  
  // Hash the material to get exactly 256 bits
  const hash = await window.crypto.subtle.digest("SHA-256", baseKeyMaterial);
  
  return await window.crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM", length: 256 },
    false, // not extractable
    ["encrypt", "decrypt"]
  );
}

/**
 * Gets the vault key. If userId is provided, it returns the deterministic account key.
 * Otherwise, it falls back to the local random key (for guests).
 */
export async function getVaultKey(userId?: string): Promise<CryptoKey> {
  if (userId) {
    return await getAccountKey(userId);
  }

  // Fallback for local/guest users
  const storedKeyData = await get(VAULT_KEY_NAME);
  if (storedKeyData) {
    try {
      return await window.crypto.subtle.importKey(
        "jwk",
        storedKeyData,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
    } catch (e) {
      console.error("Failed to import local key", e);
    }
  }

  // Generate new local key if none exists
  const newKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const jwk = await window.crypto.subtle.exportKey("jwk", newKey);
  await set(VAULT_KEY_NAME, jwk);
  return newKey;
}

/**
 * Encrypts a string using the vault key
 * Returns a base64 encoded string containing the IV and the ciphertext
 */
export async function encrypt(text: string, userId?: string): Promise<string> {
  const key = await getVaultKey(userId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encodedText = new TextEncoder().encode(text);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedText
  );

  // Combine IV and Ciphertext for storage
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  // Convert to Base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64 encoded string using the vault key
 * Supports fallback to local key if account-based key fails
 */
export async function decrypt(encryptedBase64: string, userId?: string): Promise<string> {
  try {
    const combined = new Uint8Array(
      atob(encryptedBase64)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);

    // Try primary key (Account-based if userId exists, otherwise Local)
    try {
      const primaryKey = await getVaultKey(userId);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        primaryKey,
        ciphertext
      );
      return new TextDecoder().decode(decryptedBuffer);
    } catch (primaryError) {
      // If primary failed and we have a userId, try fallback to Local key
      if (userId) {
        try {
          const fallbackKey = await getVaultKey(); // Get local random key
          const decryptedBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            fallbackKey,
            ciphertext
          );
          return new TextDecoder().decode(decryptedBuffer);
        } catch {
          // Both failed
          throw new Error("DECRYPTION_FAILED: [ALL_KEYS_EXHAUSTED]");
        }
      }
      throw primaryError;
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    // Return original if it wasn't encrypted or if decryption fails
    return encryptedBase64;
  }
}

/**
 * Helper to check if a string is likely encrypted
 */
export function isEncrypted(text: string): boolean {
  // Simple heuristic: if it looks like base64 and is long enough for IV
  // We can also prefix with a marker
  return text.startsWith("v1:");
}

/**
 * Enhanced Encrypt with version prefix
 */
export async function encryptNote(text: string, userId?: string): Promise<string> {
  if (!text) return text;
  const encrypted = await encrypt(text, userId);
  return `v1:${encrypted}`;
}

/**
 * Enhanced Decrypt with version check
 */
export async function decryptNote(text: string, userId?: string): Promise<string> {
  if (text.startsWith("v1:")) {
    return await decrypt(text.substring(3), userId);
  }
  return text; // Return plain text if not encrypted
}

/**
 * Exports the current vault key as a JSON string
 */
export async function exportVaultKey(): Promise<string> {
  const key = await getVaultKey();
  const jwk = await window.crypto.subtle.exportKey("jwk", key);
  return JSON.stringify(jwk);
}

/**
 * Imports a vault key from a JSON string
 */
export async function importVaultKey(jwkString: string): Promise<void> {
  try {
    const jwk = JSON.parse(jwkString);
    await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    // Test the key?
    await set(VAULT_KEY_NAME, jwk);
    // Reload the page or state might be needed, but for now we just update the storage
  } catch (error) {
    console.error("Failed to import key:", error);
    throw new Error("INVALID_KEY_FORMAT: [IMPORT_ABORTED]");
  }
}

/**
 * Resets the local vault (generates a new key)
 * Only affects guest users or local storage fallback.
 */
export async function resetVault(): Promise<void> {
  const newKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const jwk = await window.crypto.subtle.exportKey("jwk", newKey);
  await set(VAULT_KEY_NAME, jwk);
}
