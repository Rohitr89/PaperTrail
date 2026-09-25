import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, useAuthStore } from '@/api/axiosInstance';
import { motion } from 'framer-motion';
import { useSoundStore } from '@/store/soundStore';
import { Lock, User } from 'lucide-react';

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
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-slate-950 text-slate-200 transition-colors duration-300">
      {/* Aurora Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
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
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
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
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-800 p-8 ring-1 ring-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl mb-4 ring-1 ring-indigo-500/30">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-slate-400 mt-2">Enter your details to access PaperTrail</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder:text-slate-600"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Continue'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
