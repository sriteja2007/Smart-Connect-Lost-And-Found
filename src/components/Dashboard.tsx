import React, { useState } from "react";
import { 
  FileText, CheckCircle, Search, AlertCircle, PlusCircle, 
  MapPin, HelpCircle, Calendar, ArrowRight, Sparkles, Tag, ShieldAlert, Cpu, Award
} from "lucide-react";
import { User, LostItem, FoundItem, ItemCategory } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ItemPreview3D from "./ItemPreview3D";

interface DashboardProps {
  user: User;
  lostItems: LostItem[];
  foundItems: FoundItem[];
  claimsCount: number;
  matchesCount: number;
  onNavigate: (tab: string) => void;
  onReportLost: (formData: any) => void;
  onReportFound: (formData: any) => void;
}

export default function Dashboard({
  user,
  lostItems,
  foundItems,
  claimsCount,
  matchesCount,
  onNavigate,
  onReportLost,
  onReportFound
}: DashboardProps) {
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);

  // Form states
  const [lostForm, setLostForm] = useState({
    name: "",
    category: "ELECTRONICS",
    brand: "",
    color: "",
    description: "",
    lastSeenLocation: "",
    dateLost: new Date().toISOString().split("T")[0],
    timeLost: "",
    serialNumber: "",
    specialMarks: "",
    hasProofOfOwnership: false,
    rewardAmount: ""
  });

  const [foundForm, setFoundForm] = useState({
    name: "",
    category: "ELECTRONICS",
    brand: "",
    color: "",
    description: "",
    foundLocation: "",
    dateFound: new Date().toISOString().split("T")[0],
    currentStorageLocation: "Front Security Desk Drawer"
  });

  const handleLostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportLost(lostForm);
    setShowLostModal(false);
    // Reset form
    setLostForm({
      name: "",
      category: "ELECTRONICS",
      brand: "",
      color: "",
      description: "",
      lastSeenLocation: "",
      dateLost: new Date().toISOString().split("T")[0],
      timeLost: "",
      serialNumber: "",
      specialMarks: "",
      hasProofOfOwnership: false,
      rewardAmount: ""
    });
  };

  const handleFoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReportFound(foundForm);
    setShowFoundModal(false);
    // Reset form
    setFoundForm({
      name: "",
      category: "ELECTRONICS",
      brand: "",
      color: "",
      description: "",
      foundLocation: "",
      dateFound: new Date().toISOString().split("T")[0],
      currentStorageLocation: "Front Security Desk Drawer"
    });
  };

  const myLostCount = lostItems.filter(item => item.reporterId === user.id).length;
  const myFoundCount = foundItems.filter(item => item.reporterId === user.id).length;

  const kpis = [
    { 
      label: "My Lost Reports", 
      val: myLostCount, 
      sub: "Currently active", 
      color: "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]", 
      icon: <FileText className="w-5 h-5 text-amber-400" />,
      glowColor: "rgba(245, 158, 11, 0.18)",
      shadowColor: "rgba(245, 158, 11, 0.08)"
    },
    { 
      label: "My Found Items", 
      val: myFoundCount, 
      sub: "Successfully logged", 
      color: "text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]", 
      icon: <CheckCircle className="w-5 h-5 text-blue-400" />,
      glowColor: "rgba(59, 130, 246, 0.18)",
      shadowColor: "rgba(59, 130, 246, 0.08)"
    },
    { 
      label: "Active Match Alerts", 
      val: matchesCount, 
      sub: "Requires attention", 
      color: "text-purple-400 bg-purple-500/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]", 
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      glowColor: "rgba(168, 85, 247, 0.18)",
      shadowColor: "rgba(168, 85, 247, 0.08)"
    },
    { 
      label: "Pending Claims", 
      val: claimsCount, 
      sub: "Verification in progress", 
      color: "text-sky-400 bg-sky-500/10 border-sky-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]", 
      icon: <PlusCircle className="w-5 h-5 text-sky-400" />,
      glowColor: "rgba(6, 182, 212, 0.18)",
      shadowColor: "rgba(6, 182, 212, 0.08)"
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-slate-100">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15, borderColor: "rgba(255, 255, 255, 0.1)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.4)" }}
        animate={{ 
          opacity: 1, 
          y: 0,
          borderColor: ["rgba(255, 255, 255, 0.1)", "rgba(59, 130, 246, 0.25)", "rgba(255, 255, 255, 0.1)"],
          boxShadow: ["0 4px 30px rgba(0, 0, 0, 0.4)", "0 4px 35px rgba(59, 130, 246, 0.15)", "0 4px 30px rgba(0, 0, 0, 0.4)"]
        }}
        transition={{ 
          duration: 0.6,
          borderColor: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          boxShadow: { repeat: Infinity, duration: 5, ease: "easeInOut" }
        }}
        className="glass-panel p-6 md:p-8 rounded-[28px] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Welcome Back, {user.name}</span>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-3 py-1 rounded-full border border-blue-500/30 font-mono font-bold tracking-widest uppercase">{user.role}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Campus Code ID: <strong className="text-slate-200 font-mono">{user.studentId}</strong> | Assigned Sector: <strong className="text-slate-200 font-mono">{user.department}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 border border-white/10 px-5 py-3 rounded-2xl relative z-10 shadow-inner">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            🏆
          </div>
          <div>
            <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Helper Experience</span>
            <span className="text-base font-extrabold text-white font-mono">{user.points} XP</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15, borderColor: "rgba(255, 255, 255, 0.05)", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)" }}
            animate={{ 
              opacity: 1, 
              y: 0,
              borderColor: ["rgba(255, 255, 255, 0.05)", k.glowColor, "rgba(255, 255, 255, 0.05)"],
              boxShadow: ["0 4px 20px rgba(0, 0, 0, 0.2)", `0 4px 25px ${k.shadowColor}`, "0 4px 20px rgba(0, 0, 0, 0.2)"]
            }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.1,
              borderColor: { repeat: Infinity, duration: 4 + i, ease: "easeInOut" },
              boxShadow: { repeat: Infinity, duration: 4 + i, ease: "easeInOut" }
            }}
            className="glass-panel p-5 rounded-2xl border border-white/5 shadow-lg flex items-start gap-4 transition hover:border-white/15 hover:shadow-2xl"
          >
            <div className={`p-3 rounded-xl border ${k.color}`}>
              {k.icon}
            </div>
            <div>
              <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">{k.label}</h4>
              <p className="text-2xl font-extrabold text-white mt-1.5 font-mono leading-none">{k.val}</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1 font-mono">{k.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15, borderColor: "rgba(255, 255, 255, 0.1)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
        animate={{ 
          opacity: 1, 
          y: 0,
          borderColor: ["rgba(255, 255, 255, 0.1)", "rgba(168, 85, 247, 0.25)", "rgba(255, 255, 255, 0.1)"],
          boxShadow: ["0 4px 30px rgba(0, 0, 0, 0.3)", "0 4px 35px rgba(168, 85, 247, 0.12)", "0 4px 30px rgba(0, 0, 0, 0.3)"]
        }}
        transition={{ 
          duration: 0.6, 
          delay: 0.2,
          borderColor: { repeat: Infinity, duration: 6, ease: "easeInOut" },
          boxShadow: { repeat: Infinity, duration: 6, ease: "easeInOut" }
        }}
        className="glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg"
      >
        <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest mb-5 flex items-center gap-2 font-mono">
          <Cpu className="w-4 h-4 text-blue-400 animate-pulse" />
          Interactive Teleport Consoles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLostModal(true)}
            className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 hover:border-amber-500/30 transition-all duration-300 group cursor-pointer shadow-inner"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all border border-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-200 text-xs tracking-tight">Report Lost Item</span>
            <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-widest">CLAIM THEFT / LOSS</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFoundModal(true)}
            className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer shadow-inner"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all border border-emerald-500/20">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-200 text-xs tracking-tight">Report Found Item</span>
            <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-widest">SUBMIT PROPERTY</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("search")}
            className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 hover:border-blue-500/30 transition-all duration-300 group cursor-pointer shadow-inner"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all border border-blue-500/20">
              <Search className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-200 text-xs tracking-tight">Registry Search</span>
            <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-widest">SCAN DATABASE</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("map")}
            className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 hover:border-sky-500/30 transition-all duration-300 group cursor-pointer shadow-inner"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all border border-sky-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-200 text-xs tracking-tight">Incident Map</span>
            <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-widest">COORDINATE MESH</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate("assistant")}
            className="flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 hover:border-purple-500/30 transition-all duration-300 col-span-2 md:col-span-1 group cursor-pointer shadow-inner"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-200 text-xs tracking-tight">AI Assistant</span>
            <span className="text-[9px] text-slate-500 mt-1 font-mono uppercase tracking-widest">GEMINI CONSULT</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Recent Activity Feed & Security Policy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Listings column */}
        <motion.div 
          initial={{ opacity: 0, y: 15, borderColor: "rgba(255, 255, 255, 0.1)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
          animate={{ 
            opacity: 1, 
            y: 0,
            borderColor: ["rgba(255, 255, 255, 0.1)", "rgba(59, 130, 246, 0.2)", "rgba(255, 255, 255, 0.1)"],
            boxShadow: ["0 4px 30px rgba(0, 0, 0, 0.3)", "0 4px 35px rgba(59, 130, 246, 0.12)", "0 4px 30px rgba(0, 0, 0, 0.3)"]
          }}
          transition={{ 
            duration: 0.6, 
            delay: 0.3,
            borderColor: { repeat: Infinity, duration: 5.5, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 5.5, ease: "easeInOut" }
          }}
          className="lg:col-span-2 glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-extrabold text-slate-300 uppercase tracking-widest font-mono flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              Live Postings Registry
            </h3>
            <button onClick={() => onNavigate("search")} className="text-blue-400 hover:text-blue-300 text-xs font-bold flex items-center gap-1 font-mono uppercase tracking-wider transition-colors cursor-pointer">
              Access Full Grid <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="space-y-3">
            {lostItems.slice(0, 3).map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className="flex items-start justify-between p-4 bg-slate-950/50 hover:bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300 shadow-inner"
              >
                <div className="flex gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-950/60 border border-white/5 overflow-hidden shrink-0 shadow-inner flex items-center justify-center relative">
                    <ItemPreview3D 
                      category={item.category} 
                      colorName={item.color} 
                      itemName={item.name}
                      compact={true}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm flex items-center flex-wrap gap-2 leading-none">
                      {item.name}
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">{item.category}</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-1">{item.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-600" /> {item.lastSeenLocation}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-600" /> {item.dateLost}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[9px] px-2 py-0.5 rounded-md font-bold font-mono border border-blue-500/20 bg-blue-500/5 text-blue-400 uppercase tracking-widest">{item.status}</span>
                  {item.rewardAmount && (
                    <span className="block text-[11px] font-extrabold text-emerald-400 mt-1.5 font-mono">🏆 ${item.rewardAmount} bounty</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Security / Safety Tips Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 15, borderColor: "rgba(255, 255, 255, 0.1)", boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)" }}
          animate={{ 
            opacity: 1, 
            y: 0,
            borderColor: ["rgba(255, 255, 255, 0.1)", "rgba(239, 68, 68, 0.18)", "rgba(255, 255, 255, 0.1)"],
            boxShadow: ["0 4px 30px rgba(0, 0, 0, 0.3)", "0 4px 35px rgba(239, 68, 68, 0.08)", "0 4px 30px rgba(0, 0, 0, 0.3)"]
          }}
          transition={{ 
            duration: 0.6, 
            delay: 0.4,
            borderColor: { repeat: Infinity, duration: 7, ease: "easeInOut" },
            boxShadow: { repeat: Infinity, duration: 7, ease: "easeInOut" }
          }}
          className="glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0F172A]/40 to-[#020617]/80"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-white text-lg tracking-tight">Security Safeguards</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-light">
              All claims undergo cryptographic and administrative auditing. Falsification or submitting duplicates of reported properties triggers an immediate report to the Campus Honor Board and temporary terminal suspension.
            </p>
          </div>
          <div className="bg-slate-950/80 p-4 rounded-xl flex items-center gap-3 border border-white/5 shadow-inner mt-6">
            <div className="text-xl">🚨</div>
            <div>
              <h4 className="font-bold text-white text-xs font-mono">Emergency Desk</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">24/7 Security Dispatch: (555) 900-0199</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* LOST ITEM MODAL FORM */}
      <AnimatePresence>
        {showLostModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel rounded-3xl w-full max-w-xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] p-6 md:p-8 max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Log Lost Item</h3>
                </div>
                <button onClick={() => setShowLostModal(false)} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleLostSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Item Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={lostForm.name} 
                      onChange={e => setLostForm({...lostForm, name: e.target.value})}
                      placeholder="e.g. iPad Pro with keyboard" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category *</label>
                    <select 
                      value={lostForm.category} 
                      onChange={e => setLostForm({...lostForm, category: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 text-xs font-medium text-slate-100 font-mono"
                    >
                      <option value="ELECTRONICS">Electronics</option>
                      <option value="BOOKS">Books & Materials</option>
                      <option value="ID_CARDS">ID / Access Cards</option>
                      <option value="WALLETS">Wallets & Bags</option>
                      <option value="KEYS">Keys & Fobs</option>
                      <option value="CLOTHING">Clothing</option>
                      <option value="ACCESSORIES">Accessories</option>
                      <option value="OTHERS">Others</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Brand (Optional)</label>
                    <input 
                      type="text" 
                      value={lostForm.brand} 
                      onChange={e => setLostForm({...lostForm, brand: e.target.value})}
                      placeholder="e.g. Apple" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Color *</label>
                    <input 
                      type="text" 
                      required
                      value={lostForm.color} 
                      onChange={e => setLostForm({...lostForm, color: e.target.value})}
                      placeholder="e.g. Space Grey" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Detailed Description *</label>
                  <textarea 
                    required
                    rows={2}
                    value={lostForm.description} 
                    onChange={e => setLostForm({...lostForm, description: e.target.value})}
                    placeholder="Provide custom markings, stickers, wallpapers or interior details..." 
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Last Seen Location *</label>
                    <input 
                      type="text" 
                      required
                      value={lostForm.lastSeenLocation} 
                      onChange={e => setLostForm({...lostForm, lastSeenLocation: e.target.value})}
                      placeholder="e.g. Science Library Room 3B" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Date Lost *</label>
                    <input 
                      type="date" 
                      required
                      value={lostForm.dateLost} 
                      onChange={e => setLostForm({...lostForm, dateLost: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 text-xs font-medium text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Serial Number (Optional)</label>
                    <input 
                      type="text" 
                      value={lostForm.serialNumber} 
                      onChange={e => setLostForm({...lostForm, serialNumber: e.target.value})}
                      placeholder="e.g. S/N iPad-X02" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Special Marks</label>
                    <input 
                      type="text" 
                      value={lostForm.specialMarks} 
                      onChange={e => setLostForm({...lostForm, specialMarks: e.target.value})}
                      placeholder="e.g. Sticker of a yellow duck" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Bounty Reward Amount ($)</label>
                    <input 
                      type="number" 
                      value={lostForm.rewardAmount} 
                      onChange={e => setLostForm({...lostForm, rewardAmount: e.target.value})}
                      placeholder="e.g. 25" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2.5 pt-4">
                    <input 
                      type="checkbox" 
                      id="hasProof"
                      checked={lostForm.hasProofOfOwnership} 
                      onChange={e => setLostForm({...lostForm, hasProofOfOwnership: e.target.checked})}
                      className="w-4.5 h-4.5 rounded bg-slate-900 border-white/10 text-blue-500 focus:ring-blue-500"
                    />
                    <label htmlFor="hasProof" className="text-xs font-bold text-slate-300 select-none cursor-pointer">I have secure purchase proof</label>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setShowLostModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
                  >
                    Post Lost Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOUND ITEM MODAL FORM */}
      <AnimatePresence>
        {showFoundModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel rounded-3xl w-full max-w-xl border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] p-6 md:p-8 max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Log Found Item</h3>
                </div>
                <button onClick={() => setShowFoundModal(false)} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
              </div>

              <form onSubmit={handleFoundSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Item Name *</label>
                    <input 
                      type="text" 
                      required 
                      value={foundForm.name} 
                      onChange={e => setFoundForm({...foundForm, name: e.target.value})}
                      placeholder="e.g. Metal Drink Bottle" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category *</label>
                    <select 
                      value={foundForm.category} 
                      onChange={e => setFoundForm({...foundForm, category: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-100 font-mono"
                    >
                      <option value="ELECTRONICS">Electronics</option>
                      <option value="BOOKS">Books & Materials</option>
                      <option value="ID_CARDS">ID / Access Cards</option>
                      <option value="WALLETS">Wallets & Bags</option>
                      <option value="KEYS">Keys & Fobs</option>
                      <option value="CLOTHING">Clothing</option>
                      <option value="ACCESSORIES">Accessories</option>
                      <option value="OTHERS">Others</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Brand (Optional)</label>
                    <input 
                      type="text" 
                      value={foundForm.brand} 
                      onChange={e => setFoundForm({...foundForm, brand: e.target.value})}
                      placeholder="e.g. HydroFlask" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Color *</label>
                    <input 
                      type="text" 
                      required
                      value={foundForm.color} 
                      onChange={e => setFoundForm({...foundForm, color: e.target.value})}
                      placeholder="e.g. Navy Blue" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Detailed Description *</label>
                  <textarea 
                    required
                    rows={2}
                    value={foundForm.description} 
                    onChange={e => setFoundForm({...foundForm, description: e.target.value})}
                    placeholder="Describe specific spot, hardware defects, visual labels..." 
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Found Location *</label>
                    <input 
                      type="text" 
                      required
                      value={foundForm.foundLocation} 
                      onChange={e => setFoundForm({...foundForm, foundLocation: e.target.value})}
                      placeholder="e.g. Student Union Cafeteria" 
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Date Found *</label>
                    <input 
                      type="date" 
                      required
                      value={foundForm.dateFound} 
                      onChange={e => setFoundForm({...foundForm, dateFound: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 text-xs font-medium text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Current Secure Custody Storage *</label>
                  <input 
                    type="text" 
                    required
                    value={foundForm.currentStorageLocation} 
                    onChange={e => setFoundForm({...foundForm, currentStorageLocation: e.target.value})}
                    placeholder="e.g. Front Security Desk Desk Locker" 
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                  />
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setShowFoundModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
                  >
                    Post Found Report
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
