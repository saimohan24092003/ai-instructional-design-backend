import express from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateJwt } from '../middleware/auth.js';
import { getChatCompletion } from '../services/openaiService.js';

const router = express.Router();

// Rate limit for chat endpoint
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 requests/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/', authenticateJwt, chatLimiter, async (req, res, next) => {
  try {
    const { prompt, messages, stream = false, temperature, maxTokens, model } = req.body || {};

    let conversation = messages;
    if (!conversation && typeof prompt === 'string') {
      conversation = [{ role: 'user', content: prompt }];
    }

    if (!conversation) {
      return res.status(400).json({ error: 'BadRequest', message: 'Provide either prompt or messages' });
    }

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const streamRes = await getChatCompletion({ messages: conversation, model, stream: true, temperature, maxTokens });

      let accumulated = '';
      for await (const chunk of streamRes) {
        const delta = chunk.choices?.[0]?.delta?.content ?? '';
        if (delta) {
          accumulated += delta;
          res.write(`data: ${JSON.stringify({ text: accumulated, delta })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const { text } = await getChatCompletion({ messages: conversation, model, stream: false, temperature, maxTokens });
    return res.json({ text });
  } catch (err) {
    return next(err);
  }
});

export default router;


