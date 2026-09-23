import React from 'react';
import { motion } from 'framer-motion';

export default function DocumentDetail() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Document Details</h1>
      <div className="p-6 bg-card border rounded-xl shadow-sm">
        <p className="text-slate-500">Select a document to view its details and sharing options.</p>
      </div>
    </motion.div>
  );
}
