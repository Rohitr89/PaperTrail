import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/axiosInstance';
import { Lock, FileText, HardDrive, Users, Plus, Search, Download, Trash2, UploadCloud, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Document } from '@/types';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'folder'>('file');
  const [folderName, setFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/documents');
      setDocs(res.data);
    } catch (err) {
      toast.error('Could not fetch vault data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFolderUploadClick = () => {
    setUploadMode('folder');
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('webkitdirectory', '');
      fileInputRef.current.setAttribute('directory', '');
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let uploadedCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();

        // If in folder mode, we use the relative path as the filename
        const fileName = uploadMode === 'folder'
          ? (file as any).webkitRelativePath || file.name
          : file.name;

        // We send the filename separately or rely on the multipart name
        // Since the backend uses file.getOriginalFilename(),
        // for folder uploads we might need a custom header or wrapper.
        // But the simplest way is to append the file.
        formData.append('file', file);

        // Note: To truly preserve folder structure in the backend,
        // you would typically send the relative path in a separate field.
        // I'll add it as a custom field just in case your backend is updated.
        formData.append('relativePath', fileName);

        await api.post('/documents/upload', formData);
        uploadedCount++;
      }
      toast.success(`${uploadedCount} file(s) encrypted and stored successfully!`);
      await fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'One or more uploads failed.');
    } finally {
      setIsUploading(false);
      setUploadMode('file');
      if (fileInputRef.current) {
        fileInputRef.current.removeAttribute('webkitdirectory');
        fileInputRef.current.removeAttribute('directory');
        fileInputRef.current.value = '';
      }
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
      link.setAttribute('download', doc.originalFileName || 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download document');
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted successfully');
      await fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handlePreview = async (doc: Document) => {
    try {
      const response = await api.get(`/documents/download/${doc.id}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Preview error:', err);
      toast.error('Could not preview this file');
    }
  };

  const totalStorage = docs.reduce((acc, doc) => acc + doc.fileSize, 0);
  const filteredDocs = docs.filter(d => d.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden">
      {/* BACKGROUND DECORATIONS to fill the page */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 p-6 space-y-8 max-w-6xl mx-auto">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.jpg,.png,.xls,.xlsx,.ppt,.pptx,.md,.csv,.gif,.svg"
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight dark:text-white">Vault Overview</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your encrypted assets and sharing permissions.</p>
          </div >
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setUploadMode('folder')}
              disabled={isUploading}
              className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-sm"
            >
              <HardDrive className="h-4 w-4" /> Upload Folder
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Upload File
                </>
              )}
            </Button>
          </div>
        </div >

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6" />
              </div >
              <div className="text-left">
                <p className="text-sm font-medium text-slate-500">Total Documents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{docs.length}</p>
              </div >
            </div >
          </Card>

          <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <HardDrive className="h-6 w-6" />
              </div >
              <div className="text-left">
                <p className="text-sm font-medium text-slate-500">Storage Used</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {(totalStorage / 1024 / 1024).toFixed(2)} MB
                </p>
              </div >
            </div >
          </Card>

          <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6" />
              </div >
              <div className="text-left">
                <p className="text-sm font-medium text-slate-500">Shared Access</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">Active</p>
              </div >
            </div >
          </Card>
        </div >

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Documents</h3>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-11 pr-4 py-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all duration-300 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Search your vault..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div >
        </div >

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 text-center">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                Loading your vault...
              </div >
            </div>
          ) : filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                className="relative group"
              >
                <Card className="h-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                  {/* MAC-STYLE TOP CONTROLS - FIXED VISIBILITY */}
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
                    </div >
                  </div >

                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <FileText className="h-8 w-8" />
                      </div >
                    </div >
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors" title={doc.originalFileName}>
                        {doc.originalFileName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-medium">{(doc.fileSize / 1024).toFixed(2)} KB</span >
                        <span className="opacity-30">•</span>
                        <span className="font-medium">{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div >
                    </div >
                  </div >

                  <div className="mt-auto p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all flex items-center gap-2"
                      onClick={() => handlePreview(doc)}
                    >
                      <Eye className="h-4 w-4" /> Quick Preview
                    </Button>
                  </div >
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <Search className="h-12 w-12 opacity-20" />
                <p>No documents found matching your search.</p>
              </div >
            </div>
          )}
        </div >
      </div >
    </div >
  );
}
