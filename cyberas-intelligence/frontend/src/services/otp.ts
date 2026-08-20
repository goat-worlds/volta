interface OTPRecord {
  code: string
  email: string
  expiresAt: number
  attempts: number
}

const otpStore = new Map<string, OTPRecord>()
const OTP_VALIDITY = 10 * 60 * 1000 // 10 minutes
const MAX_ATTEMPTS = 5

export function generateOTP(email: string): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString()

  otpStore.set(email, {
    code,
    email,
    expiresAt: Date.now() + OTP_VALIDITY,
    attempts: 0,
  })

  console.log(`[OTP] Code sent to ${email}: ${code} (valid for 10 min)`)
  return code
}

export function verifyOTP(email: string, code: string): boolean {
  const record = otpStore.get(email)

  if (!record) {
    console.log(`[OTP] No code found for ${email}`)
    return false
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email)
    console.log(`[OTP] Code expired for ${email}`)
    return false
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email)
    console.log(`[OTP] Max attempts exceeded for ${email}`)
    return false
  }

  record.attempts++

  if (record.code === code) {
    otpStore.delete(email)
    console.log(`[OTP] Code verified successfully for ${email}`)
    return true
  }

  console.log(`[OTP] Wrong code for ${email} (attempt ${record.attempts}/${MAX_ATTEMPTS})`)
  return false
}

export function clearOTP(email: string): void {
  otpStore.delete(email)
}
