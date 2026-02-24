import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const LANGUAGES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', ru: 'Russian', zh: 'Chinese',
  ja: 'Japanese', ko: 'Korean', ar: 'Arabic', hi: 'Hindi',
  nl: 'Dutch', pl: 'Polish', tr: 'Turkish', vi: 'Vietnamese',
  th: 'Thai', sv: 'Swedish', da: 'Danish', fi: 'Finnish'
};

type TransformationType = 
  | 'translate'
  | 'enhance'
  | 'summarize'
  | 'gapAnalysis'
  | 'restructure'
  | 'addData'
  | 'expand'
  | 'condense';

interface TransformRequest {
  elements: { id: string; content: string }[];
  transformationType: TransformationType;
  options: {
    targetLanguage?: string;
    tone?: string;
  };
}

function buildPrompt(type: TransformationType, options: TransformRequest['options'], content: string): string {
  const lang = options.targetLanguage ? LANGUAGES[options.targetLanguage] || options.targetLanguage : '';
  const tone = options.tone || 'professional';
  
  switch (type) {
    case 'translate':
      return `Translate the following text to ${lang}. Preserve the original formatting and style:\n\n${content}`;
    case 'enhance':
      return `Enhance the following text with ${tone} tone. Improve grammar, clarity, and flow:\n\n${content}`;
    case 'summarize':
      return `Create a concise summary of the following text:\n\n${content}`;
    case 'gapAnalysis':
      return `Analyze the following text and identify gaps or missing elements:\n\n${content}`;
    case 'restructure':
      return `Restructure the following content to improve organization:\n\n${content}`;
    case 'addData':
      return `Review and add relevant data/info where appropriate:\n\n${content}`;
    case 'expand':
      return `Elaborate and expand on the following content:\n\n${content}`;
    case 'condense':
      return `Condense and shorten the following text:\n\n${content}`;
    default:
      return content;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TransformRequest = await request.json();
    const { elements, transformationType, options } = body;

    if (!elements || elements.length === 0) {
      return NextResponse.json({ error: 'No elements provided' }, { status: 400 });
    }

    const results = [];

    for (const element of elements) {
      const prompt = buildPrompt(transformationType, options, element.content);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a document transformation assistant. Transform the text as requested. Only output the transformed text, nothing else.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      results.push({
        elementId: element.id,
        originalContent: element.content,
        transformedContent: response.choices[0]?.message?.content?.trim() || element.content,
        confidence: 0.95
      });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Transformation failed' }, { status: 500 });
  }
}
