import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/axiosInstance';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Download, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function MyDocuments() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const fetchMyDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/documents');
      setDocs(res.data);
    } catch (err) {
      toast.error('Could not fetch your vault documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await api.get(`/documents/download/${doc.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalFileName || 'download');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Permanently delete this document?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted');
      fetchMyDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredDocs = docs.filter(d =>
    d.originalFileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 p-6 space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">My Vault</h1>
            <p className="text-slate-500 dark:text-slate-400">Your privately encrypted personal assets.</p>
          </div>
          <Button
            onClick={() => navigate('/app')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl"
          >
            Go to Dashboard
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">All Documents</h3>
          <div className="relative w-full md:w-80">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Eye className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
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
                        onClick={() => handleDelete(doc.id)}
                        className="h-3 w-3 rounded-full bg-red-500 cursor-pointer hover:ring-2 ring-red-200 transition-all"
                        title="Delete"
                      />
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate(`/app/documents/${doc.id}`)}
                        className="h-3 w-3 rounded-full bg-yellow-400 cursor-pointer hover:ring-2 ring-yellow-200 transition-all"
                        title="Details"
                      />
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDownload(doc)}
                        className="h-3 w-3 rounded-full bg-emerald-500 cursor-pointer hover:ring-2 ring-emerald-200 transition-all"
                        title="Download"
                      />
                    </div>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <FileText className="h-8 w-8" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors" title={doc.originalFileName}>
                        {doc.originalFileName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-medium">
                          <ShieldCheck className="h-3 w-3" /> Encrypted
                        </span>
                        <span className="opacity-30">•</span>
                        <span className="font-medium">{(doc.fileSize / 1024).toFixed(2)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                      onClick={() => navigate(`/app/documents/${doc.id}`)}
                    >
                      Details
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300 opacity-50" />
            <p className="text-slate-500 font-medium">Your vault is currently empty.</p>
            <p className="text-sm text-slate-400">Upload your first encrypted document to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
