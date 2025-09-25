import { openai } from './openai.js'; // your configured OpenAI API client

export async function generateQuestionsFromContent(files) {
  // Create context based on files
  const fileNames = files.map(f => f.originalname).join(', ');

  const prompt = `
You are an expert instructional designer. Based on the uploaded files (${fileNames}), generate 7 unique SME interview questions covering learning objectives, common misconceptions, structure, exercises, prerequisites, assessment strategies, and additional resources. Avoid repeating questions if already asked.
`;

  const response = await openai.createChatCompletion({
    model: 'gpt-4-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000
  });

  const message = response.data.choices[0].message.content;
  // Split into questions if separated by newlines or numbering
  const questions = message.split(/\n\d*\.*\s*/).filter(q => q.trim()).map((q, index) => ({
    id: index + 1,
    question: q.trim()
  }));

  return questions;
}
