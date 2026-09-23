import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Zap, FileText, ArrowRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative bg-[#f6f9fc] text-[#1a1f36] overflow-x-hidden">
      {/* --- SECTION 1: THE CINEMATIC HERO --- */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/50 rounded-full blur-[120px] pointer-events-//none" />

        <div className="text-center z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-600 text-xs font-bold mb-6"
          >
            <Zap className="h-3 w-3" /> NOW AVAILABLE v1.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-6 text-slate-900"
          >
            Your Documents.<br />Redefined.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Enter the next generation of secure storage. Military-grade encryption
            meets a seamless, cinematic experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <button
              onClick={() => {
                console.log("Click detected!");
                navigate('/signup');
              }}
              className="h-14 px-8 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-indigo-200"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              className="h-14 px-8 rounded-full text-slate-600 hover:bg-slate-100 font-medium text-lg transition-all"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
          <ChevronDown className="h-5 w-5" />
        </motion.div>
      </section>

      {/* --- SECTION 2: FEATURES --- */}
      <section className="py-32 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Lock className="h-8 w-8 text-indigo-600" />,
                title: "AES-256 Encryption",
                desc: "Every byte is encrypted before it touches the disk. Only you hold the keys."
              },
              {
                icon: <Shield className="h-8 w-8 text-indigo-600" />,
                title: "Zero-Trust Architecture",
                desc: "Stateless JWT authentication ensures that every request is verified and secure."
              },
              {
                icon: <FileText className="h-8 w-8 text-indigo-600" />,
                title: "Instant Sharing",
                desc: "Grant access to your colleagues in seconds with precise permission java-trail"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.2 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-300 transition-all group"
              >
                <div className="mb-4 p-3 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
