'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Highlighter, List, ListOrdered, Quote, Minus,
  Plus, Trash2, Undo2, Redo2, FileDown, Upload, Sparkles, Link2,
  Share2, MoreHorizontal, Menu, Clock, Folder, Settings, HelpCircle,
  ChevronDown, ChevronUp, Minus as IndentDecrease, IndentIncrease,
  Copy, Clipboard, FileText, Download, Printer, Users
} from 'lucide-react';

interface TextBlock {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bullet' | 'numbered';
  content: string;
  styles: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
    color?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    backgroundColor?: string;
  };
}

const FONTS = ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 'Tahoma', 'Roboto', 'Open Sans'];
const SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '60', '72'];
const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#eeeeee', '#f3f3f3', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
];
const HIGHLIGHT_COLORS = [
  'transparent', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff9900', '#ff0000', '#cfe2f3', '#d9ead3', '#fff2cc'
];

export default function Home() {
  const [blocks, setBlocks] = useState<TextBlock[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showLineSpacingMenu, setShowLineSpacingMenu] = useState(false);
  const [showIndentMenu, setShowIndentMenu] = useState(false);
  const [history, setHistory] = useState<TextBlock[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showTransformModal, setShowTransformModal] = useState(false);
  const [transformType, setTransformType] = useState<string>('enhance');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState<string | null>(null);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingToolbarPos, setFloatingToolbarPos] = useState({ x: 0, y: 0 });
  const [selectedTextStyles, setSelectedTextStyles] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  }>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const floatingToolbarRef = useRef<HTMLDivElement>(null);

  const selectedBlock = selectedIds.size === 1 ? blocks.find(b => selectedIds.has(b.id)) : null;
  const currentStyles = selectedBlock?.styles || {};

  const saveToHistory = useCallback((newBlocks: TextBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newBlocks]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
    }
  };

  const addBlock = (type: TextBlock['type']) => {
    const newBlock: TextBlock = {
      id: `block-${Date.now()}`,
      type,
      content: type.startsWith('heading') ? 'Heading' : 'Start typing...',
      styles: { 
        fontSize: type === 'heading1' ? '32px' : type === 'heading2' ? '24px' : type === 'heading3' ? '20px' : '16px',
        fontWeight: type.startsWith('heading') ? '700' : '400',
        fontFamily: 'Arial',
      }
    };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    setSelectedIds(new Set([newBlock.id]));
  };

  const updateBlock = (id: string, updates: Partial<TextBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateBlockStyles = (id: string, styles: Partial<TextBlock['styles']>) => {
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        return { ...b, styles: { ...b.styles, ...styles } };
      }
      return b;
    }));
  };

  const saveBlockChanges = () => {
    saveToHistory(blocks);
  };

  const deleteSelected = () => {
    const newBlocks = blocks.filter(b => !selectedIds.has(b.id));
    setBlocks(newBlocks);
    saveToHistory(newBlocks);
    setSelectedIds(new Set());
  };

  const handleSelect = (id: string, e: React.MouseEvent) => {
    if (e.shiftKey && selectedIds.size > 0) {
      const lastSelected = Array.from(selectedIds).pop();
      const lastIdx = blocks.findIndex(b => b.id === lastSelected);
      const currIdx = blocks.findIndex(b => b.id === id);
      const start = Math.min(lastIdx, currIdx);
      const end = Math.max(lastIdx, currIdx);
      const rangeIds = blocks.slice(start, end + 1).map(b => b.id);
      setSelectedIds(new Set([...selectedIds, ...rangeIds]));
    } else if (selectedIds.has(id)) {
      const newSet = new Set(selectedIds);
      newSet.delete(id);
      setSelectedIds(newSet);
    } else {
      setSelectedIds(new Set([id]));
    }
  };

  const handleTransform = async () => {
    const selectedBlocksList = blocks.filter(b => selectedIds.has(b.id));
    if (selectedBlocksList.length === 0) return;

    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elements: selectedBlocksList.map(b => ({ id: b.id, content: b.content })),
          transformationType: transformType,
          options: {}
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const newBlocks = blocks.map(b => {
          const result = data.results?.find((r: any) => r.elementId === b.id);
          return result ? { ...b, content: result.transformedContent } : b;
        });
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
      }
    } catch (err) {
      console.error('Transform failed:', err);
    }
    
    setShowTransformModal(false);
  };

  const exportDoc = () => {
    const html = blocks.map(b => {
      const style = `style="font-family:${b.styles.fontFamily||'Arial'};font-size:${b.styles.fontSize||'16px'};font-weight:${b.styles.fontWeight||'400'};color:${b.styles.color||'#000'};text-align:${b.styles.textAlign||'left'}"`;
      if (b.type.startsWith('heading')) return `<h${b.type.slice(-1)} ${style}>${b.content}</h${b.type.slice(-1)}>`;
      if (b.type === 'bullet') return `<ul><li ${style}>${b.content}</li></ul>`;
      return `<p ${style}>${b.content}</p>`;
    }).join('\n');
    
    const blob = new Blob([`<!DOCTYPE html><html><body style="max-width:800px;margin:40px auto;font-family:Arial">${html}</body></html>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setFloatingToolbarPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowFloatingToolbar(true);
      
      const parentBlock = range.startContainer.parentElement?.closest('[data-block-id]');
      if (parentBlock) {
        const block = blocks.find(b => b.id === parentBlock.getAttribute('data-block-id'));
        if (block) {
          setSelectedTextStyles({
            bold: block.styles.fontWeight === '700',
            italic: block.styles.fontStyle === 'italic',
            underline: block.styles.textDecoration?.includes('underline'),
            strikethrough: block.styles.textDecoration?.includes('line-through'),
          });
        }
      }
    } else {
      setShowFloatingToolbar(false);
    }
  };

  const toggleTextStyle = (style: string) => {
    if (!selectedBlock) return;
    const current = selectedBlock.styles;
    
    if (style === 'bold') {
      updateBlockStyles(selectedBlock.id, { fontWeight: current.fontWeight === '700' ? '400' : '700' });
    } else if (style === 'italic') {
      updateBlockStyles(selectedBlock.id, { fontStyle: current.fontStyle === 'italic' ? 'normal' : 'italic' });
    } else if (style === 'underline') {
      const hasUnderline = current.textDecoration?.includes('underline');
      const hasStrike = current.textDecoration?.includes('line-through');
      let newDecoration = '';
      if (hasUnderline) {
        newDecoration = hasStrike ? 'line-through' : 'none';
      } else {
        newDecoration = hasStrike ? 'underline line-through' : 'underline';
      }
      updateBlockStyles(selectedBlock.id, { textDecoration: newDecoration });
    } else if (style === 'strikethrough') {
      const hasStrike = current.textDecoration?.includes('line-through');
      const hasUnderline = current.textDecoration?.includes('underline');
      let newDecoration = '';
      if (hasStrike) {
        newDecoration = hasUnderline ? 'underline' : 'none';
      } else {
        newDecoration = hasUnderline ? 'underline line-through' : 'line-through';
      }
      updateBlockStyles(selectedBlock.id, { textDecoration: newDecoration });
    }
    saveToHistory(blocks);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => document.removeEventListener('mouseup', handleTextSelection);
  }, [blocks, selectedBlock]);

  const formatMenuItems: Record<string, { label: string; icon: React.ReactNode; action?: () => void; divider?: boolean }[]> = {
    file: [
      { label: 'New', icon: <FileText className="w-4 h-4" />, action: () => setBlocks([]) },
      { label: 'Make a copy', icon: <Copy className="w-4 h-4" /> },
      { label: 'Download', icon: <Download className="w-4 h-4" />, action: exportDoc },
      { label: 'Print', icon: <Printer className="w-4 h-4" /> },
    ],
    edit: [
      { label: 'Undo', icon: <Undo2 className="w-4 h-4" />, action: undo },
      { label: 'Redo', icon: <Redo2 className="w-4 h-4" />, action: redo },
      { label: '', icon: null, divider: true },
      { label: 'Cut', icon: <div className="w-4 h-4 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg></div> },
      { label: 'Copy', icon: <Copy className="w-4 h-4" /> },
      { label: 'Paste', icon: <Clipboard className="w-4 h-4" /> },
    ],
    view: [
      { label: 'Show ruler', icon: null },
      { label: 'Show outline', icon: null },
      { label: 'Print layout', icon: null },
      { label: '', icon: null, divider: true },
      { label: 'Full screen', icon: null },
    ],
    insert: [
      { label: 'Image', icon: null },
      { label: 'Link', icon: <Link2 className="w-4 h-4" /> },
      { label: 'Table', icon: null },
      { label: 'Drawing', icon: null },
    ],
    format: [
      { label: 'Bold', icon: <Bold className="w-4 h-4" />, action: () => selectedBlock && toggleTextStyle('bold') },
      { label: 'Italic', icon: <Italic className="w-4 h-4" />, action: () => selectedBlock && toggleTextStyle('italic') },
      { label: 'Underline', icon: <Underline className="w-4 h-4" />, action: () => selectedBlock && toggleTextStyle('underline') },
      { label: 'Strikethrough', icon: <Strikethrough className="w-4 h-4" />, action: () => selectedBlock && toggleTextStyle('strikethrough') },
      { label: '', icon: null, divider: true },
      { label: 'Align left', icon: <AlignLeft className="w-4 h-4" /> },
      { label: 'Align center', icon: <AlignCenter className="w-4 h-4" /> },
      { label: 'Align right', icon: <AlignRight className="w-4 h-4" /> },
    ],
    tools: [
      { label: 'Spell check', icon: null },
      { label: 'Word count', icon: null },
      { label: 'Explore', icon: null },
    ],
    help: [
      { label: 'Help', icon: <HelpCircle className="w-4 h-4" /> },
      { label: 'Training', icon: null },
      { label: 'Report abuse', icon: null },
    ],
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Google Docs-style Header */}
      <header className="h-[48px] bg-white border-b border-gray-200 flex items-center justify-between px-2 sticky top-0 z-50">
        {/* Left section - Logo & Title */}
        <div className="flex items-center gap-1">
          <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
            <div className="w-6 h-6">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path fill="#2196F3" d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col">
            {isEditingTitle ? (
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-sm font-medium bg-transparent border-b border-blue-500 outline-none px-1"
                autoFocus
              />
            ) : (
              <span 
                className="text-sm font-medium text-gray-700 px-2 py-0.5 hover:bg-gray-100 rounded cursor-text"
                onClick={() => setIsEditingTitle(true)}
              >
                {documentTitle}
              </span>
            )}
            <span className="text-xs text-gray-500 px-2">Opening</span>
          </div>
        </div>

        {/* Center section - Menu items */}
        <div className="flex items-center gap-0.5">
          {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools', 'Help'].map((menu) => (
            <div key={menu} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
                onBlur={() => setTimeout(() => setActiveMenu(null), 200)}
                className={`px-3 py-1.5 text-sm rounded hover:bg-gray-100 ${activeMenu === menu ? 'bg-gray-100' : 'text-gray-700'}`}
              >
                {menu}
              </button>
              
              {activeMenu === menu && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 min-w-[200px] z-50">
                  {formatMenuItems[menu.toLowerCase()]?.map((item, idx) => (
                    item.divider ? (
                      <div key={idx} className="h-px bg-gray-200 my-1" />
                    ) : (
                      <button
                        key={idx}
                        onClick={() => { item.action?.(); setActiveMenu(null); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-3"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right section - Actions & Avatar */}
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#c2e7ff] hover:bg-[#b3d9f2] text-[#001d35] text-sm font-medium">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ml-1">
            <span className="text-white text-xs font-medium">N</span>
          </div>
        </div>
      </header>

      {/* Format bar (Google Docs style) */}
      <div className="bg-white border-b border-gray-200 flex items-center gap-1 px-2 py-1 sticky top-[48px] z-40">
        <div className="flex items-center gap-1 text-gray-700">
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded">Normal text</button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded font-bold">Heading 1</button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded font-bold">Heading 2</button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded font-bold">Heading 3</button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded font-bold">Title</button>
          <button className="px-2 py-1 text-sm hover:bg-gray-100 rounded font-bold">Subtitle</button>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="bg-white border-b border-gray-200 flex items-center gap-1 px-2 py-1.5 sticky top-[84px] z-30">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-300">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
            <Undo2 className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30">
            <Redo2 className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Font */}
        <div className="relative">
          <button onClick={() => { setShowFontMenu(!showFontMenu); setShowSizeMenu(false); }} 
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-sm min-w-[100px] justify-between" 
            style={{ fontFamily: currentStyles.fontFamily || 'Arial' }}>
            <span className="truncate">{currentStyles.fontFamily || 'Arial'}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showFontMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 w-48 max-h-60 overflow-auto z-50">
              {FONTS.map(f => (
                <button key={f} onClick={() => { selectedBlock && updateBlockStyles(selectedBlock.id, { fontFamily: f }); setShowFontMenu(false); saveToHistory(blocks); }} 
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between" style={{ fontFamily: f }}>
                  {f}
                  {currentStyles.fontFamily === f && <span className="text-blue-500">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Size */}
        <div className="relative">
          <button onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); }}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-sm min-w-[40px] justify-between">
            <span>{currentStyles.fontSize?.replace('px','') || '16'}</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border py-1 w-16 max-h-60 overflow-auto z-50">
              {SIZES.map(s => (
                <button key={s} onClick={() => { selectedBlock && updateBlockStyles(selectedBlock.id, { fontSize: s + 'px' }); setShowSizeMenu(false); saveToHistory(blocks); }} 
                  className={`w-full px-3 py-1 text-center hover:bg-gray-100 ${currentStyles.fontSize === s + 'px' ? 'bg-blue-50 text-blue-600' : ''}`}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Text Formatting */}
        <button onClick={() => selectedBlock && toggleTextStyle('bold')} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.fontWeight === '700' ? 'bg-gray-200' : ''}`}>
          <Bold className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && toggleTextStyle('italic')} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.fontStyle === 'italic' ? 'bg-gray-200' : ''}`}>
          <Italic className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && toggleTextStyle('underline')} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.textDecoration?.includes('underline') ? 'bg-gray-200' : ''}`}>
          <Underline className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && toggleTextStyle('strikethrough')} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.textDecoration?.includes('line-through') ? 'bg-gray-200' : ''}`}>
          <Strikethrough className="w-4 h-4 text-gray-700" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Colors */}
        <div className="relative">
          <button onClick={() => setShowColorMenu(!showColorMenu)} className="p-1.5 rounded hover:bg-gray-100 flex items-center gap-1">
            <span className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: currentStyles.color || '#000' }} />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border z-50">
              <div className="grid grid-cols-10 gap-1 mb-2">
                <span className="col-span-10 text-xs text-gray-500 mb-1">Text color</span>
                {COLORS.map(c => (
                  <button key={c} onClick={() => { selectedBlock && updateBlockStyles(selectedBlock.id, { color: c }); setShowColorMenu(false); saveToHistory(blocks); }}
                    className={`w-5 h-5 rounded border-2 cursor-pointer ${currentStyles.color === c ? 'ring-2 ring-blue-500' : 'border-gray-300'}`} 
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowHighlightMenu(!showHighlightMenu)} className="p-1.5 rounded hover:bg-gray-100 flex items-center gap-1">
            <Highlighter className="w-4 h-4 text-gray-700" />
            <div className="w-4 h-4 rounded border border-gray-400" style={{ backgroundColor: currentStyles.backgroundColor || 'transparent' }} />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border z-50">
              <div className="grid grid-cols-5 gap-1">
                <span className="col-span-5 text-xs text-gray-500 mb-1">Highlight color</span>
                {HIGHLIGHT_COLORS.map(c => (
                  <button key={c} onClick={() => { selectedBlock && updateBlockStyles(selectedBlock.id, { backgroundColor: c }); setShowHighlightMenu(false); saveToHistory(blocks); }}
                    className={`w-6 h-6 rounded border-2 cursor-pointer ${currentStyles.backgroundColor === c ? 'ring-2 ring-blue-500' : 'border-gray-300'}`} 
                    style={{ backgroundColor: c === 'transparent' ? '#fff' : c }} >
                    {c === 'transparent' && <span className="text-gray-400 text-xs">∅</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Alignment */}
        <button onClick={() => selectedBlock && updateBlockStyles(selectedBlock.id, { textAlign: 'left' })} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'left' || !currentStyles.textAlign ? 'bg-gray-200' : ''}`}>
          <AlignLeft className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && updateBlockStyles(selectedBlock.id, { textAlign: 'center' })} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'center' ? 'bg-gray-200' : ''}`}>
          <AlignCenter className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && updateBlockStyles(selectedBlock.id, { textAlign: 'right' })} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'right' ? 'bg-gray-200' : ''}`}>
          <AlignRight className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && updateBlockStyles(selectedBlock.id, { textAlign: 'justify' })} 
          className={`p-1.5 rounded hover:bg-gray-100 ${currentStyles.textAlign === 'justify' ? 'bg-gray-200' : ''}`}>
          <AlignJustify className="w-4 h-4 text-gray-700" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <button onClick={() => selectedBlock && updateBlock(selectedBlock.id, { type: 'bullet' })} 
          className={`p-1.5 rounded hover:bg-gray-100`}>
          <List className="w-4 h-4 text-gray-700" />
        </button>
        <button onClick={() => selectedBlock && updateBlock(selectedBlock.id, { type: 'numbered' })} 
          className={`p-1.5 rounded hover:bg-gray-100`}>
          <ListOrdered className="w-4 h-4 text-gray-700" />
        </button>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Line spacing */}
        <div className="relative">
          <button onClick={() => setShowLineSpacingMenu(!showLineSpacingMenu)} 
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-sm">
            <span className="text-xs">1.15</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
        </div>

        {/* Indent */}
        <button className="p-1.5 rounded hover:bg-gray-100">
          <IndentDecrease className="w-4 h-4 text-gray-700" />
        </button>
        <button className="p-1.5 rounded hover:bg-gray-100">
          <IndentIncrease className="w-4 h-4 text-gray-700" />
        </button>

        <div className="flex-1" />

        {/* AI Transform button */}
        {selectedIds.size > 0 && (
          <button onClick={() => setShowTransformModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI Transform
          </button>
        )}

        {/* More options */}
        <button className="p-1.5 rounded hover:bg-gray-100">
          <MoreHorizontal className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Floating Toolbar on Text Selection */}
      {showFloatingToolbar && selectedBlock && (
        <div 
          ref={floatingToolbarRef}
          className="fixed bg-white rounded-lg shadow-lg border flex items-center gap-0.5 p-1 z-50"
          style={{ 
            left: floatingToolbarPos.x, 
            top: floatingToolbarPos.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <button onClick={() => toggleTextStyle('bold')} 
            className={`p-1.5 rounded hover:bg-gray-100 ${selectedTextStyles.bold ? 'bg-gray-200' : ''}`}>
            <Bold className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => toggleTextStyle('italic')} 
            className={`p-1.5 rounded hover:bg-gray-100 ${selectedTextStyles.italic ? 'bg-gray-200' : ''}`}>
            <Italic className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => toggleTextStyle('underline')} 
            className={`p-1.5 rounded hover:bg-gray-100 ${selectedTextStyles.underline ? 'bg-gray-200' : ''}`}>
            <Underline className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => toggleTextStyle('strikethrough')} 
            className={`p-1.5 rounded hover:bg-gray-100 ${selectedTextStyles.strikethrough ? 'bg-gray-200' : ''}`}>
            <Strikethrough className="w-4 h-4 text-gray-700" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button className="p-1.5 rounded hover:bg-gray-100">
            <Link2 className="w-4 h-4 text-gray-700" />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100">
            <Highlighter className="w-4 h-4 text-gray-700" />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-1" />
          <button onClick={() => setShowTransformModal(true)} className="p-1.5 rounded hover:bg-gray-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      )}

      {/* Document Area */}
      <div className="p-8 pb-20">
        <div ref={editorRef} className="max-w-[850px] mx-auto bg-white min-h-[1100px] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] p-[60px_100px]">
          {blocks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">Start typing or click below to add content</p>
              <div className="flex justify-center gap-2">
                <button onClick={() => addBlock('heading1')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-sm">Add Heading 1</button>
                <button onClick={() => addBlock('heading2')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded font-semibold text-sm">Add Heading 2</button>
                <button onClick={() => addBlock('paragraph')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">Add Text</button>
              </div>
            </div>
          ) : (
            blocks.map(block => (
              <div
                key={block.id}
                data-block-id={block.id}
                onClick={(e) => {
                  handleSelect(block.id, e);
                  setSelectedIds(new Set([block.id]));
                }}
                className={`relative group mb-1 p-1 -mx-1 rounded cursor-text transition-colors ${selectedIds.has(block.id) ? '' : 'hover:bg-gray-50'}`}
              >
                <div className="absolute left-0 top-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className={`w-4 h-4 rounded-sm border-2 cursor-grab ${selectedIds.has(block.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-400 hover:border-gray-600'}`} 
                    style={{ backgroundColor: selectedIds.has(block.id) ? '#3b82f6' : '#fff' }} />
                </div>
                
                {selectedIds.has(block.id) ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    autoFocus
                    onInput={(e) => updateBlock(block.id, { content: e.currentTarget.textContent || '' })}
                    onBlur={saveBlockChanges}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const newBlock: TextBlock = {
                          id: `block-${Date.now()}`,
                          type: 'paragraph',
                          content: '',
                          styles: { fontFamily: 'Arial', fontSize: '16px' }
                        };
                        const idx = blocks.findIndex(b => b.id === block.id);
                        const newBlocks = [...blocks];
                        newBlocks.splice(idx + 1, 0, newBlock);
                        setBlocks(newBlocks);
                        saveToHistory(newBlocks);
                        setSelectedIds(new Set([newBlock.id]));
                      }
                    }}
                    className="outline-none leading-relaxed min-h-[1.5em]"
                    style={{
                      fontFamily: block.styles.fontFamily || 'Arial',
                      fontSize: block.styles.fontSize || '16px',
                      fontWeight: block.styles.fontWeight || '400',
                      fontStyle: block.styles.fontStyle || 'normal',
                      textDecoration: block.styles.textDecoration || 'none',
                      color: block.styles.color || '#202124',
                      textAlign: block.styles.textAlign || 'left',
                      backgroundColor: block.styles.backgroundColor || 'transparent',
                    }}
                  >
                    {block.content}
                  </div>
                ) : (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => { updateBlock(block.id, { content: e.currentTarget.textContent || '' }); saveBlockChanges(); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.textContent) {
                        e.preventDefault();
                        const newBlock: TextBlock = {
                          id: `block-${Date.now()}`,
                          type: 'paragraph',
                          content: '',
                          styles: { fontFamily: 'Arial', fontSize: '16px' }
                        };
                        const idx = blocks.findIndex(b => b.id === block.id);
                        const newBlocks = [...blocks];
                        newBlocks.splice(idx + 1, 0, newBlock);
                        setBlocks(newBlocks);
                        saveToHistory(newBlocks);
                        setSelectedIds(new Set([newBlock.id]));
                      }
                    }}
                    className="outline-none leading-relaxed cursor-text"
                    style={{
                      fontFamily: block.styles.fontFamily || 'Arial',
                      fontSize: block.styles.fontSize || '16px',
                      fontWeight: block.styles.fontWeight || '400',
                      fontStyle: block.styles.fontStyle || 'normal',
                      textDecoration: block.styles.textDecoration || 'none',
                      color: block.styles.color || '#202124',
                      textAlign: block.styles.textAlign || 'left',
                      backgroundColor: block.styles.backgroundColor || 'transparent',
                    }}
                  >
                    {block.type === 'bullet' ? <ul className="list-disc ml-6"><li>{block.content}</li></ul> : 
                     block.type === 'numbered' ? <ol className="list-decimal ml-6"><li>{block.content}</li></ol> : 
                     block.content || <span className="text-gray-300">Start typing...</span>}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add button at end */}
          <div className="mt-4 pt-4">
            <button onClick={() => addBlock('paragraph')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm ml-8">
              <Plus className="w-4 h-4" /> Click to add text, or paste an image
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 h-7 bg-[#f8f9fa] border-t border-gray-200 flex items-center justify-between px-4 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Suggestion: On</span>
          <span>Word count: {blocks.reduce((acc, b) => acc + b.content.split(/\s+/).filter(Boolean).length, 0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Document (unsaved)</span>
          <span>100%</span>
        </div>
      </div>

      {/* Transform Modal */}
      {showTransformModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTransformModal(false)}>
          <div className="bg-white rounded-xl p-6 w-[400px]" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-1">AI Transformation</h3>
            <p className="text-sm text-gray-500 mb-4">Transform your selected text with AI</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'translate', name: 'Translate', desc: 'To another language' },
                { id: 'enhance', name: 'Enhance', desc: 'Improve writing quality' },
                { id: 'summarize', name: 'Summarize', desc: 'Create a summary' },
                { id: 'expand', name: 'Expand', desc: 'Add more details' },
                { id: 'condense', name: 'Condense', desc: 'Shorten content' },
                { id: 'restructure', name: 'Restructure', desc: 'Reorganize text' },
              ].map(t => (
                <button key={t.id} onClick={() => { setTransformType(t.id); handleTransform(); }}
                  className={`p-3 rounded-lg border text-left hover:shadow-md transition-shadow ${transformType === t.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowTransformModal(false)} className="mt-4 w-full py-2 rounded bg-gray-100 hover:bg-gray-200 text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
