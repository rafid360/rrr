const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');
const { requireAuth } = require('../middleware/auth');

const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 });

router.post('/extract-customers', requireAuth, limiter, async (req, res) => {
  const { text: inputText } = req.body || {};
  if (!inputText || typeof inputText !== 'string') {
    return res.status(400).json({ error: 'text is required' });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Read the text and extract and provide as serial, name, phone number, address (structured), email.\n\nText:\n${inputText}`;

    console.log('[OpenAI] extract-customers prompt snippet:', prompt.slice(0, 160).replace(/\n/g, ' '), '...');
    console.log('[OpenAI] input length:', inputText.length);

    // Use responses API to get structured JSON
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-nano',
      input: prompt,
      response_format: { type: 'json_schema', json_schema: {
        name: 'customer_extraction',
        schema: {
          type: 'object',
          properties: {
            customers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  serial: { type: 'string' },
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  email: { type: 'string' },
                  address: {
                    type: 'object',
                    properties: {
                      line1: { type: 'string' },
                      line2: { type: 'string' },
                      city: { type: 'string' },
                      state: { type: 'string' },
                      postal_code: { type: 'string' },
                      country: { type: 'string' }
                    },
                    additionalProperties: true
                  }
                },
                additionalProperties: true
              }
            }
          },
          additionalProperties: false
        }
      } },
    });

    let parsed = null;
    const responseText = response?.output_text || response?.content?.[0]?.text || '';
    try { parsed = JSON.parse(responseText); } catch {}
    if (!parsed && response?.output_parsed) {
      parsed = response.output_parsed;
    }

    if (!parsed || !Array.isArray(parsed.customers)) {
      return res.status(200).json({ customers: [] });
    }

    return res.json({ customers: parsed.customers });
  } catch (err) {
    console.error('OpenAI error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to extract customers' });
  }
});

module.exports = router;