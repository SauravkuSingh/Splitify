import Groq from 'groq-sdk';
import cloudinary from '../config/cloudinary.js';
import ErrorResponse from '../utils/errorResponse.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Helper: Buffer ko Cloudinary pe upload karo ──────────────
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'splitify/receipts',  // Cloudinary mein folder
        public_id: `receipt_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' },        // Auto quality optimization
          { fetch_format: 'auto' },   // Best format auto select
        ],
      },
      (error, result) => {
        if (error) reject(new ErrorResponse('Cloudinary upload failed', 500));
        else resolve(result);
      }
    );
    uploadStream.end(buffer); // Buffer stream mein daalo
  });
};

// ─── Helper: Groq Vision se receipt scan karo ─────────────────
const scanReceiptWithGroq = async (imageUrl) => {
  const prompt = `You are a receipt scanner. Analyze this receipt image and extract the following information.

IMPORTANT: Respond ONLY with a valid JSON object. No explanation, no markdown, no code blocks. Just pure JSON.

Extract:
{
  "success": true,
  "storeName": "store/restaurant name or null",
  "date": "date in YYYY-MM-DD format or null", 
  "items": [
    { "name": "item name", "price": numeric_price, "quantity": 1 }
  ],
  "subtotal": numeric_amount_or_null,
  "tax": numeric_amount_or_null,
  "total": numeric_total_amount,
  "currency": "INR or USD or detected currency"
}

If you cannot read the receipt clearly, respond with:
{
  "success": false,
  "error": "reason why receipt cannot be read"
}

Rules:
- All prices must be numbers, not strings
- Remove currency symbols from prices
- If an item has no clear price, skip it
- total is the final amount paid`;

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct', // Groq ka vision model
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ],
      },
    ],
    max_tokens: 1000,
    temperature: 0.1, // Low temperature = consistent, structured output
  });

  const rawText = response.choices[0].message.content.trim();
  
  // JSON parse karo — extra text remove karke
  let jsonText = rawText;
  
  // Agar markdown code block mein hai toh extract karo
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }
  
  // Parse karo
  const parsed = JSON.parse(jsonText);
  return parsed;
};

// ─── @route   POST /api/ai/scan-receipt ───────────────────────
// ─── @access  Private ─────────────────────────────────────────
export const scanReceipt = async (req, res) => {
  // Multer ne file process ki hai — req.file mein hogi
  if (!req.file) {
    throw new ErrorResponse('Please upload a receipt image', 400);
  }

  // Step 1: Cloudinary pe upload karo
  const cloudinaryResult = await uploadToCloudinary(
    req.file.buffer,
    req.file.originalname
  );

  const imageUrl = cloudinaryResult.secure_url;

  // Step 2: Groq Vision se scan karo
  let receiptData;
  try {
    receiptData = await scanReceiptWithGroq(imageUrl);
  } catch (parseError) {
    // JSON parse fail hua — model ne unexpected response diya
    return res.status(200).json({
      success: true,
      scanned: false,
      imageUrl,
      message: 'Receipt uploaded but could not be parsed. Please enter details manually.',
      rawResponse: null,
    });
  }

  // Step 3: Response bhejo
  if (!receiptData.success) {
    return res.status(200).json({
      success: true,
      scanned: false,
      imageUrl,
      message: receiptData.error || 'Could not read receipt clearly',
    });
  }

  res.status(200).json({
    success: true,
    scanned: true,
    imageUrl,          // Frontend expense mein save karega
    receipt: receiptData,
  });
};

// ─── @route   POST /api/ai/upload-image ───────────────────────
// ─── @access  Private ─────────────────────────────────────────
// Sirf image upload karo bina AI scan ke (expense receipt attach karne ke liye)
export const uploadImage = async (req, res) => {
  if (!req.file) {
    throw new ErrorResponse('Please upload an image', 400);
  }

  const result = await uploadToCloudinary(
    req.file.buffer,
    req.file.originalname
  );

  res.status(200).json({
    success: true,
    imageUrl: result.secure_url,
    publicId: result.public_id,
  });
};