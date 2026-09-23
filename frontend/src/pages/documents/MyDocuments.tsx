import React from 'react';
import { motion } from 'framer-motion';

export default function MyDocuments() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Vault</h1>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium">Upload File</button>
      </div>
      <div className="border rounded-xl p-12 text-center text-slate-500 bg-card">
        No documents found. Start by uploading your first file!
      </div>
    </motion.div>
  );
}
