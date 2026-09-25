import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Lock, UserCheck, Search, User } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface DocumentShare {
  id: string;
  document: {
    id: string;
    originalFileName: string;
    fileSize: number;
    createdAt: string;
  };
  permissionLevel: string;
  sharedByUsername?: string;
}

// Animation variants for the grid container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation variants for the individual cards
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
};

export default function SharedWithMe() {
  const navigate = useNavigate();
  const [sharedDocs, setSharedDocs] = useState<DocumentShare[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSharedDocs();
  }, []);

  const fetchSharedDocs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/shares/shared-with-me');
      const shares = res.data;

      if (!shares || shares.length === 0) {
        setSharedDocs([]);
        return;
      }

      const hydratedDocs = shares.map((share: any) => ({
          ...share,
          documentId: share.document?.id || share.documentId,
          originalFileName: share.document?.originalFileName || share.originalFileName || 'Shared Document',
          fileSize: share.document?.fileSize || share.fileSize || 0,
          sharedByUsername: share.sharedByUsername || 'Owner'
      }));

      setSharedDocs(hydratedDocs);
    } catch (err) {
      console.error("Fetch shared docs error:", err);
      toast.error('Could not fetch shared documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (docId: string) => {
    if (!docId) {
      toast.error("Invalid document ID");
      return;
    }
    navigate(`/app/documents/${docId}`);
  };

  const filteredDocs = sharedDocs.filter(doc =>
    doc.originalFileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.sharedByUsername?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      {/* ENHANCED BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none dark:opacity-10" />

      <div className="relative z-10 p-6 space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Shared With Me</h1>
            <p className="text-slate-500 dark:text-slate-400">Documents that other users have granted you access to.</p>
          </div >

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search by name or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full md:w-80 focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div >
        </div >

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          ) : filteredDocs.length > 0 ? (
            <motion.div
              key="grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 gap-8"
            >
              {filteredDocs.map((share, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  <Card className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                    {/* MAC-STYLE TOP CONTROLS */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleView(share.documentId)}
                          className="h-3 w-3 rounded-full bg-yellow-400 cursor-pointer hover:ring-2 ring-yellow-200 transition-all"
                          title="Details"
                        />
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleView(share.documentId)}
                          className="h-3 w-3 rounded-full bg-emerald-500 cursor-pointer hover:ring-2 ring-emerald-200 transition-all"
                          title="Open"
                        />
                      </div >
                    </div >

                    <div className="p-8 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                          <FileText className="h-8 w-8" />
                        </div >
                      </div >

                      <div className="space-y-3">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors" title={share.originalFileName}>
                          {share.originalFileName}
                        </h3>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 w-fit px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <User className="h-3 w-3" />
                            <span>Shared by: <span className="text-indigo-600 dark:text-indigo-400 font-bold">@{share.sharedByUsername}</span></span>
                          </div >

                          <div className="flex items-center gap-3 text-sm text-slate-400">
                            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full font-bold uppercase tracking-wider text-[10px]">
                              {share.permissionLevel || 'VIEW'}
                            </span>
                            <span className="opacity-30">•</span>
                            <span className="font-medium">{share.fileSize ? `${(share.fileSize / 1024).toFixed(2)} KB` : 'Unknown size'}</span>
                          </div >
                        </div >
                      </div >
                    </div >

                    <div className="mt-auto p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                        onClick={() => handleView(share.documentId)}
                      >
                        Open Document →
                      </Button>
                    </div >
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700"
            >
              <Lock className="h-12 w-12 mx-auto mb-4 text-slate-300 opacity-50" />
              <p className="text-slate-500 font-medium">No documents have been shared with you yet.</p>
              <p className="text-sm text-slate-400">When someone shares a file, it will appear here instantly.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div >
    </div >
  );
}
