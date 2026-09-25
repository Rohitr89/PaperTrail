import React from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Info } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'info' | 'success' | 'error';
  onClose: () => void;
}

export const DraggableNotification = ({ message, type = 'info', onClose }: NotificationProps) => {
  return (
    <motion.div
      drag
      // The dragConstraints allow it to move anywhere on the screen
      dragConstraints={{ left: -window.innerWidth, right: window.innerWidth, top: -window.innerHeight, bottom: window.innerHeight }}
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      whileDrag={{
        scale: 1.05,
        cursor: 'grabbing',
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
      className="fixed top-10 right-10 z-[9999] min-w-[320px] max-w-md"
    >
      {/* The Circular Glow - This adds a subtle moving "aura" around the notification */}
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-md opacity-40 dark:opacity-60 pointer-events-none"
      />

      <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
        {/* Header / Drag Handle */}
        <div className="bg-slate-100/50 dark:bg-slate-800/50 px-4 py-2 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Bell className="h-3 w-3" />
            System Notification
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            <X className="h-3 w-3 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex items-start gap-3">
          <div className={`p-2 rounded-xl shadow-sm ${
            type === 'success' ? 'bg-emerald-100 text-emerald-600' :
            type === 'error' ? 'bg-red-100 text-red-600' :
            'bg-indigo-100 text-indigo-600'
          }`}>
            <Info className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
