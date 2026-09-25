import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, FileText, LayoutDashboard, Share2, User, Shield } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuthStore } from '../../api/axiosInstance';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const getAvatarUrl = (username: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=b6e3f4`;
  };

  return (
    <div className="sticky top-0 z-50 w-full px-4 py-3">
      <nav className="relative mx-auto max-w-7xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300">
        {/* Colorful glow effect behind the navbar */}
        <div className="absolute -inset-px bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-sm opacity-20 dark:opacity-30 pointer-events-none" />

        <div className="relative flex h-16 items-center justify-between px-6">
          {/* LEFT: Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/app" className="flex items-center gap-2 group transition-all">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-none group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                Paper<span className="text-indigo-600 dark:text-indigo-400">Trail</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {[
                { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
                { to: '/app/documents', label: 'My Vault', icon: FileText },
                { to: '/app/shared', label: 'Shared', icon: Share2 },
              ].map((link) => {
                const isActive = window.location.pathname === link.to;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                      isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" /> {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT: User & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate('/app/profile')}
                className="cursor-pointer flex items-center gap-3 group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-none group-hover:text-indigo-600 transition-colors">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Vault Owner</p>
                </div>
                <div className="relative h-9 w-9 rounded-full p-0.5 bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-md group-hover:ring-2 ring-indigo-500 ring-offset-2 transition-all duration-300">
                  <img
                    src={getAvatarUrl(user?.username || 'User')}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover border border-white dark:border-slate-900"
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
