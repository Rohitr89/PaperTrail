import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut, FileText, LayoutDashboard, Share2, User } from 'lucide-react';
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <FileText className="h-6 w-6" />
            <span>PaperTrail</span>
          </Link>

          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
            <Link to="/documents" className="flex items-center gap-1 hover:text-primary transition-colors">
              <FileText className="h-4 w-4" /> My Vault
            </Link>
            <Link to="/shared" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Share2 className="h-4 w-4" /> Shared
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="p-1"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>

          <div className="h-6 w-px bg-border mx-2" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium hidden sm:inline-block">{user?.username}</span>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </nav>
  );
}
