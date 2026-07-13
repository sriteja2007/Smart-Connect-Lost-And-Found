import React, { useState } from "react";
import { 
  Search, SlidersHorizontal, MapPin, Calendar, Tag, Shield, 
  AlertCircle, Sparkles, Send, FileText, Lock, ChevronRight, Award, Cpu, Info
} from "lucide-react";
import { User, LostItem, FoundItem, ItemCategory } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ItemPreview3D from "./ItemPreview3D";

interface SearchPageProps {
  user: User;
  lostItems: LostItem[];
  foundItems: FoundItem[];
  matches: any[];
  onSubmitClaim: (claimData: any) => void;
}

export default function SearchPage({
  user,
  lostItems,
  foundItems,
  matches,
  onSubmitClaim
}: SearchPageProps) {
  const [dbType, setDbType] = useState<"LOST" | "FOUND">("FOUND");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "ALL">("ALL");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  // Claim modal details
  const [claimingItem, setClaimingItem] = useState<FoundItem | null>(null);
  const [claimForm, setClaimForm] = useState({
    ownershipProofDescription: "",
    secretIdentifier: "",
    ownershipProofFiles: [] as string[]
  });

  // 3D Preview details
  const [previewingItem3D, setPreviewingItem3D] = useState<any | null>(null);

  const categories: (ItemCategory | "ALL")[] = [
    "ALL", "ELECTRONICS", "BOOKS", "ID_CARDS", "WALLETS", "KEYS", "CLOTHING", "ACCESSORIES", "OTHERS"
  ];

  // Filters logic
  const itemsToFilter = dbType === "LOST" ? lostItems : foundItems;

  const filteredItems = itemsToFilter.filter(item => {
    // Search Term match
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.color.toLowerCase().includes(searchTerm.toLowerCase());

    // Category match
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

    // Location match
    const loc = dbType === "LOST" ? (item as LostItem).lastSeenLocation : (item as FoundItem).foundLocation;
    const matchesLocation = !selectedLocation || loc.toLowerCase().includes(selectedLocation.toLowerCase());

    // Date filter
    let matchesDate = true;
    const dateStr = dbType === "LOST" ? (item as LostItem).dateLost : (item as FoundItem).dateFound;
    const itemDate = new Date(dateStr);
    const today = new Date();
    
    if (dateFilter === "today") {
      matchesDate = itemDate.toDateString() === today.toDateString();
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = itemDate >= oneWeekAgo;
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = itemDate >= oneMonthAgo;
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesDate;
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingItem) return;

    onSubmitClaim({
      itemId: claimingItem.id,
      claimantId: user.id,
      studentId: user.studentId,
      ownershipProofDescription: claimForm.ownershipProofDescription,
      secretIdentifier: claimForm.secretIdentifier,
      ownershipProofFiles: claimForm.ownershipProofFiles
    });

    setClaimingItem(null);
    setClaimForm({ ownershipProofDescription: "", secretIdentifier: "", ownershipProofFiles: [] });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 text-slate-100">
      
      {/* Title Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg"
      >
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-mono uppercase">Advanced Campus Database</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Audit, filter, inspect, and claim registered campus belongings safely.</p>
        </div>
        <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-white/5 shadow-inner">
          <button 
            onClick={() => setDbType("FOUND")}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${dbType === "FOUND" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            FOUND REGISTRY
          </button>
          <button 
            onClick={() => setDbType("LOST")}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${dbType === "LOST" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            LOST REGISTRY
          </button>
        </div>
      </motion.div>

      {/* Filters Form */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel border border-white/10 p-6 rounded-[28px] shadow-lg space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Term */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search keyword, brand, colors..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 text-xs font-medium text-slate-100 placeholder-slate-650 font-mono"
            />
          </div>

          {/* Location Query */}
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              placeholder="Filter by building e.g. Library..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 text-xs font-medium text-slate-100 placeholder-slate-650 font-mono"
            />
          </div>

          {/* Date Range filter */}
          <div className="relative">
            <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <select 
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 text-xs font-medium text-slate-100 font-mono appearance-none"
            >
              <option value="all">All Logs Archive</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
        </div>

        {/* Category Badge filters */}
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mr-2 shrink-0 font-mono">Filter Class:</span>
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[10px] font-extrabold font-mono tracking-wider transition-all shrink-0 cursor-pointer border ${selectedCategory === cat ? "bg-blue-600 border-blue-500 text-white shadow-lg" : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10"}`}
              >
                {cat.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grid Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, i) => {
          // Find matching score alert
          const itemMatch = matches.find(m => 
            dbType === "LOST" ? m.lostItemId === item.id : m.foundItemId === item.id
          );

          const locationText = dbType === "LOST" ? (item as LostItem).lastSeenLocation : (item as FoundItem).foundLocation;
          const dateText = dbType === "LOST" ? (item as LostItem).dateLost : (item as FoundItem).dateFound;

          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
              className="glass-panel border border-white/5 rounded-[24px] p-5 shadow-lg hover:border-white/15 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span className="bg-slate-900/60 border border-white/5 text-slate-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded-md uppercase tracking-widest">
                    {item.category}
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold font-mono border border-blue-500/20 bg-blue-500/5 text-blue-400 uppercase tracking-widest">
                    {item.status}
                  </span>
                </div>

                {/* 3D Model Image Replacement */}
                <div className="w-full h-44 bg-slate-950/45 rounded-2xl border border-white/5 overflow-hidden mb-4 relative group/canvas shadow-inner flex items-center justify-center">
                  <ItemPreview3D 
                    category={item.category} 
                    colorName={item.color} 
                    itemName={item.name}
                    compact={true}
                  />
                  <div className="absolute bottom-2.5 right-2.5 bg-slate-900/95 border border-white/10 px-2 py-0.5 rounded-md text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 opacity-0 group-hover/canvas:opacity-100 transition-opacity pointer-events-none shadow-lg">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
                    3D Hologram Preview
                  </div>
                </div>

                <h3 className="font-extrabold text-white text-sm md:text-base mb-1.5 line-clamp-1">{item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4 font-light">{item.description}</p>

                <div className="space-y-2.5 border-t border-white/10 pt-4 mb-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
                    <MapPin className="w-4 h-4 text-slate-600" />
                    <span className="truncate">{locationText}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 text-slate-600" />
                    <span>{dateText}</span>
                  </div>
                  {item.brand && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
                      <Tag className="w-4 h-4 text-slate-600" />
                      <span>Brand: <strong className="text-white">{item.brand}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
                    <Lock className="w-4 h-4 text-slate-600" />
                    <span className="text-[10px] bg-slate-900/80 border border-white/5 text-slate-500 px-1.5 py-0.5 rounded font-mono select-none">
                      Serial: XXXX-XXXX (Hidden)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {/* AI Matching alert sticker */}
                {itemMatch && itemMatch.status === "PENDING" && (
                  <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-2 rounded-xl flex items-center justify-between text-xs font-mono shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                    <span className="flex items-center gap-1.5 font-extrabold">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-bounce" />
                      Match: {itemMatch.score}% Score
                    </span>
                    <span className="text-[8px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-mono px-1.5 py-0.5 rounded font-extrabold uppercase tracking-widest">
                      {itemMatch.confidenceLevel}
                    </span>
                  </div>
                )}

                {dbType === "FOUND" ? (
                  item.status === "ACTIVE" ? (
                    <div className="space-y-2">
                      <motion.button
                        whileHover={{ scale: 1.02, translateY: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setClaimingItem(item as FoundItem)}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-2.5 rounded-xl text-xs font-bold font-mono tracking-widest uppercase transition-all shadow-lg hover:shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Shield className="w-4 h-4" />
                        Claim Ownership
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02, translateY: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPreviewingItem3D(item)}
                        className="w-full bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 text-purple-300 py-2.5 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                        3D Hologram Inspect
                      </motion.button>
                    </div>
                  ) : (
                    <div className="text-center py-2.5 bg-slate-950/80 border border-white/5 rounded-xl text-[10px] font-bold font-mono text-slate-600 tracking-wider uppercase select-none">
                      Already Recovered / In Custody
                    </div>
                  )
                ) : (
                  <div className="space-y-2">
                    {user.id !== item.reporterId && (
                      <div className="text-center py-2.5 bg-slate-950/80 border border-white/5 rounded-xl text-[10px] font-bold font-mono text-slate-500 tracking-wider uppercase select-none">
                        Contact Owner via Alerts
                      </div>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPreviewingItem3D(item)}
                      className="w-full bg-slate-950/60 hover:bg-slate-900 border border-white/5 hover:border-purple-500/30 text-purple-300 py-2.5 rounded-xl text-[11px] font-bold font-mono tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                      3D Hologram Inspect
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="col-span-full bg-slate-950/40 border border-white/10 rounded-[28px] p-12 text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <h3 className="font-bold text-white text-base font-mono">No Matching Records Found</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Try adjusting your query, selecting 'ALL' class filters, or toggle the registry database headers.
            </p>
          </div>
        )}
      </div>

      {/* OWNERSHIP CLAIM SUBMISSION DIALOG */}
      <AnimatePresence>
        {claimingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel rounded-3xl w-full max-w-lg border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] p-6 md:p-8 max-h-[90vh] overflow-y-auto relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Security Verification</h3>
                </div>
                <button onClick={() => setClaimingItem(null)} className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer">✕</button>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4.5 rounded-2xl flex items-start gap-3.5 mb-6 text-xs text-blue-300">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-1">Ownership claim: {claimingItem.name}</span>
                  To safeguard against property theft, please identify specific casing stickers, passwords, interior items, hardware defects, or lock screen details.
                </div>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Detailed Proof description *</label>
                  <textarea 
                    required
                    rows={3}
                    value={claimForm.ownershipProofDescription}
                    onChange={e => setClaimForm({...claimForm, ownershipProofDescription: e.target.value})}
                    placeholder="Describe original receipts, hardware defects, or internal accessories contents..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Secret identifying credential *</label>
                  <input 
                    type="text"
                    required
                    value={claimForm.secretIdentifier}
                    onChange={e => setClaimForm({...claimForm, secretIdentifier: e.target.value})}
                    placeholder="e.g. customized sticker of yellow duck on back, lockscreen image of my puppy"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Receipt Invoice / Hardware Photo (Simulated)</label>
                  <div className="border-2 border-dashed border-white/10 hover:border-blue-500/30 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40">
                    <div className="text-2xl mb-2">📁</div>
                    <span className="block text-xs font-bold text-slate-300">Drag & Drop Invoice / Hardware Photo</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Supports PDF, PNG, JPG up to 10MB</span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3 justify-end border-t border-white/10">
                  <button 
                    type="button" 
                    onClick={() => setClaimingItem(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg"
                  >
                    Submit claims case
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D HOLOGRAPHIC INSPECTOR DIALOG */}
      <AnimatePresence>
        {previewingItem3D && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="glass-panel rounded-3xl w-full max-w-4xl border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden relative flex flex-col md:flex-row h-auto max-h-[90vh]"
            >
              {/* Left Column: 3D Canvas Visualizer */}
              <div className="w-full md:w-1/2 p-4 flex flex-col justify-center bg-slate-950/40">
                <ItemPreview3D 
                  category={previewingItem3D.category} 
                  colorName={previewingItem3D.color} 
                  itemName={previewingItem3D.name}
                />
              </div>

              {/* Right Column: Dynamic metadata & Details */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  {/* Close and title */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[9px] font-extrabold font-mono px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 animate-pulse" />
                      PHYSICAL COMPONENT MATRIX
                    </span>
                    <button 
                      onClick={() => setPreviewingItem3D(null)} 
                      className="text-slate-400 hover:text-white font-extrabold text-sm cursor-pointer p-1 rounded-lg hover:bg-white/5"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight uppercase font-mono mb-1.5">{previewingItem3D.name}</h3>
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="bg-slate-900 text-slate-400 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md border border-white/5 uppercase">
                        {previewingItem3D.category}
                      </span>
                      <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md uppercase">
                        STATUS: {previewingItem3D.status}
                      </span>
                    </div>
                  </div>

                  {/* Descriptive breakdown */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block font-mono">SPECIFICATION LOGS:</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-light bg-slate-950/40 border border-white/5 p-4 rounded-2xl">
                      {previewingItem3D.description}
                    </p>
                  </div>

                  {/* Technical properties list */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-white/5 pt-5">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Reported Color:</span>
                      <strong className="text-white block">{previewingItem3D.color || "N/A"}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Category Class:</span>
                      <strong className="text-white block">{previewingItem3D.category}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Logged Coordinate:</span>
                      <strong className="text-blue-300 block truncate">{previewingItem3D.foundLocation || previewingItem3D.lastSeenLocation || "Campus Ground"}</strong>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 uppercase font-bold">Recorded Date:</span>
                      <strong className="text-white block">{previewingItem3D.dateFound || previewingItem3D.dateLost || "Recent"}</strong>
                    </div>
                  </div>

                  {/* Advisory Notice */}
                  <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-2xl flex items-start gap-3 text-[11px] text-slate-400 leading-relaxed">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      This rotatable 3D model is a procedurally computed geometry reflecting the physical properties registered inside our campus ledger. Use this terminal viewport to visually confirm shape and category constraints prior to submitting an official ownership claims request.
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-8 pt-4 border-t border-white/5 flex gap-3.5">
                  <button 
                    onClick={() => setPreviewingItem3D(null)}
                    className="flex-1 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer font-mono"
                  >
                    CLOSE TERMINAL
                  </button>
                  
                  {dbType === "FOUND" && previewingItem3D.status === "ACTIVE" && (
                    <button 
                      onClick={() => {
                        setClaimingItem(previewingItem3D);
                        setPreviewingItem3D(null);
                      }}
                      className="flex-1 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer flex items-center justify-center gap-1.5 font-mono"
                    >
                      <Shield className="w-4 h-4" />
                      CLAIM PROPERTY
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
