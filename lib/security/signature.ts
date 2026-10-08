import crypto from "crypto";

export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString("hex")}`;
}

export function computeWebhookSignature(
  payloadString: string,
  secret: string,
  timestamp: string | number
): string {
  const signedPayload = `${timestamp}.${payloadString}`;
  return crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
}

export function verifyWebhookSignature(
  payloadString: string,
  headerSignature: string,
  secret: string,
  timestamp: string | number,
  toleranceSeconds: number = 300
): boolean {
  try {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const parsedTimestamp = typeof timestamp === "number" ? timestamp : parseInt(timestamp, 10);

    if (Math.abs(currentTimestamp - parsedTimestamp) > toleranceSeconds) {
      return false; // Signature expired
    }

    const expectedSignature = computeWebhookSignature(payloadString, secret, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(headerSignature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}
