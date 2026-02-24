'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, Globe, Scissors, Search, Layout, 
  Plus, Expand, Shrink, Wand2 
} from 'lucide-react';
import type { TransformationType, DocumentElement } from '@/types/document';
import { TRANSFORMATION_TYPES } from '@/types/document';

interface AIToolbarProps {
  selectedCount: number;
  onTransform: (type: TransformationType) => void;
  isProcessing: boolean;
}

const iconMap: Record<string, typeof Sparkles> = {
  translate: Globe,
  enhance: Sparkles,
  summarize: Scissors,
  gapAnalysis: Search,
  restructure: Layout,
  addData: Plus,
  expand: Expand,
  condense: Shrink,
};

export default function AIToolbar({ selectedCount, onTransform, isProcessing }: AIToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-2 py-2 rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-1 px-3 py-2 border-r border-zinc-800">
          <Wand2 className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-medium text-zinc-300">
            {selectedCount} selected
          </span>
        </div>

        <div className="flex items-center gap-1 px-1">
          {TRANSFORMATION_TYPES.map((transform) => {
            const Icon = iconMap[transform.id];
            return (
              <motion.button
                key={transform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTransform(transform.id as TransformationType)}
                disabled={isProcessing}
                className="
                  relative flex flex-col items-center gap-1 p-2 rounded-xl
                  text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium">{transform.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
