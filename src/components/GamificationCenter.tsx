import React from "react";
import { Award, Shield, CheckCircle, Eye, Users, ChevronRight, TrendingUp, Cpu, Sparkles } from "lucide-react";
import { User, Badge, LeaderboardEntry } from "../types";
import { motion } from "motion/react";

interface GamificationCenterProps {
  user: User;
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
}

export default function GamificationCenter({
  user,
  badges,
  leaderboard
}: GamificationCenterProps) {
  
  // Icon selector helper
  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const sizeClass = "w-6 h-6";
    const colorClass = isUnlocked ? "text-amber-400" : "text-slate-600";

    switch (iconName) {
      case "CheckCircle":
        return <CheckCircle className={`${sizeClass} ${colorClass}`} />;
      case "Shield":
        return <Shield className={`${sizeClass} ${colorClass}`} />;
      case "Eye":
        return <Eye className={`${sizeClass} ${colorClass}`} />;
      default:
        return <Award className={`${sizeClass} ${colorClass}`} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 text-slate-100">
      
      {/* Title Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-mono uppercase flex items-center gap-2">
            Campus Helpers Terminal
            <span className="bg-amber-500/20 text-amber-300 text-[9px] px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold uppercase tracking-widest font-mono">SEASON 4 ACTIVE</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Submit found properties, verify claims coordinates, and return items to earn seasonal badges & XP.</p>
        </div>
        
        {/* Personal Stats */}
        <div className="flex bg-slate-950/60 border border-white/5 rounded-2xl p-4 divide-x divide-white/10 shadow-inner">
          <div className="px-5">
            <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">My Standing</span>
            <span className="text-lg font-extrabold text-white font-mono">{user.points} XP</span>
          </div>
          <div className="px-5">
            <span className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">Badges Unlocked</span>
            <span className="text-lg font-extrabold text-white font-mono">{user.badges.length} <span className="text-xs text-slate-500">/ {badges.length}</span></span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Achievements list (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel border border-white/10 p-6 rounded-[28px] shadow-lg space-y-5"
          >
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Achievable Season Badges
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {badges.map((badge, i) => {
                const isUnlocked = user.badges.includes(badge.id);

                return (
                  <div 
                    key={i} 
                    className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 ${isUnlocked ? "bg-amber-500/5 border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.06)]" : "bg-slate-950/40 border-white/5 opacity-60"}`}
                  >
                    <div className={`p-3 rounded-xl shrink-0 border ${isUnlocked ? "bg-amber-500/15 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "bg-slate-900 border-white/5"}`}>
                      {renderBadgeIcon(badge.icon, isUnlocked)}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 leading-none">
                        <h4 className="font-extrabold text-white text-xs md:text-sm font-mono tracking-tight">{badge.name}</h4>
                        {isUnlocked && (
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-1.5 py-0.5 rounded font-mono">UNLOCKED</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed font-light">{badge.description}</p>
                      <span className="text-[10px] text-slate-500 block mt-2 font-mono font-medium">Reqs: {badge.pointsRequired} XP points</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Points rules definition */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-panel border border-white/10 p-6 rounded-[28px] shadow-lg space-y-4"
          >
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: "12s" }} />
              Points Allocation Model
            </h3>
            <div className="grid sm:grid-cols-3 gap-4 text-xs leading-relaxed">
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 shadow-inner">
                <span className="block text-xl mb-1.5">🎁</span>
                <strong className="block text-white font-mono text-xs mb-1">+25 XP Points</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed font-light">Submit any found property with descriptive details.</span>
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 shadow-inner">
                <span className="block text-xl mb-1.5">🛡️</span>
                <strong className="block text-white font-mono text-xs mb-1">+20 XP Points</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed font-light">Successfully complete secure custody handovers.</span>
              </div>
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 shadow-inner">
                <span className="block text-xl mb-1.5">🏅</span>
                <strong className="block text-white font-mono text-xs mb-1">+15 XP Points</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed font-light">Deliver precise verification statements in active audits.</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboards List (Right 1 column) */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="glass-panel border border-white/10 p-6 rounded-[28px] shadow-lg space-y-5"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-extrabold text-slate-400 text-xs uppercase tracking-widest font-mono">Terminal Leaderboard</h3>
            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-extrabold font-mono border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 rounded-md uppercase tracking-widest">
              <TrendingUp className="w-3.5 h-3.5 animate-pulse" /> LIVE
            </span>
          </div>

          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((entry, i) => {
              const isCurrentUser = entry.userId === user.id;

              return (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all duration-300 ${isCurrentUser ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.06)]" : "border-white/5 bg-slate-950/40"}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Number */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold font-mono text-[10px] border ${i === 0 ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : i === 1 ? "bg-slate-800 border-white/10 text-slate-300" : "bg-slate-950 border-white/5 text-slate-500"}`}>
                      {entry.rank}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs font-mono flex items-center gap-1.5 leading-none">
                        {entry.name}
                        {isCurrentUser && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-extrabold font-mono uppercase tracking-widest">ME</span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-500 block mt-1.5 font-mono font-medium">{entry.department}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-extrabold text-white text-xs block font-mono">{entry.points} XP</span>
                    <span className="text-[9px] text-slate-500 font-mono font-medium">{entry.badgesCount} badges</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
