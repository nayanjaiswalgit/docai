'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, Heading1, Heading2, Heading3, 
  Check, RotateCcw, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough, Highlighter,
  ListOrdered, ListChecks, Quote, Minus, Undo, Redo,
  Plus, Trash2, Palette, FileText
} from 'lucide-react';
import type { DocumentData, DocumentElement } from '@/types/document';

interface DocumentEditorProps {
  document: DocumentData | null;
  onUpdateElement: (elementId: string, newContent: string, newStyles?: Record<string, string>) => void;
  onAddElement: (type: DocumentElement['type'], content: string, afterElementId?: string) => void;
  onDeleteElement: (elementId: string) => void;
  onSelectElements: (elements: DocumentElement[]) => void;
  selectedElements: DocumentElement[];
}

const FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Tahoma', label: 'Tahoma' },
];

const FONT_SIZES = [
  { value: '12px', label: '12' },
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
  { value: '28px', label: '28' },
  { value: '32px', label: '32' },
  { value: '36px', label: '36' },
  { value: '48px', label: '48' },
];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#eeeeee', '#f3f3f3', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#b4c7e7', '#c4d3e9', '#d5a6bd',
];

const HIGHLIGHT_COLORS = [
  'transparent', '#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#ff9800', '#f44336', '#00bcd4',
];

export default function DocumentEditor({ 
  document, 
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  onSelectElements,
  selectedElements 
}: DocumentEditorProps) {
  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [cursorOverElement, setCursorOverElement] = useState<string | null>(null);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState<'text' | 'highlight' | null>(null);

  const selectedIds = new Set(selectedElements.map(el => el.id));
  const selectedElement = selectedElements.length === 1 ? selectedElements[0] : null;
  const currentStyles = selectedElement?.styles || {};

  const handleElementClick = useCallback((element: DocumentElement, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.shiftKey && selectedElements.length > 0) {
      const lastSelected = selectedElements[selectedElements.length - 1];
      const lastIndex = document.elements.findIndex(el => el.id === lastSelected.id);
      const currentIndex = document.elements.findIndex(el => el.id === element.id);
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const rangeElements = document.elements.slice(start, end + 1);
      onSelectElements([...selectedElements, ...rangeElements]);
    } else if (selectedIds.has(element.id)) {
      onSelectElements(selectedElements.filter(el => el.id !== element.id));
    } else {
      onSelectElements([element]);
    }
  }, [selectedElements, selectedIds, document?.elements, onSelectElements]);

  const handleDoubleClick = useCallback((element: DocumentElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(element.id);
    setEditingContent(element.content);
  }, []);

  const handleBlur = useCallback(() => {
    if (editingId) {
      const element = document?.elements.find(e => e.id === editingId);
      if (element && editingContent !== element.content) {
        onUpdateElement(editingId, editingContent);
      }
    }
    setEditingId(null);
  }, [editingId, editingContent, document.elements, onUpdateElement]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingId(null);
    }
  }, []);

  const handleBackgroundClick = useCallback(() => {
    onSelectElements([]);
    handleBlur();
  }, [onSelectElements, handleBlur]);

  const handleAddElement = useCallback((type: DocumentElement['type'], content: string, afterId?: string) => {
    let newElement: DocumentElement;
    
    if (type === 'heading' || type === 'heading1' || type === 'heading2' || type === 'heading3') {
      newElement = {
        id: `elem-${Date.now()}`,
        type: 'heading',
        content,
        html: `<h1>${content}</h1>`,
        styles: { fontSize: '32px', fontWeight: '700' },
        originalContent: content
      };
    } else if (type === 'list') {
      newElement = {
        id: `elem-${Date.now()}`,
        type: 'list',
        content,
        html: `<ul><li>${content}</li></ul>`,
        styles: {},
        originalContent: content
      };
    } else {
      newElement = {
        id: `elem-${Date.now()}`,
        type: 'paragraph',
        content,
        html: `<p>${content}</p>`,
        styles: { fontSize: '16px' },
        originalContent: content
      };
    }

    const idx = document.elements.findIndex(el => el.id === afterId);
    let newElements: DocumentElement[];
    
    if (idx >= 0 && afterId) {
      newElements = [...document.elements.slice(0, idx + 1), newElement, ...document.elements.slice(idx + 1)];
    } else {
      newElements = [...document.elements, newElement];
    }

    onUpdateElement('__new__', '', {}); 
    const updatedDoc = { ...document, elements: newElements };
    onUpdateElement(newElement.id, newElement.content, newElement.styles);
  }, [document, onUpdateElement]);

  const handleDeleteSelected = useCallback(() => {
    selectedElements.forEach(el => onDeleteElement(el.id));
    onSelectElements([]);
  }, [selectedElements, onDeleteElement, onSelectElements]);

  const applyStyle = useCallback((styleKey: string, styleValue: string) => {
    if (!selectedElement) return;
    const newStyles = { ...selectedElement.styles, [styleKey]: styleValue };
    onUpdateElement(selectedElement.id, selectedElement.content, newStyles);
  }, [selectedElement, onUpdateElement]);

  const hasSelection = selectedElements.length > 0;

  const renderElementContent = (element: DocumentElement) => {
    if (element.type === 'heading') {
      const size = element.styles.fontSize || '24px';
      const Tag = parseInt(size) >= 32 ? 'h1' : parseInt(size) >= 24 ? 'h2' : 'h3';
      const tagProps: React.HTMLAttributes<HTMLHeadingElement> = {
        className: 'font-bold text-gray-900',
        style: {
          fontSize: element.styles.fontSize || '24px',
          fontWeight: element.styles.fontWeight || '700',
          color: element.styles.color || '#000000',
          textAlign: (element.styles.textAlign || 'left') as any,
          fontFamily: element.styles.fontFamily || 'Arial',
        }
      };
      if (Tag === 'h1') return <h1 {...tagProps}>{element.content}</h1>;
      if (Tag === 'h2') return <h2 {...tagProps}>{element.content}</h2>;
      return <h3 {...tagProps}>{element.content}</h3>;
    }

    if (element.type === 'list') {
      return (
        <ul className="list-disc list-inside text-gray-800" style={element.styles}>
          {element.content.split('\n').filter(Boolean).map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <p 
        className="text-gray-800 whitespace-pre-wrap"
        style={{
          fontSize: element.styles.fontSize || '16px',
          fontFamily: element.styles.fontFamily || 'Arial',
          fontWeight: element.styles.fontWeight || '400',
          fontStyle: element.styles.fontStyle || 'normal',
          color: element.styles.color || '#000000',
          backgroundColor: element.styles.backgroundColor || 'transparent',
          textAlign: (element.styles.textAlign || 'left') as any,
          textDecoration: element.styles.textDecoration || 'none',
        }}
      >
        {element.content}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-0 z-40 flex items-center gap-1 px-3 py-2 bg-white border-b border-gray-200 shadow-sm"
          >
            <div className="relative">
              <button
                onClick={() => setShowFontMenu(!showFontMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-700 min-w-[100px] justify-between"
                style={{ fontFamily: currentStyles.fontFamily || 'Arial' }}
              >
                {currentStyles.fontFamily || 'Arial'}
                <span className="text-xs">▼</span>
              </button>
              <AnimatePresence>
                {showFontMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-60 overflow-y-auto"
                  >
                    {FONTS.map(font => (
                      <button
                        key={font.value}
                        onClick={() => { applyStyle('fontFamily', font.value); setShowFontMenu(false); }}
                        className={`w-full px-3 py-2 text-left hover:bg-gray-100 ${currentStyles.fontFamily === font.value ? 'bg-blue-50 text-blue-600' : ''}`}
                        style={{ fontFamily: font.value }}
                      >
                        {font.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-sm text-gray-700 min-w-[50px] justify-center"
              >
                {currentStyles.fontSize?.replace('px', '') || '16'}
                <span className="text-xs">▼</span>
              </button>
              <AnimatePresence>
                {showSizeMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 w-20 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                  >
                    {FONT_SIZES.map(size => (
                      <button
                        key={size.value}
                        onClick={() => { applyStyle('fontSize', size.value); setShowSizeMenu(false); }}
                        className={`w-full px-3 py-2 text-center hover:bg-gray-100 ${currentStyles.fontSize === size.value ? 'bg-blue-50 text-blue-600' : ''}`}
                        style={{ fontSize: size.value }}
                      >
                        {size.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button onClick={() => applyStyle('fontWeight', currentStyles.fontWeight === '700' ? '400' : '700')} className="p-2 rounded hover:bg-gray-100 text-gray-700">
              <Bold className="w-4 h-4" />
            </button>
            <button onClick={() => applyStyle('fontStyle', currentStyles.fontStyle === 'italic' ? 'normal' : 'italic')} className="p-2 rounded hover:bg-gray-100 text-gray-700">
              <Italic className="w-4 h-4" />
            </button>
            <button onClick={() => applyStyle('textDecoration', currentStyles.textDecoration === 'underline' ? 'none' : 'underline')} className="p-2 rounded hover:bg-gray-100 text-gray-700">
              <Underline className="w-4 h-4" />
            </button>
            <button onClick={() => applyStyle('textDecoration', currentStyles.textDecoration === 'line-through' ? 'none' : 'line-through')} className="p-2 rounded hover:bg-gray-100 text-gray-700">
              <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <div className="relative">
              <button 
                onClick={() => setShowColorMenu(showColorMenu === 'text' ? null : 'text')}
                className="p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center gap-1"
              >
                <Palette className="w-4 h-4" />
                <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: currentStyles.color || '#000000' }} />
              </button>
              <AnimatePresence>
                {showColorMenu === 'text' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-10 gap-1">
                      {TEXT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => { applyStyle('color', color); setShowColorMenu(null); }}
                          className={`w-5 h-5 rounded border-2 ${currentStyles.color === color ? 'border-blue-500' : 'border-gray-200'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <button onClick={() => applyStyle('textAlign', 'left')} className={`p-2 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'left' ? 'bg-gray-200' : ''}`}>
              <AlignLeft className="w-4 h-4" />
            </button>
            <button onClick={() => applyStyle('textAlign', 'center')} className={`p-2 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'center' ? 'bg-gray-200' : ''}`}>
              <AlignCenter className="w-4 h-4" />
            </button>
            <button onClick={() => applyStyle('textAlign', 'right')} className={`p-2 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'right' ? 'bg-gray-200' : ''}`}>
              <AlignRight className="w-4 h-4" />
            </button>
            <button onClick={() => applyStyle('textAlign', 'justify')} className={`p-2 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'justify' ? 'bg-gray-200' : ''}`}>
              <AlignJustify className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1" />

            <span className="text-xs text-gray-500 px-2">
              {selectedElements.length} selected
            </span>
            <button 
              onClick={handleDeleteSelected}
              className="p-2 rounded hover:bg-red-50 text-red-500 ml-auto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-100" onClick={handleBackgroundClick}>
        <div className="max-w-[816px] mx-auto bg-white min-h-[1056px] shadow-lg rounded-sm p-[72px]">
          <div className="absolute top-4 right-4 z-10">
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowAddMenu(!showAddMenu); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              
              <AnimatePresence>
                {showAddMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => { handleAddElement('heading1', 'Heading 1'); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <Heading1 className="w-4 h-4" />
                      <span className="font-bold">Heading 1</span>
                    </button>
                    <button onClick={() => { handleAddElement('heading2', 'Heading 2'); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <Heading2 className="w-4 h-4" />
                      <span className="font-semibold">Heading 2</span>
                    </button>
                    <button onClick={() => { handleAddElement('heading3', 'Heading 3'); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <Heading3 className="w-4 h-4" />
                      <span className="font-medium">Heading 3</span>
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button onClick={() => { handleAddElement('paragraph', 'Start typing...'); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <Type className="w-4 h-4" />
                      <span>Paragraph</span>
                    </button>
                    <button onClick={() => { handleAddElement('list', 'List item'); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                      <ListChecks className="w-4 h-4" />
                      <span>Bullet list</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {document.elements.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400 mb-4">Start typing or click Add to add content...</p>
              <div className="flex justify-center gap-2">
                <button onClick={() => handleAddElement('heading1', 'Title')} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold">Add Heading</button>
                <button onClick={() => handleAddElement('paragraph', 'Start typing...')} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Add Text</button>
              </div>
            </div>
          ) : (
            document.elements.map((element, index) => {
              const isSelected = selectedIds.has(element.id);
              const isEditing = editingId === element.id;
              const isModified = element.content !== element.originalContent;
              const isHovered = cursorOverElement === element.id;

              if (isEditing) {
                return (
                  <div key={element.id} className="relative group mb-4">
                    <textarea
                      autoFocus
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      className="w-full p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-gray-900 resize-none focus:outline-none text-lg"
                      rows={Math.max(3, editingContent.split('\n').length)}
                      style={{ 
                        fontFamily: element.styles.fontFamily || 'Arial',
                        fontSize: element.styles.fontSize || '16px',
                      }}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={element.id}
                  onClick={(e) => handleElementClick(element, e)}
                  onDoubleClick={(e) => handleDoubleClick(element, e)}
                  onMouseEnter={() => setCursorOverElement(element.id)}
                  onMouseLeave={() => setCursorOverElement(null)}
                  className={`group relative mb-4 p-2 -mx-2 rounded-lg cursor-text transition-all duration-200 ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500/50' : isHovered ? 'bg-gray-50' : ''}`}
                >
                  <div className={`absolute left-0 top-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${isSelected ? 'bg-blue-500' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      {isSelected ? <Check className="w-4 h-4 text-white" /> : <Type className="w-3 h-3 text-gray-500" />}
                    </div>
                  </div>
                  <div>{renderElementContent(element)}</div>
                  {isModified && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-amber-600">Modified</span>
                      <button onClick={(e) => { e.stopPropagation(); onUpdateElement(element.id, element.originalContent, {}); }} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                        <RotateCcw className="w-3 h-3" /> Revert
                      </button>
                    </div>
                  )}
                  {isSelected && <div className="absolute right-2 top-2"><div className="w-2 h-2 rounded-full bg-blue-500" /></div>}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
