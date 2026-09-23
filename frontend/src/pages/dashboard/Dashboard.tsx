import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/axiosInstance';
import { Lock, FileText, HardDrive, Users, Plus, Search, Download, Trash2, MoreVertical, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Document } from '@/types';

export default function Dashboard() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await api.post('/documents/upload', formData);
      toast.success('Document encrypted and stored successfully!');
      await fetchDocs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalStorage = docs.reduce((acc, doc) => acc + doc.fileSize, 0);
  const filteredDocs = docs.filter(d => d.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* HIDDEN FILE INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.png"
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Vault Overview</h1>
          <p className="text-slate-500 mt-1">Manage your encrypted assets and sharing permissions.</p>
        </div>
        <Button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Upload Document
            </>
          )}
        </Button>
      </div>

      {/* ... (Rest of the Bento Grid and Table remains the same) ... */}

      {/* BENTO STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Documents</p>
              <p className="text-2xl font-bold text-slate-900">{docs.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Storage Used</p>
              <p className="text-2xl font-bold text-slate-900">
                {(totalStorage / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-white p-6 rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Shared Access</p>
              <p className="text-2xl font-bold text-slate-900">Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* MAIN VAULT TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">Recent Documents</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
              placeholder="Search your vault..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading vault...
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <FileText className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-700">{doc.originalFileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {(doc.fileSize / 1024).toFixed(2)} KB
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No documents found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
