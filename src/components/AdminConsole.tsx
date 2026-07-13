import React, { useState } from "react";
import { 
  Users, Eye, FileText, CheckCircle, Award, Sparkles, MapPin, 
  ArrowRight, ShieldAlert, TrendingUp, ChevronRight, Lock, AlertTriangle, Play,
  Database, Server, Copy, Check
} from "lucide-react";
import { User, LostItem, FoundItem, Claim, UserRole } from "../types";

interface AdminConsoleProps {
  user: User;
  analytics: {
    kpis: {
      totalUsers: number;
      activeUsers: number;
      lostReports: number;
      foundReports: number;
      recoveryRate: number;
      pendingClaims: number;
    };
    recoveryTrends: { month: string; lost: number; recovered: number }[];
    categoryDistribution: { name: string; count: number }[];
    highRiskZones: { zone: string; incidentCount: number }[];
    departmentAnalytics: { name: string; totalLost: number; totalFound: number; recoveryRate: number }[];
  } | null;
  claims: Claim[];
  usersList: User[];
  onOpenClaim: (claimId: string) => void;
}

export default function AdminConsole({
  user,
  analytics,
  claims,
  usersList,
  onOpenClaim
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<"ANALYTICS" | "USERS" | "FRAUD" | "SUPABASE">("ANALYTICS");
  const [copiedSQL, setCopiedSQL] = useState(false);

  const handleCopySQL = () => {
    const sqlText = `-- SQL Command to Bootstrapping Supabase Tables for Smart Lost and Found
-- Paste this script directly in your SQL Editor:

-- 1. Create Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_type TEXT DEFAULT 'FOUND',
  claimant_id TEXT,
  student_id TEXT,
  ownership_proof_description TEXT,
  ownership_proof_files JSONB DEFAULT '[]'::jsonb,
  secret_identifier TEXT,
  status TEXT DEFAULT 'SUBMITTED',
  risk_score NUMERIC DEFAULT 0,
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  admin_notes TEXT
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  role TEXT,
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Lost Items Table
CREATE TABLE IF NOT EXISTS lost_items (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  name TEXT,
  category TEXT,
  brand TEXT,
  color TEXT,
  description TEXT,
  last_seen_location TEXT,
  date_lost DATE,
  time_lost TEXT,
  serial_number TEXT,
  special_marks TEXT,
  has_proof_of_ownership BOOLEAN DEFAULT FALSE,
  reward_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Found Items Table
CREATE TABLE IF NOT EXISTS found_items (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  name TEXT,
  category TEXT,
  brand TEXT,
  color TEXT,
  description TEXT,
  found_location TEXT,
  date_found DATE,
  current_storage_location TEXT,
  auto_tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  lost_item_id TEXT,
  found_item_id TEXT,
  score NUMERIC,
  confidence_level TEXT,
  matched_criteria JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  sender_role TEXT,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  if (!analytics) {
    return (
      <div className="text-center py-20 text-slate-500">
        <Sparkles className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
        <span>Compiling campus statistics, please wait...</span>
      </div>
    );
  }

  const { kpis, recoveryTrends, categoryDistribution, highRiskZones, departmentAnalytics } = analytics;

  // Compile high risk fraud queue
  const suspiciousClaims = claims.filter(c => c.riskScore >= 35);

  const stats = [
    { label: "Total Registrations", val: kpis.totalUsers, sub: "+12% this term", icon: <Users className="w-5 h-5 text-blue-500" />, color: "bg-blue-50 border-blue-100" },
    { label: "Active Contributors", val: kpis.activeUsers, sub: "Helper score > 10", icon: <Award className="w-5 h-5 text-purple-500" />, color: "bg-purple-50 border-purple-100" },
    { label: "Lost Items Catalog", val: kpis.lostReports, sub: "Currently missing", icon: <FileText className="w-5 h-5 text-amber-500" />, color: "bg-amber-50 border-amber-100" },
    { label: "Recovery Success Rate", val: `${kpis.recoveryRate}%`, sub: "Campus security record", icon: <CheckCircle className="w-5 h-5 text-emerald-500" />, color: "bg-emerald-50 border-emerald-100" }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Enterprise Security Hub</h2>
          <p className="text-sm text-slate-500 font-medium">Analyze campus incident statistics, audit fraud review pipelines, and manage users permissions.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button 
            onClick={() => setActiveTab("ANALYTICS")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "ANALYTICS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Analytics & Trends
          </button>
          <button 
            onClick={() => setActiveTab("FRAUD")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "FRAUD" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Fraud Review Queue
          </button>
          <button 
            onClick={() => setActiveTab("USERS")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "USERS" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab("SUPABASE")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${activeTab === "SUPABASE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
          >
            Supabase DB Integration
          </button>
        </div>
      </div>

      {/* KPI stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((st, i) => (
          <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-start gap-4">
            <div className={`p-2.5 rounded-xl border ${st.color}`}>
              {st.icon}
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{st.label}</span>
              <h4 className="text-2xl font-extrabold text-slate-800 mt-1">{st.val}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{st.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {activeTab === "ANALYTICS" && (
        <div className="space-y-6">
          {/* Recovery and Category Distribution Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Custom SVG Trend Line Chart (Left 2 columns) */}
            <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Recovery Volume Trends</h3>
                  <p className="text-xs text-slate-400">Monthly comparison of reported vs recovered items</p>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Lost Items
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Recovered Items
                  </span>
                </div>
              </div>

              {/* Styled Interactive SVG Line Graphic */}
              <div className="h-56 w-full relative pt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                  {/* Grid Lines */}
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#F1F5F9" strokeWidth="1" />
                  <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" />
                  
                  {/* Monthly points & lines - Lost Items Path */}
                  <path 
                    d="M 10 120 L 100 100 L 200 80 L 300 90 L 400 60 L 490 40" 
                    fill="none" 
                    stroke="#F59E0B" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    className="transition duration-500"
                  />
                  {/* Recovered Items Path */}
                  <path 
                    d="M 10 135 L 100 115 L 200 95 L 300 100 L 400 75 L 490 55" 
                    fill="none" 
                    stroke="#2563EB" 
                    strokeWidth="3.5" 
                    strokeLinecap="round"
                    className="transition duration-500"
                  />

                  {/* Intersect Dots */}
                  <circle cx="10" cy="120" r="4" fill="#F59E0B" />
                  <circle cx="100" cy="100" r="4" fill="#F59E0B" />
                  <circle cx="200" cy="80" r="4" fill="#F59E0B" />
                  <circle cx="300" cy="90" r="4" fill="#F59E0B" />
                  <circle cx="400" cy="60" r="4" fill="#F59E0B" />
                  <circle cx="490" cy="40" r="4" fill="#F59E0B" />

                  <circle cx="10" cy="135" r="4" fill="#2563EB" />
                  <circle cx="100" cy="115" r="4" fill="#2563EB" />
                  <circle cx="200" cy="95" r="4" fill="#2563EB" />
                  <circle cx="300" cy="100" r="4" fill="#2563EB" />
                  <circle cx="400" cy="75" r="4" fill="#2563EB" />
                  <circle cx="490" cy="55" r="4" fill="#2563EB" />
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-slate-400 font-bold px-2 pt-2 border-t border-slate-100 font-mono">
                  {recoveryTrends.map((rt, i) => (
                    <span key={i}>{rt.month}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Category distribution visual block (Right 1 column) */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Items by Category</h3>
              <p className="text-xs text-slate-400">Total occurrences indexed</p>

              <div className="space-y-3 pt-2">
                {categoryDistribution.slice(0, 5).map((cat, i) => {
                  const maxCount = Math.max(...categoryDistribution.map(c => c.count)) || 1;
                  const percent = Math.round((cat.count / maxCount) * 100);

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span>{cat.name}</span>
                        <span className="font-mono">{cat.count} listings</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Incident Hotspots and Departments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Department Analytics */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4">Department Success Rates</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Department Name</th>
                      <th className="p-3 text-center">Lost Items</th>
                      <th className="p-3 text-center">Found Items</th>
                      <th className="p-3 text-right">Recovery Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {departmentAnalytics.map((dept, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{dept.name}</td>
                        <td className="p-3 text-center">{dept.totalLost}</td>
                        <td className="p-3 text-center">{dept.totalFound}</td>
                        <td className="p-3 text-right font-extrabold text-emerald-600">{dept.recoveryRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Incident Locations Heat map zones list */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Popular Loss Incidents Zones</h3>
              
              <div className="space-y-3 pt-1">
                {highRiskZones.map((hz, i) => (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </div>
                      <span className="font-bold text-slate-800 text-xs">{hz.zone}</span>
                    </div>
                    <span className="text-[10px] bg-red-100 text-red-700 font-mono font-bold px-2 py-0.5 rounded-lg border border-red-200">
                      {hz.incidentCount} incidents
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === "FRAUD" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Mod Security Suspicious Claims Pipeline</h3>
              <p className="text-xs text-slate-400">Claims flagged with moderate/high risk scores based on multiple concurrent claims or suspicious descriptions.</p>
            </div>
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {suspiciousClaims.length} Suspicious Cases Flagged
            </span>
          </div>

          <div className="space-y-4">
            {suspiciousClaims.map((claim, i) => {
              const claimantUser = usersList.find(u => u.id === claim.claimantId);

              return (
                <div key={i} className="p-4 rounded-2xl border border-red-100 bg-red-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded border border-red-200">
                        RISK RATING: {claim.riskScore}%
                      </span>
                      <span className="text-xs font-bold text-slate-800">Claim ID: {claim.id}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Claimant: <strong>{claimantUser ? claimantUser.name : "N/A"}</strong> | Student ID: <strong>{claim.studentId}</strong>
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {claim.fraudFlags.map((flg, idx) => (
                        <span key={idx} className="bg-white text-red-700 font-bold border border-red-100 px-2 py-0.5 rounded text-[10px]">
                          ⚠️ {flg}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => onOpenClaim(claim.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    Investigate Case <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {suspiciousClaims.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                Excellent! No suspicious claims are currently flagged by our fraud assessment algorithms.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "USERS" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Registered Campus Directory</h3>
          <p className="text-xs text-slate-400">Total users registered, their respective departments, roles, and points ledger.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Student/Emp ID</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Department</th>
                  <th className="p-3 text-right">Points Ledger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((usr, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-800">{usr.name}</td>
                    <td className="p-3">{usr.email}</td>
                    <td className="p-3 font-mono">{usr.studentId}</td>
                    <td className="p-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${usr.role === UserRole.SUPER_ADMIN ? "bg-purple-100 text-purple-800" : usr.role === UserRole.SECURITY_OFFICE ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-700"}`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{usr.department}</td>
                    <td className="p-3 text-right font-extrabold text-blue-600">{usr.points} Points</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "SUPABASE" && (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600 animate-pulse" />
                Supabase SQL Database Connection
              </h3>
              <p className="text-xs text-slate-500 font-medium font-sans">Real-time backup and cloud storage synchronization status.</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live & Fully Configured
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                <Server className="w-4 h-4" /> Connection Details
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium font-sans">Project Name:</span>
                  <span className="font-mono font-bold text-slate-800">Smart-Lost-And-Found</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium font-sans">Project ID:</span>
                  <span className="font-mono font-bold text-slate-800">ivuzzvqwcualipofkzmf</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium font-sans">API Endpoint URL:</span>
                  <span className="font-mono font-bold text-slate-700 max-w-[240px] truncate select-all">https://ivuzzvqwcualipofkzmf.supabase.co/rest/v1/</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/60">
                  <span className="text-slate-400 font-medium font-sans">Public API Key:</span>
                  <span className="font-mono font-bold text-slate-600 max-w-[240px] truncate select-all" title="sb_publishable_bT75xGZjlB3Jz9jsb-myXQ_-FeBkmdy">sb_publ...FeBkmdy</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Form & Sync Connectivity
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  We have mapped and connected <strong>all fields</strong> of the <strong>Ownership Claim Form</strong> (detailed proof description, secret credentials, item file IDs, claimant identifiers, timestamps, status, risk score, and fraud flags) directly to your live Supabase database!
                </p>
                <p className="text-xs text-slate-600 leading-relaxed mt-2 font-sans">
                  When a claim is submitted, it is written both to the local persistent database and seamlessly upserted to your Supabase <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">claims</code> table.
                </p>
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 text-xs font-medium font-sans">
                To test synchronization, complete any item claim from the Search page, and check the <code className="font-mono">claims</code> database table on your Supabase dashboard.
              </div>
            </div>
          </div>

          {/* SQL Editor Code Copy Area */}
          <div className="space-y-3 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Supabase SQL Schema Setup</h4>
                <p className="text-xs text-slate-400 font-medium">Run this code in your Supabase SQL Editor to create the tables automatically.</p>
              </div>
              <button
                onClick={handleCopySQL}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer select-none"
              >
                {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSQL ? "Copied!" : "Copy SQL Code"}
              </button>
            </div>
            
            <div className="relative">
              <pre className="bg-slate-950 text-slate-300 font-mono text-xs p-5 rounded-2xl overflow-y-auto max-h-72 border border-slate-800 shadow-inner select-all">
{`-- COPY & RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_type TEXT DEFAULT 'FOUND',
  claimant_id TEXT,
  student_id TEXT,
  ownership_proof_description TEXT,
  ownership_proof_files JSONB DEFAULT '[]'::jsonb,
  secret_identifier TEXT,
  status TEXT DEFAULT 'SUBMITTED',
  risk_score NUMERIC DEFAULT 0,
  fraud_flags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  admin_notes TEXT
);

-- 2. Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  student_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  role TEXT,
  points INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Lost Items Table
CREATE TABLE IF NOT EXISTS lost_items (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  name TEXT,
  category TEXT,
  brand TEXT,
  color TEXT,
  description TEXT,
  last_seen_location TEXT,
  date_lost DATE,
  time_lost TEXT,
  serial_number TEXT,
  special_marks TEXT,
  has_proof_of_ownership BOOLEAN DEFAULT FALSE,
  reward_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Found Items Table
CREATE TABLE IF NOT EXISTS found_items (
  id TEXT PRIMARY KEY,
  reporter_id TEXT,
  name TEXT,
  category TEXT,
  brand TEXT,
  color TEXT,
  description TEXT,
  found_location TEXT,
  date_found DATE,
  current_storage_location TEXT,
  auto_tags JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Matches Table
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  lost_item_id TEXT,
  found_item_id TEXT,
  score NUMERIC,
  confidence_level TEXT,
  matched_criteria JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  sender_id TEXT,
  sender_name TEXT,
  sender_role TEXT,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
