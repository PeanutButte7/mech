export default async function handler(req, res) {
  // CORS handling
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this to your Framer domain for better security
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, size, email, phone } = req.body;
  
  if (!name) {
      return res.status(400).json({ error: 'Name is required' });
  }

  const apiToken = process.env.PIPEDRIVE_API_TOKEN;
  const companyDomain = process.env.PIPEDRIVE_COMPANY_DOMAIN;

  if (!apiToken || !companyDomain) {
      console.error('Missing Pipedrive configuration');
      return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // 1. Create (or find) a Person in Pipedrive
    // Note: In a real app, you might want to search first to avoid duplicates.
    // For simplicity, we are just creating a new person here.
    const personResponse = await fetch(`https://${companyDomain}.pipedrive.com/api/v1/persons?api_token=${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          name: name,
          email: email ? [email] : undefined,
          phone: phone ? [phone] : undefined
      })
    });
    
    const personData = await personResponse.json();
    
    if (!personData.success) {
        throw new Error(`Pipedrive Person Error: ${personData.error}`);
    }

    const personId = personData.data.id;

    // 2. Create a Deal linked to that Person
    const dealResponse = await fetch(`https://${companyDomain}.pipedrive.com/api/v1/deals?api_token=${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${name}'s Property Estimate`,
        person_id: personId,
        value: size ? parseInt(size) * 1000 : 0, // Example logic
        // You can add a custom field for "property size" if you find the key in Pipedrive
        // "abcdef...": size 
      })
    });
    
    const dealData = await dealResponse.json();

    if (!dealData.success) {
         throw new Error(`Pipedrive Deal Error: ${dealData.error}`);
    }

    res.status(200).json({ success: true, dealId: dealData.data.id });
  } catch (error) {
    console.error('Integration Error:', error);
    res.status(500).json({ error: 'Failed to create deal', details: error.message });
  }
}
