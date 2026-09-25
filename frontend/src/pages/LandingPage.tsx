import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Zap, FileText, ArrowRight, ChevronDown, Globe, Fingerprint, Cpu, Layers, EyeOff, CheckCircle2, Database, Smartphone, Clock, Key } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

  // Parallax effects for the aurora blobs
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div className="relative bg-slate-950 text-slate-200 overflow-x-hidden transition-colors duration-300 selection:bg-indigo-500/30">
      {/* --- TOP NAVIGATION BAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/50">
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">PaperTrail</span>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Sign In</Link>
          <Link to="/signup" className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95">Join Now</Link>
        </div>
      </nav>

      {/* --- SECTION 1: THE CINEMATIC HERO --- */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            style={{ y: y1 }}
            className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/30 blur-[120px] rounded-full"
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-purple-600/30 blur-[120px] rounded-full"
          />
        </div>

        <div className="text-center z-10 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-6 ring-1 ring-indigo-500/20"
          >
            <Zap className="h-3 w-3" /> THE FUTURE OF SECURE STORAGE v1.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-9xl font-black tracking-tighter mb-6 text-white leading-[0.9]"
          >
            Your Vault.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Absolute Privacy.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light"
          >
            PaperTrail isn't just a cloud drive. It's a <span className="text-white font-medium">military-grade encryption engine</span> that turns your documents into invisible assets.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6"
          >
            <button onClick={() => navigate('/signup')} className="h-16 px-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-500 font-bold text-xl transition-all hover:scale-105 shadow-2xl shadow-indigo-500/40 flex items-center gap-2 active:scale-95">
              Secure Your Data <ArrowRight className="h-6 w-6" />
            </button>
            <button onClick={() => navigate('/login')} className="h-16 px-10 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 font-medium text-xl transition-all active:scale-95">
              Sign In
            </button>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center gap-2"
        >
          <span className="text-xs uppercase tracking-widest font-bold">Explore the Fortress</span>
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      {/* --- SECTION 2: THE "SENSORY" EXPERIENCE (The "Video-like" scroll) --- */}
      <section className="py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">How it Works</h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">A seamless pipeline from raw file to encrypted asset.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* STEP 1 */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all backdrop-blur-md"
            >
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-slate-950">1</div>
              <div className="mb-6 p-4 bg-indigo-500/10 rounded-2xl w-fit text-indigo-400 ring-1 ring-indigo-500/30">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Upload</h3>
              <p className="text-slate-400 leading-relaxed">Drag and drop any file. Our client-side engine begins the encryption process before the file even leaves your browser.</p>
              <div className="mt-6 h-32 bg-slate-800/50 rounded-xl overflow-hidden relative border border-slate-700">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent w-1/2"
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-500">UPLOADING...</div>
              </div>
            </motion.div>

            {/* STEP 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-all backdrop-blur-md"
            >
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-slate-950">2</div>
              <div className="mb-6 p-4 bg-purple-500/10 rounded-2xl w-fit text-purple-400 ring-1 ring-purple-500/30">
                <Cpu className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AES-256 Tunnel</h3>
              <p className="text-slate-400 leading-relaxed">Files are wrapped in military-grade AES-256 layers. We use salted hashes to ensure no two files look the same.</p>
              <div className="mt-6 h-32 bg-slate-800/50 rounded-xl overflow-hidden relative border border-slate-700 flex items-center justify-center gap-2">
                {[1,2,3,4,5].map(i => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i*0.2 }}
                    className="h-2 w-2 bg-purple-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>

            {/* STEP 3 */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all backdrop-blur-md"
            >
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-slate-950">3</div>
              <div className="mb-6 p-4 bg-emerald-500/10 rounded-2xl w-fit text-emerald-400 ring-1 ring-emerald-500/30">
                <Database className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Zero-Knowledge Vault</h3>
              <p className="text-slate-400 leading-relaxed">Your data lands in an encrypted shard. Not even our developers can read your files. Total privacy, guaranteed.</p>
              <div className="mt-6 h-32 bg-slate-800/50 rounded-xl overflow-hidden relative border border-slate-700 p-4">
                <div className="flex flex-col gap-2">
                  <div className="h-2 w-full bg-slate-700 rounded-full animate-pulse" />
                  <div className="h-2 w-3/4 bg-slate-700 rounded-full animate-pulse delay-75" />
                  <div className="h-2 w-5/6 bg-slate-700 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SECTION 3: THE TECH STACK (Grid) --- */}
      <section className="py-32 px-4 relative bg-slate-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-bold text-white leading-tight">Uncompromising<br />Security Stack.</h2>
                <p className="text-xl text-slate-400">We didn't cut corners. We built a fortress.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: <Key className="h-6 w-6" />, title: "Key Management", text: "Hardware-level key isolation." },
                  { icon: <Clock className="h-6 w-6" />, title: "Audit Trails", text: "Every access is logged & verified." },
                  { icon: <Layers className="h-6 w-6" />, title: "Multi-Layer", text: "Redundant encryption shards." },
                  { icon: <Shield className="h-6 w-6" />, title: "SSL/TLS 1.3", text: "Perfect forward secrecy tunnels." },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:bg-slate-800 transition-all group">
                    <div className="text-indigo-400 mb-3 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <h4 className="text-white font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative p-8 bg-indigo-600/10 rounded-[40px] border border-indigo-500/20 backdrop-blur-sm">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full" />
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white">The PaperTrail Promise</h3>
                <div className="space-y-4">
                  {[
                    "Your keys, your data. Period.",
                    "No backdoors for government or corporate entities.",
                    "Instant, encrypted sharing with zero leak risk.",
                    "Cinematic UI that makes security effortless."
                  ].map((text, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800 ring-1 ring-white/5">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                      <span className="text-slate-300 font-medium">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 px-4 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="text-6xl font-black text-white mb-8 tracking-tighter"
          >
            Own Your <br /><span className="text-indigo-400">Digital Sovereignty.</span>
          </motion.h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-light">
            Stop trusting third-party corporations with your secrets. <br />
            Start trusting mathematics.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="h-20 px-16 rounded-full bg-white text-slate-950 hover:bg-slate-100 font-black text-2xl transition-all hover:scale-105 shadow-2xl active:scale-95"
          >
            Enter The Vault Now
          </button>
        </div>
      </section>
    </div>
  );
}
