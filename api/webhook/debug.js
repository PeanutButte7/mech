export default function handler(req, res) {
  const secrets = {
    hasApiToken: !!process.env.PIPEDRIVE_API_TOKEN,
    hasCompanyDomain: !!process.env.PIPEDRIVE_COMPANY_DOMAIN,
    hasWebhookSecret: !!process.env.FRAMER_WEBHOOK_SECRET,
    apiTokenLength: process.env.PIPEDRIVE_API_TOKEN?.length || 0,
    companyDomain: process.env.PIPEDRIVE_COMPANY_DOMAIN,
    webhookSecretLength: process.env.FRAMER_WEBHOOK_SECRET?.length || 0,
  };

  res.status(200).json(secrets);
}
