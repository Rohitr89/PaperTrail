import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Download, FileText, ShieldCheck, Share2, Users, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Document } from '@/types';

interface ShareUser {
  userId: string;
  username: string;
  permissionLevel: string;
}

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>('application/pdf');

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAccessListOpen, setIsAccessListOpen] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState('');
  const [sharedUsers, setSharedUsers] = useState<ShareUser[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        // We fetch all documents and find the one with the matching ID
        const res = await api.get('/documents');
        const found = res.data.find((d: Document) => d.id === id);
        if (found) {
          setDoc(found);
        } else {
          // If not found in "my documents", it might be a shared one we are viewing
          // In a real app, we'd have GET /api/documents/{id}
          toast.error('Document not found or access denied');
          navigate('/app');
        }
      } catch (err) {
        toast.error('Failed to fetch document details');
        navigate('/app');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDocumentDetails();
  }, [id, navigate]);

  useEffect(() => {
    if (doc) {
      loadPreview();
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [doc]);

  const loadPreview = async () => {
    try {
      const response = await api.get(`/documents/download/${id}`, {
        responseType: 'blob',
      });
      const contentType = response.headers['content-type'] || 'application/pdf';
      setPreviewType(contentType);
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Preview load error:', err);
      toast.error('Could not load document preview');
    }
  };

  const handleDownload = async () => {
    if (!doc) return;
    try {
      const response = await api.get(`/documents/download/${doc.id}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      toast.error('Download failed');
    }
  };

  const handleShare = async () => {
    if (!recipientUsername) {
      toast.error('Please enter a username');
      return;
    }
    setIsSharing(true);
    try {
      await api.post('/shares/grant', {
        documentId: id,
        recipientUsername: recipientUsername,
        permissionLevel: 'VIEW'
      });
      toast.success(`Shared successfully with ${recipientUsername}`);
      setRecipientUsername('');
      setIsShareModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to share document');
    } finally {
      setIsSharing(false);
    }
  };

  const fetchAccessList = async () => {
    try {
      const res = await api.get(`/shares/document/${id}`);
      setSharedUsers(res.data.map((s: any) => ({
        userId: s.sharedWithUser?.id || s.userId,
        username: s.sharedWithUser?.username || s.username,
        permissionLevel: s.permissionLevel
      })));
    } catch (err) {
      toast.error('Failed to fetch access list');
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      await api.delete(`/shares/revoke/${id}/${userId}`);
      toast.success('Access revoked successfully');
      fetchAccessList();
    } catch (err: any) {
      toast.error(err.response?.data?.Error || 'Failed to revoke access');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doc) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <Button
          variant="ghost"
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Vault
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsAccessListOpen(true);
              fetchAccessList();
            }}
            className="flex items-center gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400"
          >
            <Users className="h-4 w-4" /> Access List
          </Button>
          <Button
            onClick={() => setIsShareModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 rounded-xl shadow-md shadow-indigo-100 dark:shadow-none"
          >
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white flex items-center gap-2 rounded-xl"
          >
            <Download className="h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl h-[75vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                {doc.originalFileName}
              </span>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
              {previewUrl ? (
                previewType.startsWith('image/') ? (
                  <img src={previewUrl} className="w-full h-full object-contain p-4" alt="Preview" />
                ) : (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-none"
                    title="Document Preview"
                  />
                )
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p>Preview not available for this file type.</p>
                  <p className="text-sm">Please download the file to view it.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Document Security
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-sm">File Name</span>
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium truncate max-w-[150px]">
                  {doc.originalFileName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-sm">Size</span>
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {(doc.fileSize / 1024).toFixed(2)} KB
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 text-sm">Created At</span>
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-sm">Status</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">
                  Encrypted
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
              This document is stored in your private vault using AES-256 encryption.
              Only authorized users with the correct decryption key can access this content.
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-4">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Share Document</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsShareModalOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500">Recipient Username</label>
                  <Input
                    placeholder="Enter username (e.g. johndoe)"
                    value={recipientUsername}
                    onChange={(e) => setRecipientUsername(e.target.value)}
                    className="rounded-xl h-12 px-4"
                  />
                </div>
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {isSharing ? 'Granting Access...' : 'Grant View Access'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAccessListOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-4">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Access Management</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAccessListOpen(false)} className="rounded-full">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-4">
                {sharedUsers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sharedUsers.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{user.username}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{user.permissionLevel}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevoke(user.userId)}
                          className="h-9 w-9 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Revoke Access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No one else has access to this file.</p>
                    <p className="text-sm">You are the sole owner of this document.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
