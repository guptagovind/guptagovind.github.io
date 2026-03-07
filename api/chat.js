/**
 * Vercel serverless API route for the portfolio chat widget.
 * Receives chat messages and calls OpenAI Chat Completions API.
 * OPENAI_API_KEY must be set in Vercel Project Settings > Environment Variables.
 */

import { PROFILE_CONTEXT } from './profile-context.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body || {};

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message required' });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ error: 'API not configured' });
  }

  try {
    // Build messages: system prompt + conversation history + new user message
    const messages = [
      { role: 'system', content: PROFILE_CONTEXT },
      ...history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('OpenAI API error:', response.status, errBody);
      return res.status(502).json({
        error: 'Failed to get response from AI',
        details: response.status === 401 ? 'Invalid API key' : undefined,
      });
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content?.trim();

    if (!assistantMessage) {
      return res.status(502).json({ error: 'Empty response from AI' });
    }

    return res.status(200).json({ reply: assistantMessage });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
