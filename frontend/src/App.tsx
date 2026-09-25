import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/dashboard/Dashboard';
import MyDocuments from './pages/documents/MyDocuments';
import SharedWithMe from './pages/documents/SharedWithMe';
import DocumentDetail from './pages/details/DocumentDetail';
import ProfilePage from './pages/profile/ProfilePage';
import { ThemeProvider } from './components/common/ThemeProvider';
import { Toaster } from 'sonner';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        {/* CHANGED: Removed "bg-white text-black" which was forcing a flat white background on every page */}
        <div className="min-h-screen transition-colors duration-300">
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/app" element={
              <div className="flex flex-col">
                <Navbar />
                <Dashboard />
              </div>
            } />
            <Route path="/app/documents" element={
              <div className="flex flex-col">
                <Navbar />
                <MyDocuments />
              </div>
            } />
            <Route path="/app/shared" element={
              <div className="flex flex-col">
                <Navbar />
                <SharedWithMe />
              </div>
            } />
            <Route path="/app/profile" element={
              <div className="flex flex-col">
                <Navbar />
                <ProfilePage />
              </div>
            } />
            <Route path="/app/documents/:id" element={
              <div className="flex flex-col">
                <Navbar />
                <DocumentDetail />
              </div>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
