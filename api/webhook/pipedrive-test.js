import crypto from 'crypto';

// Pipedrive API configuration
const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN;
const PIPEDRIVE_COMPANY_DOMAIN = process.env.PIPEDRIVE_COMPANY_DOMAIN;

// Custom field IDs (you'll need to update these after creating fields in Pipedrive)
const PROPERTY_SIZE_FIELD_ID = process.env.PROPERTY_SIZE_FIELD_ID || null;
const PROPERTY_TYPE_FIELD_ID = process.env.PROPERTY_TYPE_FIELD_ID || null;

/**
 * Make API call to Pipedrive
 */
async function callPipedriveAPI(endpoint, method = 'GET', data = null) {
  const url = `https://${PIPEDRIVE_COMPANY_DOMAIN}.pipedrive.com/api/v1/${endpoint}?api_token=${PIPEDRIVE_API_TOKEN}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${responseData.error || 'Unknown error'}`);
    }

    return responseData;
  } catch (error) {
    console.error('Pipedrive API call failed:', error);
    throw error;
  }
}

/**
 * Create or find a person in Pipedrive
 */
async function createPerson(name, email = null, phone = null) {
  const personData = {
    name,
    ...(email && { email }),
    ...(phone && { phone }),
  };

  try {
    const response = await callPipedriveAPI('persons', 'POST', personData);
    return response.data;
  } catch (error) {
    console.error('Failed to create person:', error);
    throw error;
  }
}

/**
 * Create a deal in Pipedrive
 */
async function createDeal(personId, propertySize, propertyType = null) {
  const dealData = {
    title: `Property Valuation Request - ${propertySize}m²`,
    person_id: personId,
    stage_id: process.env.DEFAULT_DEAL_STAGE_ID || 1, // Update with your default stage ID
  };

  // Add custom fields if they exist
  if (PROPERTY_SIZE_FIELD_ID && propertySize) {
    dealData[PROPERTY_SIZE_FIELD_ID] = propertySize;
  }

  if (PROPERTY_TYPE_FIELD_ID && propertyType) {
    dealData[PROPERTY_TYPE_FIELD_ID] = propertyType;
  }

  try {
    const response = await callPipedriveAPI('deals', 'POST', dealData);
    return response.data;
  } catch (error) {
    console.error('Failed to create deal:', error);
    throw error;
  }
}

/**
 * Main webhook handler (TEST VERSION - NO SIGNATURE VERIFICATION)
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract form data
    const formData = req.body;
    const { name, email, phone, propertySize, propertyType } = formData;

    // Validate required fields
    if (!name || !propertySize) {
      return res.status(400).json({ 
        error: 'Missing required fields: name and propertySize are required' 
      });
    }

    // Validate property size is a positive number
    const size = parseFloat(propertySize);
    if (isNaN(size) || size <= 0) {
      return res.status(400).json({ 
        error: 'Property size must be a positive number' 
      });
    }

    console.log(`Processing lead: ${name}, Property: ${size}m²`);

    // Create person in Pipedrive
    const person = await createPerson(name, email, phone);
    console.log(`Created person: ${person.id}`);

    // Create deal in Pipedrive
    const deal = await createDeal(person.id, size, propertyType);
    console.log(`Created deal: ${deal.id}`);

    // Return success response
    res.status(200).json({
      success: true,
      personId: person.id,
      dealId: deal.id,
      message: 'Lead successfully created in Pipedrive'
    });

  } catch (error) {
    console.error('Webhook processing failed:', error);
    
    // Return error response
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
