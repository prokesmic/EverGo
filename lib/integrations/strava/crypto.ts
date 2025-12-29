/**
 * Strava Token Encryption/Decryption
 * Uses AES-256-GCM for encrypting refresh tokens at rest
 */
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getEncryptionKey(): Buffer {
  const key = process.env.STRAVA_TOKEN_ENCRYPTION_KEY
  if (!key) {
    throw new Error("STRAVA_TOKEN_ENCRYPTION_KEY environment variable is not set")
  }
  // Derive a 32-byte key from the secret using SHA-256
  return crypto.createHash("sha256").update(key).digest()
}

export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  let encrypted = cipher.update(plaintext, "utf8", "base64")
  encrypted += cipher.final("base64")

  const authTag = cipher.getAuthTag()

  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`
}

export function decryptToken(encryptedData: string): string {
  const key = getEncryptionKey()
  const parts = encryptedData.split(":")

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format")
  }

  const [ivB64, authTagB64, ciphertext] = parts
  const iv = Buffer.from(ivB64, "base64")
  const authTag = Buffer.from(authTagB64, "base64")

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, "base64", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
