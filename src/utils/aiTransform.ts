import type { 
  DocumentElement, 
  TransformationType, 
  TransformOptions, 
  TransformResult 
} from '@/types/document';

const LANGUAGES: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', ru: 'Russian', zh: 'Chinese',
  ja: 'Japanese', ko: 'Korean', ar: 'Arabic', hi: 'Hindi',
  nl: 'Dutch', pl: 'Polish', tr: 'Turkish', vi: 'Vietnamese',
  th: 'Thai', sv: 'Swedish', da: 'Danish', fi: 'Finnish'
};

export async function transformElement(
  element: DocumentElement,
  transformationType: TransformationType,
  options: TransformOptions
): Promise<TransformResult> {
  const results = await transformElements([element], transformationType, options);
  return results[0];
}

export async function transformElements(
  elements: DocumentElement[],
  transformationType: TransformationType,
  options: TransformOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<TransformResult[]> {
  try {
    const response = await fetch('/api/transform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elements: elements.map(el => ({ id: el.id, content: el.content })),
        transformationType,
        options: {
          targetLanguage: options.targetLanguage,
          tone: options.tone
        }
      })
    });

    if (!response.ok) {
      throw new Error('Transformation failed');
    }

    const data = await response.json();
    
    if (onProgress) {
      onProgress(elements.length, elements.length);
    }

    return data.results;
  } catch (error) {
    console.error('Transform error:', error);
    return elements.map(el => ({
      elementId: el.id,
      originalContent: el.content,
      transformedContent: el.content,
      confidence: 0
    }));
  }
}

export function getTargetLanguageName(code: string): string {
  return LANGUAGES[code] || code;
}

export function getTransformationPrompt(
  type: TransformationType,
  options: TransformOptions
): string {
  const lang = options.targetLanguage ? getTargetLanguageName(options.targetLanguage) : '';
  
  const prompts: Record<TransformationType, string> = {
    translate: `Translate to ${lang}`,
    enhance: `Enhance with ${options.tone || 'professional'} tone`,
    summarize: 'Create a concise summary',
    gapAnalysis: 'Identify gaps and missing elements',
    restructure: 'Reorganize the content structure',
    addData: 'Add relevant data and information',
    expand: 'Elaborate and expand on the content',
    condense: 'Shorten and condense the content'
  };
  
  return prompts[type];
}
