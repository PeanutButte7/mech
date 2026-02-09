import crypto from 'crypto';

export default function handler(req, res) {
  const { body, headers } = req;
  const signature = headers['framer-signature'];
  const submissionId = headers['framer-webhook-submission-id'];
  const webhookSecret = process.env.FRAMER_WEBHOOK_SECRET;
  
  // Recreate the signature verification logic
  const bodyString = JSON.stringify(body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyString + submissionId)
    .digest('hex');
  
  const debugInfo = {
    receivedSignature: signature,
    expectedSignature: `sha256=${expectedSignature}`,
    submissionId,
    bodyString,
    bodyLength: bodyString.length,
    webhookSecretLength: webhookSecret?.length,
    signatureMatch: `sha256=${expectedSignature}` === signature,
    rawExpected: expectedSignature,
    rawReceived: signature?.replace('sha256=', '')
  };

  res.status(200).json(debugInfo);
}
