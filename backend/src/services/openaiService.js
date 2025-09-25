import OpenAI from 'openai';
import { env } from '../config/env.js';
import { log } from '../utils/logger.js';

const openai = new OpenAI({ apiKey: env.openAiApiKey });

const DEFAULT_MODEL = 'gpt-4o-mini';

// Validate messages schema [{ role: 'user'|'assistant'|'system', content: string }]
function validateMessages(messages) {
  if (!Array.isArray(messages)) return false;
  return messages.every(m => m && typeof m.role === 'string' && typeof m.content === 'string');
}

export async function getChatCompletion({ messages, model = DEFAULT_MODEL, stream = false, temperature = 0.7, maxTokens }) {
  if (!validateMessages(messages)) {
    const err = new Error('Invalid messages format. Expected array of { role, content }');
    err.status = 400; err.isOperational = true; throw err;
  }

  try {
    if (stream) {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      });
      return response; // AsyncIterable for streaming
    }

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const text = response.choices?.[0]?.message?.content ?? '';
    return { text, raw: response };
  } catch (error) {
    log.error('OpenAI API error', error?.response?.data || error.message);
    const err = new Error(error?.response?.data?.error?.message || 'OpenAI API request failed');
    err.status = error?.response?.status || 502;
    err.isOperational = true;
    throw err;
  }
}

export default { getChatCompletion };


