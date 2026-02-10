#!/bin/bash

# Default to local if no URL provided
URL="${1:-http://localhost:3000/api/submit-lead}"

echo "Testing Pipedrive Integration at: $URL"

curl -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Integration Test User",
    "size": "150",
    "email": "test_integration@example.com",
    "phone": "555-0199"
  }'

echo -e "\n\n(If you see a success message above, the integration is working)"
