#!/bin/bash

# Test script for the Framer-Pipedrive webhook using curl
# Update this URL with your deployed Vercel URL
WEBHOOK_URL="https://mech-henna.vercel.app/api/webhook/pipedrive"

# Use the same secret as in your environment
WEBHOOK_SECRET="38485ae667bd1ddf138e9f186bef38ae8012e9d1909b0c975a79e01491058803"

# Test payload
PAYLOAD='{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "propertySize": "120",
  "propertyType": "Apartment"
}'

# Generate submission ID and signature
SUBMISSION_ID="test-submission-$(date +%s)"
SIGNATURE=$(echo -n "$PAYLOAD$SUBMISSION_ID" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | cut -d' ' -f2)

echo "Testing webhook at: $WEBHOOK_URL"
echo "Submission ID: $SUBMISSION_ID"
echo "Signature: sha256=$SIGNATURE"
echo ""

# Make the request
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Framer-Signature: sha256=$SIGNATURE" \
  -H "Framer-Webhook-Submission-Id: $SUBMISSION_ID" \
  -d "$PAYLOAD" \
  -v
