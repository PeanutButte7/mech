# Framer-Pipedrive Integration

A secure Vercel serverless function that connects Framer forms with Pipedrive CRM for real estate property valuation requests.

## Architecture

```
Framer Form → Webhook → Vercel Serverless Function → Pipedrive API → Response
```

## Setup Instructions

### 1. Pipedrive Configuration

1. **Get API Token:**
   - Log into Pipedrive
   - Go to Settings → Personal Preferences → API
   - Copy your API token

2. **Get Company Domain:**
   - Your domain is `yourcompany.pipedrive.com`
   - Copy just the `yourcompany` part

3. **Create Custom Fields:**
   - Go to Settings → Deal Fields → Add custom field
   - Create "Property Size (m²)" field (type: Number)
   - Create "Property Type" field (type: Single option)
   - Note the field IDs from the URL when editing each field

4. **Get Deal Stage ID:**
   - Go to your pipeline
   - Click on the stage where new leads should go
   - Note the stage ID from the URL

### 2. Vercel Deployment

1. **Clone and Deploy:**
   ```bash
   git clone <your-repo>
   cd framer-pipedrive-webhook
   npm install
   vercel --prod
   ```

2. **Set Environment Variables:**
   In Vercel dashboard, add these environment variables:
   - `PIPEDRIVE_API_TOKEN`: Your Pipedrive API token
   - `PIPEDRIVE_COMPANY_DOMAIN`: Your Pipedrive domain (without .pipedrive.com)
   - `FRAMER_WEBHOOK_SECRET`: 32+ character random string
   - `PROPERTY_SIZE_FIELD_ID`: The ID of your property size field
   - `PROPERTY_TYPE_FIELD_ID`: The ID of your property type field
   - `DEFAULT_DEAL_STAGE_ID`: Your default deal stage ID

3. **Get Your Webhook URL:**
   After deployment, your webhook URL will be:
   ```
   https://your-project.vercel.app/api/webhook/pipedrive
   ```

### 3. Framer Form Setup

1. **Create Form Elements:**
   - Name input (required)
   - Email input (optional)
   - Phone input (optional)
   - Property Size input (number, required)
   - Property Type dropdown (optional)
   - Submit button

2. **Configure Webhook:**
   - Select your form in Framer
   - Click "Add..." next to "Send To"
   - Select "Webhook"
   - Enter your Vercel webhook URL
   - Set the same webhook secret you used in Vercel

3. **Form Field Names:**
   Make sure your form fields use these exact names:
   - `name` (required)
   - `email` (optional)
   - `phone` (optional)
   - `propertySize` (required)
   - `propertyType` (optional)

## Security Features

- Webhook signature verification
- API tokens stored securely on backend
- Input validation and sanitization
- HTTPS-only communication
- Error handling and logging

## Testing

1. **Local Testing:**
   ```bash
   npm run dev
   ```

2. **Test Payload:**
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "propertySize": "120",
     "propertyType": "Apartment"
   }
   ```

## Monitoring

- Check Vercel Function Logs for errors
- Monitor Pipedrive for new leads
- Set up Vercel Analytics for usage metrics

## Error Handling

The function handles:
- Invalid webhook signatures
- Missing required fields
- Invalid property sizes
- Pipedrive API errors
- Network timeouts

## Support

For issues:
1. Check Vercel function logs
2. Verify Pipedrive credentials
3. Test webhook signature
4. Check form field names match exactly
