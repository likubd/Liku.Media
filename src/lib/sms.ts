import crypto from "crypto";

export interface SmsCalcResult {
  isUnicode: boolean;
  charCount: number;
  parts: number;
  charsPerPart: number;
  remainingInPart: number;
}

/**
 * Calculates SMS parts, character count, and Unicode status.
 * GSM (Standard ASCII): 1st part = 160 chars, subsequent = 153 chars per part.
 * Unicode (Bengali/UTF-8): 1st part = 70 chars, subsequent = 67 chars per part.
 */
export function calculateSmsUnits(text: string): SmsCalcResult {
  if (!text) {
    return {
      isUnicode: false,
      charCount: 0,
      parts: 0,
      charsPerPart: 160,
      remainingInPart: 160,
    };
  }

  // Check if text contains non-GSM 03.38 characters (e.g. Bengali, Emoji, UTF-8 symbols)
  // GSM 03.38 standard character set regex
  const gsmRegex = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇ\u00D8\u00F8\u00C5\u00E5Δ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§àäöñüà]*$/;
  const isUnicode = !gsmRegex.test(text);

  const charCount = Array.from(text).length; // Proper unicode character counting

  if (isUnicode) {
    if (charCount <= 70) {
      return {
        isUnicode: true,
        charCount,
        parts: 1,
        charsPerPart: 70,
        remainingInPart: 70 - charCount,
      };
    } else {
      const parts = Math.ceil(charCount / 67);
      const remainder = charCount % 67;
      return {
        isUnicode: true,
        charCount,
        parts,
        charsPerPart: 67,
        remainingInPart: remainder === 0 ? 0 : 67 - remainder,
      };
    }
  } else {
    if (charCount <= 160) {
      return {
        isUnicode: false,
        charCount,
        parts: 1,
        charsPerPart: 160,
        remainingInPart: 160 - charCount,
      };
    } else {
      const parts = Math.ceil(charCount / 153);
      const remainder = charCount % 153;
      return {
        isUnicode: false,
        charCount,
        parts,
        charsPerPart: 153,
        remainingInPart: remainder === 0 ? 0 : 153 - remainder,
      };
    }
  }
}

/**
 * Normalizes phone numbers to standard 880 format.
 * E.g., "01800000000" -> "8801800000000", "+88018..." -> "88018..."
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("880")) {
    return cleaned;
  }
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    return `88${cleaned}`;
  }
  if (cleaned.startsWith("1") && cleaned.length === 10) {
    return `880${cleaned}`;
  }
  return cleaned;
}

/**
 * Normalizes comma-separated multiple phone numbers.
 */
export function normalizePhoneNumbers(phones: string): string[] {
  if (!phones) return [];
  return phones
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map(normalizePhoneNumber);
}

/**
 * Generates a secure API Key for client websites.
 * Example format: sk_live_7f8a9b0c1d2e...
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(20).toString("hex");
  return `gw_live_${randomBytes}`;
}
