export interface DocumentElement {
  id: string;
  type: 'paragraph' | 'heading' | 'heading1' | 'heading2' | 'heading3' | 'table' | 'image' | 'list';
  content: string;
  html: string;
  styles: Record<string, string>;
  originalContent: string;
}

export interface DocumentData {
  elements: DocumentElement[];
  fileName: string;
  fileType: 'pdf' | 'docx';
  lastModified: number;
}

export type TransformationType = 
  | 'translate'
  | 'enhance'
  | 'summarize'
  | 'gapAnalysis'
  | 'restructure'
  | 'addData'
  | 'expand'
  | 'condense';

export interface TransformRequest {
  elements: DocumentElement[];
  transformationType: TransformationType;
  options: TransformOptions;
}

export interface TransformOptions {
  targetLanguage?: string;
  tone?: 'formal' | 'casual' | 'professional' | 'friendly';
  length?: 'shorter' | 'longer' | 'same';
  focusAreas?: string[];
}

export interface TransformResult {
  elementId: string;
  originalContent: string;
  transformedContent: string;
  confidence: number;
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'sv', name: 'Swedish' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
];

export const TRANSFORMATION_TYPES = [
  { id: 'translate', name: 'Translate', icon: 'Globes', description: 'Convert to different language' },
  { id: 'enhance', name: 'Enhance', icon: 'Sparkles', description: 'Improve grammar and clarity' },
  { id: 'summarize', name: 'Summarize', icon: 'Scissors', description: 'Create concise summary' },
  { id: 'gapAnalysis', name: 'Gap Analysis', icon: 'Search', description: 'Identify missing elements' },
  { id: 'restructure', name: 'Restructure', icon: 'Layout', description: 'Reorganize content' },
  { id: 'addData', name: 'Add Data', icon: 'Plus', description: 'Fill missing information' },
  { id: 'expand', name: 'Expand', icon: 'Expand', description: 'Elaborate on points' },
  { id: 'condense', name: 'Condense', icon: 'Shrink', description: 'Shorten content' },
] as const;
