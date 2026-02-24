'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Type, Heading1, Table, Image, List, 
  Check, RotateCcw, ChevronDown, X
} from 'lucide-react';
import type { DocumentData, DocumentElement } from '@/types/document';

interface DocumentViewerProps {
  document: DocumentData;
  onSelectElements: (elements: DocumentElement[]) => void;
  onRevertElement: (elementId: string) => void;
  selectedElements: DocumentElement[];
}

const typeIcons: Record<string, typeof Type> = {
  paragraph: Type,
  heading: Heading1,
  table: Table,
  image: Image,
  list: List,
};

const typeColors: Record<string, string> = {
  paragraph: 'bg-blue-500/20 text-blue-400',
  heading: 'bg-purple-500/20 text-purple-400',
  table: 'bg-orange-500/20 text-orange-400',
  image: 'bg-green-500/20 text-green-400',
  list: 'bg-pink-500/20 text-pink-400',
};

export default function DocumentViewer({ 
  document, 
  onSelectElements, 
  onRevertElement,
  selectedElements 
}: DocumentViewerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const selectedIds = new Set(selectedElements.map(el => el.id));

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
      onSelectElements([...selectedElements, element]);
    }
  }, [selectedElements, selectedIds, document.elements, onSelectElements]);

  const handleBackgroundClick = useCallback(() => {
    onSelectElements([]);
  }, [onSelectElements]);

  const handleRevert = useCallback((elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onRevertElement(elementId);
  }, [onRevertElement]);

  const filteredElements = filter 
    ? document.elements.filter(el => el.type === filter)
    : document.elements;

  const uniqueTypes = [...new Set(document.elements.map(el => el.type))];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-zinc-200">{document.fileName}</h2>
          <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400 uppercase">
            {document.fileType}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setFilter(filter === null ? 'paragraph' : filter === 'paragraph' ? null : 'paragraph')}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
                ${filter === 'paragraph' ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}
              `}
            >
              <Type className="w-4 h-4" />
              <span>Text</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          
          {selectedElements.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleBackgroundClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
              <span>Clear ({selectedElements.length})</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6" onClick={handleBackgroundClick}>
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {filteredElements.map((element, index) => {
              const Icon = typeIcons[element.type] || Type;
              const isSelected = selectedIds.has(element.id);
              const isHovered = hoveredId === element.id;
              const isModified = element.content !== element.originalContent;

              return (
                <motion.div
                  key={element.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={(e) => handleElementClick(element, e)}
                  onMouseEnter={() => setHoveredId(element.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`
                    group relative rounded-xl transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'bg-indigo-500/15 ring-2 ring-indigo-500/50' 
                      : isHovered 
                        ? 'bg-zinc-800/50' 
                        : ''
                    }
                  `}
                >
                  <div className={`
                    absolute left-0 top-2 -translate-x-full pr-3 opacity-0 group-hover:opacity-100 transition-opacity
                    ${isSelected ? 'opacity-100' : ''}
                  `}>
                    <div className={`
                      w-6 h-6 rounded-md flex items-center justify-center
                      ${isSelected ? 'bg-indigo-500' : 'bg-zinc-700'}
                    `}>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <Icon className="w-3 h-3 text-zinc-400" />
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`
                        flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center mt-0.5
                        ${typeColors[element.type]}
                      `}>
                        <Icon className="w-3 h-3" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {element.type === 'image' ? (
                          <div 
                            className="rounded-lg overflow-hidden bg-zinc-800"
                            dangerouslySetInnerHTML={{ __html: element.html }}
                          />
                        ) : (
                          <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {element.content}
                          </p>
                        )}
                        
                        {isModified && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-amber-400">Modified</span>
                            <button
                              onClick={(e) => handleRevert(element.id, e)}
                              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Revert
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredElements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">No elements match the current filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
