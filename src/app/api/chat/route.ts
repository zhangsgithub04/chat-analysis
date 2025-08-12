import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { message, theme, provider = 'openai', image } = await request.json();

    if (!message && !image) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    let response: string;

    if (provider === 'gemini') {
      response = await getGeminiResponse(message, theme, image);
    } else {
      response = await getOpenAIResponse(message, theme, image);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI service' },
      { status: 500 }
    );
  }
}

async function getOpenAIResponse(message: string, theme: string, image?: string): Promise<string> {
  const systemPrompts = {
    'pure-math': 'You are a pure mathematics tutor. Focus on theoretical concepts, proofs, and abstract mathematical structures. Provide clear explanations with mathematical rigor.',
    'applied-math': 'You are an applied mathematics tutor. Focus on practical applications, problem-solving techniques, and real-world mathematical modeling. Show how math concepts apply to various fields.',
    'physics': 'You are a physics tutor. Explain physical phenomena, laws, and principles. Connect mathematical concepts to physical reality and provide intuitive understanding.',
    'quantum-computing': 'You are a quantum computing expert. Explain quantum mechanics principles, qubits, quantum gates, algorithms, and error correction. Focus on both theoretical foundations and practical applications of quantum computing.'
  };

  const systemPrompt = systemPrompts[theme as keyof typeof systemPrompts] || systemPrompts['pure-math'];

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  if (image) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: message },
        { type: 'image_url', image_url: { url: image } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: message });
  }

  const completion = await openai.chat.completions.create({
    model: image ? 'gpt-4-vision-preview' : 'gpt-3.5-turbo',
    messages,
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}

async function getGeminiResponse(message: string, theme: string, image?: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompts = {
    'pure-math': `You are a pure mathematics tutor. Focus on theoretical concepts, proofs, and abstract mathematical structures. Student question: ${message}`,
    'applied-math': `You are an applied mathematics tutor. Focus on practical applications, problem-solving techniques, and real-world mathematical modeling. Student question: ${message}`,
    'physics': `You are a physics tutor. Explain physical phenomena, laws, and principles. Connect mathematical concepts to physical reality. Student question: ${message}`,
    'quantum-computing': `You are a quantum computing expert. Explain quantum mechanics principles, qubits, quantum gates, algorithms, and error correction. Focus on both theoretical foundations and practical applications. Student question: ${message}`
  };

  if (image) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const imagePart = {
      inlineData: {
        data: image.split(',')[1],
        mimeType: 'image/jpeg'
      }
    };
    
    const prompt = prompts[theme as keyof typeof prompts] || prompts['pure-math'];
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    return response.text() || 'Sorry, I could not generate a response.';
  } else {
    const prompt = prompts[theme as keyof typeof prompts] || prompts['pure-math'];
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || 'Sorry, I could not generate a response.';
  }
}