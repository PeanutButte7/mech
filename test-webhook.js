// Test script for the Framer-Pipedrive webhook
// Run this locally to test your webhook before deploying

const crypto = require('crypto');

const WEBHOOK_URL = 'https://mech-henna.vercel.app/api/webhook/pipedrive'; // Update with your deployed URL
const WEBHOOK_SECRET = '38485ae667bd1ddf138e9f186bef38ae8012e9d1909b0c975a79e01491058803'; // Use the same secret as in your .env.local

// Test payload matching your Framer form
const testPayload = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  propertySize: '120',
  propertyType: 'Apartment'
};

function generateSignature(body, submissionId) {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body + submissionId)
    .digest('hex');
}

async function testWebhook() {
  const submissionId = 'test-submission-' + Date.now();
  const body = JSON.stringify(testPayload);
  const signature = `sha256=${generateSignature(body, submissionId)}`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Framer-Signature': signature,
        'Framer-Webhook-Submission-Id': submissionId,
      },
      body: body,
    });

    const result = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', result);

    if (response.ok && result.success) {
      console.log('✅ Webhook test successful!');
      console.log(`Person ID: ${result.personId}`);
      console.log(`Deal ID: ${result.dealId}`);
    } else {
      console.log('❌ Webhook test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWebhook();
