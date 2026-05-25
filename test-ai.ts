"import { openai } from './leaf-line-emporium-deploy/lib/integrations-openai-ai-server/src/client';

async function test() {
  try {
    console.log('Testing AI connection...');
    const response = await openai.chat.completions.create({
      model: 'google/gemma-4-31b-it:free',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Success! Response:', response.choices[0].message.content);
  } catch (e) {
    console.error('AI Test Failed:', e);
  }
}

test();"