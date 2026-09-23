import React from 'react';
import { motion } from 'framer-motion';

export default function SharedWithMe() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Shared With Me</h1>
      <div className="border rounded-xl p-12 text-center text-slate-500 bg-card">
        No documents have been shared with you yet.
      </div>
    </motion.div>
  );
}
