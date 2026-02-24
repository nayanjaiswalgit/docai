'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Globe, Sparkles, Wand2, Check, 
  ArrowRight, Loader2 
} from 'lucide-react';
import type { TransformationType, TransformOptions, DocumentElement, TransformResult } from '@/types/document';
import { TRANSFORMATION_TYPES, LANGUAGES } from '@/types/document';
import { transformElements, getTransformationPrompt } from '@/utils/aiTransform';

interface TransformModalProps {
  isOpen: boolean;
  onClose: () => void;
  transformationType: TransformationType;
  selectedElements: DocumentElement[];
  onApply: (results: TransformResult[]) => void;
}

export default function TransformModal({
  isOpen,
  onClose,
  transformationType,
  selectedElements,
  onApply
}: TransformModalProps) {
  const [options, setOptions] = useState<TransformOptions>({
    targetLanguage: 'es',
    tone: 'professional',
    length: 'same'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TransformResult[]>([]);
  const [previewMode, setPreviewMode] = useState<'original' | 'transformed'>('original');

  const transform = TRANSFORMATION_TYPES.find(t => t.id === transformationType);
  const showLanguageSelect = transformationType === 'translate';
  const showToneSelect = transformationType === 'enhance';

  const handleTransform = async () => {
    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    
    try {
      const transformResults = await transformElements(
        selectedElements,
        transformationType,
        options,
        (completed, total) => {
          setProgress((completed / total) * 100);
        }
      );
      setResults(transformResults);
    } catch (error) {
      console.error('Transformation failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    onApply(results);
    onClose();
  };

  const handleClose = () => {
    setResults([]);
    setPreviewMode('original');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl"
        >
          <div className="flex items-center justify-between p-5 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-200">{transform?.name}</h2>
                <p className="text-sm text-zinc-500">{transform?.description}</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto max-h-[60vh]">
            {results.length === 0 ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                  <p className="text-sm text-zinc-400 mb-3">
                    {getTransformationPrompt(transformationType, options)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {selectedElements.length} element{selectedElements.length !== 1 ? 's' : ''} selected
                  </p>
                </div>

                {showLanguageSelect && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Target Language</label>
                    <select
                      value={options.targetLanguage}
                      onChange={(e) => setOptions({ ...options, targetLanguage: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {showToneSelect && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Tone</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['formal', 'casual', 'professional', 'friendly'] as const).map((tone) => (
                        <button
                          key={tone}
                          onClick={() => setOptions({ ...options, tone })}
                          className={`
                            px-4 py-2 rounded-lg text-sm capitalize transition-colors
                            ${options.tone === tone 
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50' 
                              : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent'
                            }
                          `}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Processing...</span>
                      <span className="text-zinc-500">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-800/50">
                  <button
                    onClick={() => setPreviewMode('original')}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                      ${previewMode === 'original' 
                        ? 'bg-zinc-700 text-zinc-200' 
                        : 'text-zinc-400 hover:text-zinc-200'
                      }
                    `}
                  >
                    Original
                  </button>
                  <button
                    onClick={() => setPreviewMode('transformed')}
                    className={`
                      flex-1 py-2 rounded-lg text-sm font-medium transition-colors
                      ${previewMode === 'transformed' 
                        ? 'bg-indigo-500/20 text-indigo-300' 
                        : 'text-zinc-400 hover:text-zinc-200'
                      }
                    `}
                  >
                    Transformed
                  </button>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={result.elementId}
                      className="p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/30"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {previewMode === 'original' ? (
                            <p className="text-sm text-zinc-400">{result.originalContent}</p>
                          ) : (
                            <p className="text-sm text-zinc-200 whitespace-pre-wrap">{result.transformedContent}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-5 border-t border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Check className="w-4 h-4 text-green-400" />
              <span>Preserves original formatting</span>
            </div>
            
            <div className="flex items-center gap-3">
              {results.length === 0 ? (
                <button
                  onClick={handleTransform}
                  disabled={isProcessing}
                  className="
                    flex items-center gap-2 px-5 py-2.5 rounded-xl
                    bg-indigo-500 hover:bg-indigo-600 text-white font-medium
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Transform
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setResults([])}
                    className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleApply}
                    className="
                      flex items-center gap-2 px-5 py-2.5 rounded-xl
                      bg-indigo-500 hover:bg-indigo-600 text-white font-medium
                      transition-colors
                    "
                  >
                    Apply Changes
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
