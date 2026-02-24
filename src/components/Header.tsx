'use client';

import { FileDown, RotateCcw, Undo2, Redo2, Moon, Sun, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  onExport: () => void;
  onNewDocument: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function Header({ 
  onExport, 
  onNewDocument, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo 
}: HeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="text-lg font-semibold text-zinc-200">DocAI</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </motion.button>

        <div className="w-px h-6 bg-zinc-800 mx-2" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewDocument}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">New</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          <span className="text-sm font-medium">Export</span>
        </motion.button>
      </div>
    </header>
  );
}
