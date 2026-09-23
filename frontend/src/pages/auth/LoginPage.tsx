import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, useAuthStore } from '@/api/axiosInstance';
import { motion } from 'framer-motion';
import { useSoundStore } from '@/store/soundStore';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const playSound = useSoundStore((state) => state.play);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      const { token, user } = response.data;
      setAuth(user, token);
      playSound('SUCCESS');
      navigate('/app');
    } catch (error) {
      playSound('ERROR');
      alert('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#f6f9fc] text-[#1a1f36]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md p-4"
      >
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-2">Enter your details to access PaperTrail</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>
          <div className="mt-8 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 font-bold underline underline-offset-4">Sign up</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
