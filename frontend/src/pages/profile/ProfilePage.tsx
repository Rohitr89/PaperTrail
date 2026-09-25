import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Lock, Settings, ShieldCheck, Save, Calendar, Globe, Bell, CreditCard, Zap, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<{
    user: { id: string; username: string; role: string; createdAt: string };
    preferences: {
      pushNotificationsEnabled: boolean;
      isPublicProfile: boolean;
      autoRenewVault: boolean;
    };
  } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/users/me');
      setProfileData(res.data);
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please provide both current and new passwords');
      return;
    }
    setIsSaving(true);
    try {
      await api.post('/auth/update-password', {
        currentPassword,
        newPassword
      });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePreference = async (key: string, value: boolean) => {
    try {
      await api.patch('/users/preferences', { [key]: value });
      setProfileData(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, [key]: value }
      } : null);
      toast.success('Preference updated');
    } catch (err) {
      toast.error('Failed to update preference');
    }
  };

  const getAvatarUrl = (username: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;

  const { user, preferences } = profileData;

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* HEADER SECTION: User Identity */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="h-32 w-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl ring-4 ring-indigo-50 dark:ring-indigo-900/20"
              >
                <img
                  src={getAvatarUrl(user.username)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </motion.div>
              <div className="absolute bottom-2 right-2 h-6 w-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="text-center md:text-left space-y-3">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {user.username}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center md:justify-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" /> {user.role} Account
                </p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-widest">
                  Verified Vault User
                </span>
                <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                    <User className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Identity</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vault Unique ID</label>
                    <Input value={user.id} disabled className="bg-slate-50 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 font-mono text-xs text-indigo-600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Username</label>
                    <Input value={user.username} disabled className="bg-slate-50 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 font-medium" />
                  </div>
                </div>
              </Card>

              <Card className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
                    <Lock className="h-5 w-5 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Credential Update</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={isSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    {isSaving ? 'Updating...' : <><Save className="h-4 w-4" /> Save Changes</>}
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Vault Security Health</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Zap className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Encryption</span>
                  </div>
                  <p className="text-sm font-bold text-emerald-600">AES-256 GCM</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Session</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">JWT Secure</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Globe className="h-4 w-4" /> <span className="text-xs font-bold uppercase">Storage</span>
                  </div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Cloud-Encrypted</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">Preferences</h4>
              </div>
              <div className="space-y-3">
                <PreferenceItem
                  icon={<Bell className="h-4 w-4" />}
                  label="Push Notifications"
                  enabled={preferences.pushNotificationsEnabled}
                  onToggle={(val) => togglePreference('pushNotificationsEnabled', val)}
                />
                <PreferenceItem
                  icon={<Globe className="h-4 w-4" />}
                  label="Public Profile"
                  enabled={preferences.isPublicProfile}
                  onToggle={(val) => togglePreference('isPublicProfile', val)}
                />
                <PreferenceItem
                  icon={<CreditCard className="h-4 w-4" />}
                  label="Auto-Renew Vault"
                  enabled={preferences.autoRenewVault}
                  onToggle={(val) => togglePreference('autoRenewVault', val)}
                />
              </div>
            </Card>

            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 shadow-inner">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-indigo-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Security Tip</p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                    Your account uses transient RAM decryption. No plain-text data is ever saved to the server's disk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PreferenceItem({ icon, label, enabled, onToggle }: { icon: React.ReactNode; label: string; enabled: boolean; onToggle: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer" onClick={() => onToggle(!enabled)}>
      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className={`h-4 w-8 rounded-full transition-colors relative ${enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <div className={`absolute top-1 h-2 w-2 bg-white rounded-full transition-all ${enabled ? 'right-1' : 'left-1'}`}></div>
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
