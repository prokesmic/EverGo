import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import env from "@/lib/env.validated"

const TOKEN_PURPOSE = "password-reset"
const DEFAULT_EXPIRY_SECONDS = 60 * 60 // 1 hour

type PasswordResetPayload = {
  purpose: typeof TOKEN_PURPOSE
  email: string
  fp: string
  iat: number
  exp: number
}

function toBase64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url")
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8")
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", env.nextAuthSecret).update(payloadB64).digest("base64url")
}

function fingerprintPasswordHash(passwordHash: string | null): string {
  return createHash("sha256").update(passwordHash ?? "NO_PASSWORD").digest("base64url")
}

export function issuePasswordResetToken(email: string, passwordHash: string | null, ttlSeconds = DEFAULT_EXPIRY_SECONDS): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: PasswordResetPayload = {
    purpose: TOKEN_PURPOSE,
    email: email.toLowerCase().trim(),
    fp: fingerprintPasswordHash(passwordHash),
    iat: now,
    exp: now + ttlSeconds,
  }

  const payloadB64 = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(payloadB64)
  return `${payloadB64}.${signature}`
}

export function verifyPasswordResetToken(token: string): PasswordResetPayload | null {
  const [payloadB64, signature] = token.split(".")
  if (!payloadB64 || !signature) return null

  const expectedSignature = signPayload(payloadB64)
  const sigBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (sigBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null

  try {
    const parsed = JSON.parse(fromBase64Url(payloadB64)) as Partial<PasswordResetPayload>
    if (
      parsed.purpose !== TOKEN_PURPOSE ||
      !parsed.email ||
      !parsed.fp ||
      typeof parsed.exp !== "number"
    ) {
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    if (parsed.exp <= now) return null

    return {
      purpose: TOKEN_PURPOSE,
      email: parsed.email,
      fp: parsed.fp,
      iat: parsed.iat ?? now,
      exp: parsed.exp,
    }
  } catch {
    return null
  }
}

export function isPasswordResetTokenFreshForUser(tokenPayload: PasswordResetPayload, passwordHash: string | null): boolean {
  return tokenPayload.fp === fingerprintPasswordHash(passwordHash)
}

export function getPasswordResetUrl(token: string): string {
  const baseUrl = env.appUrl.replace(/\/$/, "")
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`
}
