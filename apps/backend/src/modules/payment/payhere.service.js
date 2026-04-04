import crypto from 'crypto';

export function md5HexUpper(value) {
  return crypto.createHash('md5').update(String(value), 'utf8').digest('hex').toUpperCase();
}

export function formatAmount(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) {
    throw new Error('Invalid amount');
  }
  return num.toFixed(2);
}

// PayHere Checkout "hash" generation (client->PayHere)
// Reference: PayHere docs for MD5 signature. Verify with official docs for your PayHere API version.
export function generateCheckoutHash({ merchantId, merchantSecret, orderId, amount, currency }) {
  if (!merchantId || !merchantSecret) {
    throw new Error('Missing PayHere merchant credentials');
  }

  const amountFormatted = formatAmount(amount);
  const secretHash = md5HexUpper(merchantSecret);

  // Common PayHere formula: MD5(merchant_id + order_id + amount + currency + MD5(merchant_secret))
  const raw = `${merchantId}${orderId}${amountFormatted}${currency}${secretHash}`;
  return md5HexUpper(raw);
}

// PayHere server-to-server notify signature validation (PayHere->server)
// Common formula: MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))
export function validateNotifySignature({
  merchantId,
  merchantSecret,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  md5sig,
}) {
  if (!merchantSecret || !merchantId) return false;
  if (!md5sig) return false;

  const secretHash = md5HexUpper(merchantSecret);
  const raw = `${merchantId}${orderId}${formatAmount(payhereAmount)}${payhereCurrency}${statusCode}${secretHash}`;
  const expected = md5HexUpper(raw);

  return expected === String(md5sig).toUpperCase();
}
