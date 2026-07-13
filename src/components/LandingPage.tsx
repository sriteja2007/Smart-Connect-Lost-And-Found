import React, { useState } from "react";
import { Search, Shield, HelpCircle, ArrowRight, CheckCircle, MapPin, Award, Phone, Sparkles, Cpu, Lock, Compass } from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onStart: () => void;
  onExplorePublic: () => void;
}

export default function LandingPage({ onStart, onExplorePublic }: LandingPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const stats = [
    { label: "Lost Items Recovered", val: "842+", sub: "Last 12 months", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" },
    { label: "Active Postings", val: "134", sub: "Currently waiting", color: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]" },
    { label: "Recovery Success Rate", val: "94.2%", sub: "Enterprise leading", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]" },
    { label: "Avg. Match Time", val: "12 mins", sub: "Powered by Gemini AI", color: "text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)]" },
  ];

  const steps = [
    {
      title: "1. Log & Scan",
      desc: "Instantly register lost or found property. Our vectorizer breaks down descriptions and extracts coordinates.",
      icon: <Search className="w-5 h-5 text-blue-400" />
    },
    {
      title: "2. Neural Matching",
      desc: "Campus AI compares colors, brands, timestamps, and locations to predict exact ownership with percentage levels.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />
    },
    {
      title: "3. Secure Verification",
      desc: "Admins review proof of purchase, lockscreen details, and secure documents before permitting handovers.",
      icon: <Lock className="w-5 h-5 text-emerald-400" />
    },
    {
      title: "4. Rapid Recovery",
      desc: "Collect from secure office vaults. Earn seasonal achievement experience points and custom badges.",
      icon: <Award className="w-5 h-5 text-amber-400" />
    }
  ];

  const FAQs = [
    { q: "Where is the physical Lost & Found office?", a: "The central Campus Security Office is stationed on the Ground Floor of the Student Union building, Room 102. Vault collections operate daily from 8:00 AM to 10:00 PM." },
    { q: "How does the AI smart matching score work?", a: "Gemini AI analyzes natural language descriptors, category definitions, visual cues, and spatial proximity coordinates. It scores similarities on a dynamic 0-100% scale." },
    { q: "What counts as secure proof of ownership?", a: "We recognize original purchase receipts, hardware serial logs, pictures of you with the item prior to loss, lock screen password entries, or accurate listings of secondary interior contents." },
    { q: "Is there a reward system for finders?", a: "Absolutely! Finders receive automated Campus Helper Points which trigger unlockable achievement badges. Original owners can also optionally append custom cash rewards." }
  ];

  return (
    <div className="bg-[#050816] min-h-screen font-sans text-slate-100 relative overflow-hidden">
      {/* Immersive 3D Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

      {/* Cyber ambient background lighting spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-4 md:px-6 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Intro */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold font-mono shadow-[0_0_15px_rgba(59,130,246,0.1)]"
            >
              <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: "12s" }} />
              <span>Campus Intelligence Protocol v4.0</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              Recover What’s Lost. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 glow-text-primary">
                Reconnect Globally.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed font-light"
            >
              The enterprise campus ecosystem powered by server-side Gemini matching. Seamlessly report items, pinpoint incidents on coordinates grids, and claim with complete ownership verification.
            </motion.p>

            {/* Quick CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button 
                onClick={onStart}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-7 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_25px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_30px_rgba(96,165,250,0.5)] cursor-pointer flex items-center gap-2 group"
              >
                Access Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onExplorePublic}
                className="bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border border-white/10 hover:border-blue-500/30 px-7 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Explore Registry
              </button>
            </motion.div>
          </div>

          {/* Hero Right Visualizer: Simulated neural connection */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="glass-panel rounded-[32px] p-6 border border-white/10 shadow-[0_10px_50px_rgba(0,0,0,0.6)] backdrop-blur-md relative overflow-hidden"
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40"></div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-mono text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">Match Analysis Feed</span>
                </div>
                <span className="font-mono text-[9px] text-slate-500">PORTAL-CORE-01</span>
              </div>

              {/* Match illustration box */}
              <div className="space-y-4">
                {/* Source block */}
                <div className="bg-slate-950/80 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-mono text-blue-400 font-bold text-xs">
                      SRC
                    </div>
                    <div>
                      <span className="text-[10px] text-blue-400 font-mono block">LOST STATEMENT</span>
                      <strong className="text-white text-xs block">Grey Space Grey Laptop</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">15:30 UTC</span>
                </div>

                {/* Connection wires with pulses */}
                <div className="relative py-2 flex justify-center items-center">
                  <div className="h-[2px] w-full bg-gradient-to-r from-blue-500/20 via-purple-500 to-emerald-500/20"></div>
                  <div className="absolute bg-white text-purple-400 border border-purple-500/40 font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-950/90 font-extrabold uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse">
                    96.4% MATCH CONFIDENCE
                  </div>
                </div>

                {/* Target block */}
                <div className="bg-slate-950/80 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono text-emerald-400 font-bold text-xs">
                      TGT
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-400 font-mono block">FOUND LOG</span>
                      <strong className="text-white text-xs block">Space Grey Apple MacBook</strong>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">15:42 UTC</span>
                </div>
              </div>

              {/* Matching telemetry details */}
              <div className="border-t border-white/10 mt-5 pt-4 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">VECTOR DISTANCE</span>
                  <span className="text-slate-300">0.1412 (OPTIMAL)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">COORDINATE BIAS</span>
                  <span className="text-slate-300">Student Union Zone (0.98)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-500">RECOMMENDED CLAIM ID</span>
                  <span className="text-purple-400 font-bold">#CLM-2084A</span>
                </div>
              </div>

              {/* Cyber decoration lines */}
              <div className="absolute bottom-1 right-2 opacity-10 pointer-events-none">
                <span className="text-[40px] font-mono font-black text-white select-none">AI</span>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Stats Bento Section */}
      <section className="relative py-16 px-4 md:px-6 border-t border-white/10 bg-slate-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((st, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider font-bold">ST_0{i+1}</span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${st.color}`}>
                    ST_SYS
                  </span>
                </div>
                <div className="mt-6">
                  <h3 className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2">{st.val}</h3>
                  <p className="text-xs font-bold text-slate-300 tracking-wide">{st.label}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 font-medium">{st.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 px-4 md:px-6 relative border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              A Rigorous <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">Ownership</span> Pipeline
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Designed with strict legal, auditing, and verification parameters to eliminate campus fraud and facilitate bulletproof claim recovery.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <motion.div 
                key={i}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className="glass-panel p-6 rounded-2xl border border-white/5 relative group transition-all duration-300 hover:border-blue-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_40px_rgba(59,130,246,0.1)]"
                style={{
                  transform: hoveredCard === i ? "translateY(-6px) scale(1.02)" : "translateY(0px) scale(1)"
                }}
              >
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 mb-6 group-hover:border-blue-500/30 transition-colors shadow-inner">
                  {st.icon}
                </div>
                <h3 className="font-bold text-white text-base mb-2 font-mono tracking-tight">{st.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-light">{st.desc}</p>
                
                {/* Ambient glow accent line */}
                <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 px-4 md:px-6 relative border-t border-white/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Operational <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">Intelligence</span> FAQs
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Understand coordinate incident logs, secure custody systems, and standard helper badges procedures.
            </p>
          </div>

          <div className="space-y-4">
            {FAQs.map((faq, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors shadow-inner">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-900 rounded-xl border border-white/10 shrink-0 text-blue-400">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm md:text-base mb-1.5 font-mono tracking-tight">{faq.q}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Contact Details */}
      <footer className="bg-slate-950 border-t border-white/10 text-slate-500 py-16 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-12">
          <div>
            <div className="flex items-center gap-2.5 text-white mb-3">
              <Shield className="w-5 h-5 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
              <span className="font-bold tracking-tight text-lg font-mono">CampusConnect Lost & Found</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm font-light">The authorized asset protection and recovery terminal network for campus security, students, faculties, and verified operators.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 font-mono text-[11px]">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-cyan-400" />
              <span>24/7 Vault Line: (555) 900-0199</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Ground Floor Union, Rm 102</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 text-[10px] font-mono tracking-wide">
          <p>© 2026 CampusConnect Terminal. All operations cryptographically audited. WCAG 2.1 Compliant.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Guidelines</span>
            <span className="hover:text-white cursor-pointer transition-colors">Honor Code</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
