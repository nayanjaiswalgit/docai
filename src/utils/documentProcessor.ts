import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentData, DocumentElement } from '@/types/document';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function extractStyles(element: Element): Record<string, string> {
  const computed = window.getComputedStyle(element);
  const styles: Record<string, string> = {};
  
  const styleProps = [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
    'color', 'backgroundColor', 'textAlign', 'lineHeight',
    'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
    'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
    'borderTop', 'borderBottom', 'borderLeft', 'borderRight',
    'listStyleType', 'textDecoration', 'verticalAlign'
  ];
  
  styleProps.forEach(prop => {
    const value = computed.getPropertyValue(prop);
    if (value && value !== '0px' && value !== 'normal' && value !== 'none') {
      const camelProp = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      styles[camelProp] = value;
    }
  });
  
  return styles;
}

export async function parseDocx(arrayBuffer: ArrayBuffer): Promise<DocumentData> {
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const parser = new DOMParser();
  const doc = parser.parseFromString(result.value, 'text/html');
  
  const elements: DocumentElement[] = [];
  let elementIndex = 0;
  
  doc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, table, img, ol, ul').forEach((node) => {
    const tagName = node.tagName.toLowerCase();
    let type: DocumentElement['type'] = 'paragraph';
    let content = '';
    let html = '';
    
    if (tagName.startsWith('h')) {
      type = 'heading';
      content = node.textContent || '';
      html = node.outerHTML;
    } else if (tagName === 'p') {
      type = 'paragraph';
      content = node.textContent || '';
      html = node.outerHTML;
    } else if (tagName === 'table') {
      type = 'table';
      content = node.textContent || '';
      html = node.outerHTML;
    } else if (tagName === 'img') {
      type = 'image';
      content = (node as HTMLImageElement).alt || '';
      html = node.outerHTML;
    } else if (tagName === 'ol' || tagName === 'ul') {
      type = 'list';
      content = node.textContent || '';
      html = node.outerHTML;
    }
    
    if (content.trim()) {
      elements.push({
        id: `elem-${elementIndex++}`,
        type,
        content: content.trim(),
        html,
        styles: {},
        originalContent: content.trim()
      });
    }
  });
  
  return {
    elements,
    fileName: 'document.docx',
    fileType: 'docx',
    lastModified: Date.now()
  };
}

export async function parsePdf(arrayBuffer: ArrayBuffer, fileName: string): Promise<DocumentData> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const elements: DocumentElement[] = [];
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 2.0 });
    
    let currentParagraph = '';
    let lastY = -1;
    
    textContent.items.forEach((item: any, index: number) => {
      const y = item.transform[5];
      const fontSize = item.height;
      const text = item.str;
      
      if (lastY !== -1 && Math.abs(y - lastY) > fontSize * 1.5) {
        if (currentParagraph.trim()) {
          elements.push({
            id: `elem-${elements.length}`,
            type: elements.length === 0 || fontSize > 14 ? 'heading' : 'paragraph',
            content: currentParagraph.trim(),
            html: `<p>${currentParagraph.trim()}</p>`,
            styles: { fontSize: `${fontSize}px` },
            originalContent: currentParagraph.trim()
          });
        }
        currentParagraph = text;
      } else {
        currentParagraph += (currentParagraph ? ' ' : '') + text;
      }
      lastY = y;
    });
    
    if (currentParagraph.trim()) {
      elements.push({
        id: `elem-${elements.length}`,
        type: 'paragraph',
        content: currentParagraph.trim(),
        html: `<p>${currentParagraph.trim()}</p>`,
        styles: {},
        originalContent: currentParagraph.trim()
      });
    }
  }
  
  return {
    elements,
    fileName,
    fileType: 'pdf',
    lastModified: Date.now()
  };
}

export async function parseDocument(file: File): Promise<DocumentData> {
  const arrayBuffer = await file.arrayBuffer();
  
  if (file.name.endsWith('.docx')) {
    return parseDocx(arrayBuffer);
  } else if (file.name.endsWith('.pdf')) {
    return parsePdf(arrayBuffer, file.name);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX files.');
  }
}

export function updateElementContent(
  doc: DocumentData,
  elementId: string,
  newContent: string
): DocumentData {
  return {
    ...doc,
    elements: doc.elements.map(el => 
      el.id === elementId 
        ? { ...el, content: newContent }
        : el
    )
  };
}

export function revertElement(doc: DocumentData, elementId: string): DocumentData {
  return {
    ...doc,
    elements: doc.elements.map(el => 
      el.id === elementId 
        ? { ...el, content: el.originalContent }
        : el
    )
  };
}

export function generateHtml(doc: DocumentData): string {
  return doc.elements.map(el => el.html).join('\n');
}
