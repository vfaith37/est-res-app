import * as Crypto from "expo-crypto";
import forge from "node-forge";
import "react-native-get-random-values";
import { ENCRYPTION_CONFIG } from "@/config/encryption.config";

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert ArrayBuffer/Uint8Array to Base64 string
 */
function bufToB64(buf: ArrayBuffer | Uint8Array): string {
  const uint8Array = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

/**
 * Base64 encode Unicode string safely
 */
function b64EncodeUnicode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Generate cryptographically secure random bytes
 */
function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    console.warn("âš ï¸ Using Math.random for random bytes");
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  return array;
}

// ==================== AES-GCM ENCRYPTION ====================

/**
 * AES-GCM encryption using node-forge
 * This matches the Web Crypto API implementation
 */
function aesGcmEncrypt(
  plaintext: string,
  key: Uint8Array,
  iv: Uint8Array
): string {
  try {
    // Convert Uint8Array to forge bytes
    let keyBytes = "";
    for (let i = 0; i < key.length; i++) {
      keyBytes += String.fromCharCode(key[i]);
    }

    let ivBytes = "";
    for (let i = 0; i < iv.length; i++) {
      ivBytes += String.fromCharCode(iv[i]);
    }

    // Create AES-GCM cipher
    const cipher = forge.cipher.createCipher("AES-GCM", keyBytes);
    cipher.start({
      iv: ivBytes,
      tagLength: 128, // 128-bit authentication tag
    });

    cipher.update(forge.util.createBuffer(plaintext, "utf8"));
    cipher.finish();

    // Get encrypted data and authentication tag
    const encrypted = cipher.output.getBytes();
    const tag = cipher.mode.tag.getBytes();

    // Combine encrypted data with tag (GCM format)
    const combined = encrypted + tag;

    // Convert to base64
    return forge.util.encode64(combined);
  } catch (error) {
    console.error("AES-GCM encryption error:", error);
    throw new Error(`AES-GCM encryption failed: ${error}`);
  }
}

// ==================== RSA ENCRYPTION ====================

/**
 * RSA-OAEP encryption using node-forge
 */
function rsaOaepEncrypt(data: Uint8Array, publicKeyPem: string): string {
  try {
    // Clean up the PEM string
    let cleanPem = publicKeyPem.trim();
    cleanPem = cleanPem.replace(/\r\n/g, "\n");

    // Parse the public key using node-forge
    const publicKey = forge.pki.publicKeyFromPem(cleanPem);

    // Convert Uint8Array to binary string
    let binaryString = "";
    for (let i = 0; i < data.length; i++) {
      binaryString += String.fromCharCode(data[i]);
    }

    // Encrypt using RSA-OAEP with SHA-1
    const encrypted = publicKey.encrypt(binaryString, "RSA-OAEP", {
      md: forge.md.sha1.create(),
      mgf1: {
        md: forge.md.sha1.create(),
      },
    });

    // Convert encrypted bytes to base64
    return forge.util.encode64(encrypted);
  } catch (error) {
    console.error("RSA encryption error:", error);
    throw new Error(`RSA encryption failed: ${error}`);
  }
}

// ==================== HYBRID ENCRYPTION ====================

/**
 * Hybrid encryption using AES-GCM + RSA-OAEP
 * This exactly matches the Web Crypto API implementation
 */
async function hybridEncrypt(data: any): Promise<{
  encryptedAesKey: string;
  iv: string;
  encryptedData: string;
}> {
  try {
    console.log("ðŸ” Starting hybrid encryption...");

    // 1. Generate random AES key (256-bit = 32 bytes)
    const aesKey = getRandomBytes(32);
    console.log("âœ“ Generated AES-256 key");

    // 2. Generate random IV (12 bytes for GCM)
    const iv = getRandomBytes(12);
    console.log("âœ“ Generated IV (12 bytes)");

    // 3. Encrypt data with AES-GCM
    const dataString = JSON.stringify(data);
    const encryptedData = aesGcmEncrypt(dataString, aesKey, iv);
    console.log("âœ“ Data encrypted with AES-GCM");

    // 4. Encrypt AES key with RSA-OAEP
    const encryptedAesKey = rsaOaepEncrypt(
      aesKey,
      ENCRYPTION_CONFIG.PUBLIC_KEY_PEM
    );
    console.log("âœ“ AES key encrypted with RSA-OAEP");

    return {
      encryptedAesKey,
      iv: bufToB64(iv),
      encryptedData,
    };
  } catch (error) {
    console.error("âŒ Hybrid encryption error:", error);
    throw error;
  }
}

// ==================== MAIN ENCRYPTION FUNCTION ====================

/**
 * Encrypt payload and generate hash for API requests
 */
export async function encryptPayload(data: any): Promise<{
  encryptedPayload: string;
  hash: string;
}> {
  try {
    console.log("ðŸ”’ Encrypting payload...");

    // Perform hybrid encryption
    const encryptedPayload = await hybridEncrypt(data);

    // Serialize final payload as JSON string
    const finalPayload = JSON.stringify({
      encryptedAesKey: encryptedPayload.encryptedAesKey,
      iv: encryptedPayload.iv,
      encryptedData: encryptedPayload.encryptedData,
    });

    console.log("ðŸ“¦ Encrypted payload length:", finalPayload.length);

    // Create hash for payload integrity verification
    const inputToHash =
      b64EncodeUnicode(finalPayload) + ENCRYPTION_CONFIG.SECRET;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      inputToHash,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    console.log("ðŸ”‘ Generated hash:", hash.substring(0, 30) + "...");
    console.log(hash, finalPayload);
    console.log("âœ… Encryption complete!");

    return {
      encryptedPayload: finalPayload,
      hash,
    };
  } catch (error) {
    console.error("âŒ Encryption failed:", error);
    throw new Error(`Encryption failed: ${error}`);
  }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if HTTP method requires encryption (POST/PUT have encrypted body)
 */
export function requiresEncryption(method: string): boolean {
  const normalizedMethod = method.toUpperCase();
  return normalizedMethod === "POST" || normalizedMethod === "PUT";
}

/**
 * Check if HTTP method requires hash header (all methods need hash)
 */
export function requiresHash(method: string): boolean {
  // All methods require the hash header for validation
  return true;
}

/**
 * Generate hash for GET requests (secret only, no payload)
 */
export async function generateSecretHash(): Promise<string> {
  try {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      ENCRYPTION_CONFIG.SECRET,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    if (__DEV__) {
      console.log("ðŸ”‘ Generated secret-only hash for GET request");
    }

    return hash;
  } catch (error) {
    console.error("âŒ Failed to generate secret hash:", error);
    throw new Error(`Hash generation failed: ${error}`);
  }
}

/**
 * Test encryption functionality
 */
export async function testEncryption(testData?: any): Promise<boolean> {
  const sampleData = testData || {
    email: "test@example.com",
    password: "test123456",
    timestamp: new Date().toISOString(),
  };

  try {
    console.log("");
    console.log("ðŸ§ª ========== ENCRYPTION TEST START ==========");
    console.log("ðŸ“¥ Test data:", sampleData);

    const { encryptedPayload, hash } = await encryptPayload(sampleData);

    console.log("");
    console.log("ðŸ“¤ Test Results:");
    console.log("   Encrypted payload length:", encryptedPayload.length);
    console.log("   Hash length:", hash.length);
    console.log(
      "   Sample encrypted payload:",
      encryptedPayload.substring(0, 100) + "..."
    );
    console.log("   Sample hash:", hash.substring(0, 50) + "...");
    console.log("âœ… ========== ENCRYPTION TEST PASSED ==========");
    console.log("");

    return true;
  } catch (error) {
    console.error("");
    console.error("âŒ ========== ENCRYPTION TEST FAILED ==========");
    console.error("Error:", error);
    console.error("");
    return false;
  }
}

