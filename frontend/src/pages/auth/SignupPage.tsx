import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/axiosInstance';
import { motion } from 'framer-motion';
import { useSoundStore } from '@/store/soundStore';
import { UserPlus, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'USER' });
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number, label: string, color: string } | null>(null);
  const navigate = useNavigate();
  const playSound = useSoundStore((state) => state.play);

  useEffect(() => {
    const password = formData.password;
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    let score = 0;
    let label = 'Too Weak';
    let color = 'text-red-500';

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score === 1) { label = 'Weak'; color = 'text-orange-500'; }
    else if (score === 2) { label = 'Medium'; color = 'text-yellow-500'; }
    else if (score === 3) { label = 'Strong'; color = 'text-green-400'; }
    else if (score === 4) { label = 'Very Strong'; color = 'text-emerald-400'; }

    setPasswordStrength({ score, label, color });
  }, [formData.password]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordStrength || passwordStrength.score < 2) {
      playSound('ERROR');
      toast.error('Password is too weak. Please make it stronger!');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/register', formData);
      playSound('SUCCESS');
      toast.success('Account initialized successfully!');
      navigate('/login');
    } catch (error: any) {
      playSound('ERROR');
      toast.error(error.response?.data?.message || 'Registration failed. User might already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950 text-slate-200 transition-colors duration-300">
      {/* Aurora Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '600px',
            height: '600px',
            backgroundColor: '#4f46e5',
            filter: 'blur(120px)',
            borderRadius: '50%',
            opacity: 0.4
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '800px',
            height: '800px',
            backgroundColor: '#7c3aed',
            filter: 'blur(120px)',
            borderRadius: '50%',
            opacity: 0.4
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md p-4"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-10 ring-1 ring-white/10">
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-indigo-500/20 text-indigo-400 rounded-2xl mb-6 ring-1 ring-indigo-500/30">
              <UserPlus className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white mb-2">
              Create Identity
            </h1>
            <p className="text-slate-400 text-sm">
              Join the PaperTrail secure network
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                Username
              </label>
              <div className="relative">
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              {passwordStrength && (
                <div className="mt-3 px-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold uppercase ${passwordStrength.color}`}>{passwordStrength.label}</span>
                    <span className="text-xs text-slate-500">{passwordStrength.score}/4</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        passwordStrength.score <= 1 ? 'bg-red-500' :
                        passwordStrength.score === 2 ? 'bg-orange-500' :
                        passwordStrength.score === 3 ? 'bg-yellow-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-[0.98]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Initializing...' : 'Begin Registration'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Already have an identity?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline underline-offset-4">
              Access Vault
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
