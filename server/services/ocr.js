import OpenAI from 'openai';
import sharp from 'sharp';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Convert image to JPEG (handles HEIC, PNG, WebP, etc.)
 * Resize to max 2048px on longest side to stay within GPT-4 Vision limits
 */
export async function normalizeImage(buffer, originalMime) {
  let image = sharp(buffer);

  // HEIC/HEIF conversion
  if (originalMime?.includes('heic') || originalMime?.includes('heif')) {
    image = image.toFormat('jpeg');
  }

  const metadata = await image.metadata();
  const maxDim = 2048;

  if (metadata.width > maxDim || metadata.height > maxDim) {
    image = image.resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });
  }

  return image.jpeg({ quality: 90 }).toBuffer();
}

/**
 * Extract structured order data from a sales order form image using GPT-4 Vision.
 * Falls back to mock/demo data when OPENAI_API_KEY is not set.
 */
export async function extractOrderFromImage(imageBuffer) {
  // Convert to base64
  const base64 = imageBuffer.toString('base64');

  if (!openai) {
    console.log('[OCR] No OPENAI_API_KEY set — returning mock extraction for demo');
    return getMockExtraction();
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert at reading furniture store sales order forms. Extract every field you can find and return ONLY valid JSON. No markdown, no explanation.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this furniture store sales order form and extract the following fields. Return ONLY a JSON object with this exact shape — do not wrap it in markdown code blocks:

{
  "storeName": "exact store name from header, e.g. 'Ashley Shakopee' or 'Furniture Mart Fridley'",
  "storeAddress": "full store address",
  "storePhone": "store phone number",
  "storeOrderNumber": "the Sales Order #",
  "orderDate": "MM/DD/YY or ISO date",
  "customerFirstName": "first name only",
  "customerLastName": "last name only",
  "customerAddress": "full street, city, state, zip on one line",
  "customerPhone": "customer phone/cell",
  "customerEmail": "customer email",
  "salespersonName": "name of salesperson on the form",
  "terms": "e.g. Cash / Credit",
  "shipVia": "shipping method code",
  "instructions": "any delivery instructions or notes",
  "items": [
    {
      "sku": "product SKU / model number",
      "name": "full product description name",
      "quantity": 1,
      "price": 749.99
    }
  ],
  "merchandiseTotal": 1969.96,
  "tax": 160.04,
  "total": 2130.00,
  "pickupAddress": "full pickup/distribution center address if shown"
}

Rules:
- If a field is missing or unreadable, use null or an empty string — never omit the key.
- For prices, strip the $ sign and commas, return as numbers.
- For the customer's name, split into firstName and lastName intelligently.
- For items, extract every line item in the table. Include the SKU (the alphanumeric code like ASH4360438) and the full product name.
- The pickup address is often a separate box labeled 'PICKUP ADDRESS' or 'Distribution Center'.
- Return ONLY the raw JSON object. No \`\`\`json wrapper.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail: 'high',
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.1,
  });

  const raw = response.choices[0].message.content.trim();

  // Strip markdown code fences if the model wrapped it anyway
  const jsonText = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

  try {
    const parsed = JSON.parse(jsonText);
    return { success: true, data: parsed, source: 'gpt-4o' };
  } catch (err) {
    console.error('[OCR] JSON parse failed:', err.message, '\nRaw:', raw);
    return { success: false, error: 'Failed to parse AI response', raw };
  }
}

function getMockExtraction() {
  return {
    success: true,
    data: {
      storeName: 'Ashley Shakopee',
      storeAddress: '4250 12th Ave East, Shakopee, MN 55379',
      storePhone: '952 486-4415',
      storeOrderNumber: '543276038',
      orderDate: '06/08/26',
      customerFirstName: 'Debra',
      customerLastName: 'Hollenbach',
      customerAddress: '1968 Lincoln Lane, Chanhassen, MN 55317',
      customerPhone: '614 226-5775',
      customerEmail: 'drh492@aol.com',
      salespersonName: 'Linda Kreft-54',
      terms: 'Cash / Credit',
      shipVia: 'P',
      instructions: '06/08/26 12:43PM',
      items: [
        { sku: 'ASH4360438', name: 'Panola Parchment Sofa PE', quantity: 1, price: 749.99 },
        { sku: 'ASH4360423', name: 'Panola Parchment Chr Hlf PE', quantity: 1, price: 649.99 },
        { sku: 'ASH4360414', name: 'Panola Parchment Otto PE', quantity: 1, price: 319.99 },
        { sku: 'GPRNOPET2', name: 'Guardian No Pet $1000-$1999.99', quantity: 1, price: 249.99 },
      ],
      merchandiseTotal: 1969.96,
      tax: 160.04,
      total: 2130.0,
      pickupAddress: 'Fridley Distribution Center, 5353 East River Road, Fridley, MN 55421',
    },
    source: 'mock',
  };
}
