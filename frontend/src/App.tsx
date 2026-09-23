import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/dashboard/Dashboard';
import MyDocuments from './pages/documents/MyDocuments';
import SharedWithMe from './pages/documents/SharedWithMe';
import DocumentDetail from './pages/details/DocumentDetail';
import { ThemeProvider, useTheme } from './components/common/ThemeProvider';
import { Toaster } from 'sonner';
import { Moon, Sun } from 'lucide-react';
import ProtectedRoute from './components/common/ProtectedRoute';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-[100] p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-lg transition-all hover:scale-110 active:scale-95"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="relative">
          <ThemeToggle />
          <Toaster position="top-right" richColors />
          <Routes>
            {/* Guest Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app">
                <Route index element={<Dashboard />} />
                <Route path="documents" element={<MyDocuments />} />
                <Route path="shared" element={<SharedWithMe />} />
                <Route path="documents/:id" element={<DocumentDetail />} />
              </Route>
            </Route>

            {/* Fallback: Redirect everything else to Landing Page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
