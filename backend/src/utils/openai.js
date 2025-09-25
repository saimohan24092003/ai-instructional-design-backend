import { Configuration, OpenAIApi } from 'openai';
import { env } from '../config/env.js';

const configuration = new Configuration({
  apiKey: env.openaiApiKey
});

export const openai = new OpenAIApi(configuration);
