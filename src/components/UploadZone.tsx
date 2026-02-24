'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseDocument } from '@/utils/documentProcessor';
import type { DocumentData } from '@/types/document';

interface UploadZoneProps {
  onDocumentLoaded: (doc: DocumentData) => void;
}

export default function UploadZone({ onDocumentLoaded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(async (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.docx'];
    
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!validTypes.includes(file.type) && !hasValidExtension) {
      setError('Please upload PDF or DOCX files only');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setUploadedFile(file);
    
    try {
      const docData = await parseDocument(file);
      docData.fileName = file.name;
      onDocumentLoaded(docData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document');
      setIsLoading(false);
      setUploadedFile(null);
    }
  }, [onDocumentLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300
            ${isDragging 
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
            }
            ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}
          `}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30"></div>
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-zinc-200">Processing document...</p>
                    <p className="text-sm text-zinc-500 mt-1">{uploadedFile?.name}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isDragging ? 'bg-indigo-500/20 scale-110' : 'bg-zinc-800'}
                  `}>
                    <Upload className={`w-10 h-10 transition-colors ${isDragging ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  </div>
                  
                  <div>
                    <p className="text-xl font-semibold text-zinc-200">
                      {isDragging ? 'Drop your file here' : 'Upload Document'}
                    </p>
                    <p className="text-sm text-zinc-500 mt-2">
                      Drag & drop PDF or DOCX files, or click to browse
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50">
                      <FileText className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-zinc-400">PDF</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50">
                      <File className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-zinc-400">DOCX</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
      
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
