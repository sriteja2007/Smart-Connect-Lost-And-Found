import React, { useState } from "react";
import { 
  CheckCircle, Clock, AlertTriangle, ShieldAlert, Sparkles, 
  MessageSquare, ChevronRight, User, Award, Check, X, FileText, Lock
} from "lucide-react";
import { User as UserType, Claim, UserRole, ClaimStatus } from "../types";
import ItemPreview3D from "./ItemPreview3D";
import { motion } from "motion/react";

interface ClaimsManagerProps {
  user: UserType;
  claims: Claim[];
  foundItems: any[];
  usersList: UserType[];
  onUpdateClaimStatus: (claimId: string, status: ClaimStatus, notes?: string) => void;
  onOpenChat: (conversationId: string) => void;
}

export default function ClaimsManager({
  user,
  claims,
  foundItems,
  usersList,
  onUpdateClaimStatus,
  onOpenChat
}: ClaimsManagerProps) {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const isStaff = user.role === UserRole.SECURITY_OFFICE || user.role === UserRole.SUPER_ADMIN;

  // Filter claims based on user role
  const visibleClaims = isStaff 
    ? claims 
    : claims.filter(c => c.claimantId === user.id);

  const activeClaim = claims.find(c => c.id === selectedClaimId);

  // Stepper definition
  const stages: { status: ClaimStatus; label: string; desc: string }[] = [
    { status: "SUBMITTED", label: "Submitted", desc: "Claim logged in secure queue" },
    { status: "REVIEW", label: "Review", desc: "Security is checking details" },
    { status: "VERIFICATION", label: "Verification", desc: "Verifying serial keys/receipts" },
    { status: "APPROVED", label: "Approved", desc: "Ready for desk collection" },
    { status: "RECOVERED", label: "Recovered", desc: "Handover complete" }
  ];

  const getStageIndex = (status: ClaimStatus): number => {
    return stages.findIndex(s => s.status === status);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Claims Verification Suite</h2>
        <p className="text-sm text-slate-500 font-medium">
          {isStaff 
            ? "Campus Security Command Panel. Audit claims cases, evaluate duplicate risks, and process secure handovers."
            : "Monitor active property claims, verify lock screens/receipt approvals, and communicate with ground offices."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Claims Inbox list (Left 1/2 columns) */}
        <div className="lg:col-span-1 bg-white border border-slate-100 p-5 rounded-3xl shadow-sm space-y-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">Claims Inbox ({visibleClaims.length})</h3>
          
          <div className="space-y-3">
            {visibleClaims.map((claim, i) => {
              const matchedItem = foundItems.find(fi => fi.id === claim.itemId);
              const claimantUser = usersList.find(u => u.id === claim.claimantId);
              const isSelected = claim.id === selectedClaimId;

              return (
                <div 
                  key={i}
                  onClick={() => {
                    setSelectedClaimId(claim.id);
                    setAdminNotes(claim.adminNotes || "");
                  }}
                  className={`p-4 rounded-2xl border transition text-left cursor-pointer ${isSelected ? "border-blue-500 bg-blue-50/20 shadow-sm" : "border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-slate-200/60 text-slate-700 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold">
                      ID: {claim.id.substring(6)}
                    </span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${claim.status === "RECOVERED" ? "bg-emerald-100 text-emerald-800" : claim.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                      {claim.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm truncate">{matchedItem ? matchedItem.name : "Unknown Item"}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">Claimant: {claimantUser ? claimantUser.name : "Generic"}</p>
                  
                  {isStaff && claim.riskScore >= 40 && (
                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-2 bg-red-50 p-1.5 rounded-lg border border-red-100">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>Fraud Flag Risk Level: {claim.riskScore}%</span>
                    </div>
                  )}
                </div>
              );
            })}

            {visibleClaims.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active claims found. Let's make sure you file ownership claims first.
              </div>
            )}
          </div>
        </div>

        {/* Claim Details and Stepper Workspace (Right 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {activeClaim ? (
            <>
              {/* Stepper Workflow */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-6">Verification Progress Stepper</h3>
                
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {stages.map((st, idx) => {
                    const currentIdx = getStageIndex(activeClaim.status);
                    const isCompleted = idx <= currentIdx && activeClaim.status !== "REJECTED";
                    const isCurrent = idx === currentIdx && activeClaim.status !== "REJECTED";

                    return (
                      <div key={idx} className="flex md:flex-col items-center gap-3 text-left md:text-center flex-1 relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition ${isCompleted ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isCurrent ? "text-blue-600 font-extrabold" : "text-slate-700"}`}>
                            {st.label}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden md:block mt-0.5 leading-tight">{st.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                  {activeClaim.status === "REJECTED" && (
                    <div className="absolute inset-0 bg-red-50/90 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl border border-red-100 p-4">
                      <div className="text-center text-red-800 font-bold space-y-1">
                        <X className="w-8 h-8 mx-auto text-red-600 bg-white p-1 rounded-full border border-red-200" />
                        <span className="block text-base">Claim Rejected / Dispute Flagged</span>
                        <p className="text-xs font-medium max-w-sm">Security review failed. Please contact office Ground Desk for details.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Claim audit details */}
              <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Case Review Folder</h3>
                    <p className="text-xs text-slate-400">Filed on: {activeClaim.createdAt.substring(0, 10)}</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onOpenChat(`claim_${activeClaim.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 transition cursor-pointer shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Open Security Chat
                  </motion.button>
                </div>

                {/* 3D Holographic item visual representation in verification folder */}
                {(() => {
                  const item = foundItems.find(fi => fi.id === activeClaim.itemId);
                  if (!item) return null;
                  return (
                    <div className="w-full h-48 bg-slate-950 rounded-2xl border border-slate-100 overflow-hidden relative flex items-center justify-center group shadow-inner">
                      <ItemPreview3D 
                        category={item.category} 
                        colorName={item.color} 
                        itemName={item.name}
                        compact={true}
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/90 border border-white/10 px-2 py-0.5 rounded-md text-[8px] font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1 shadow">
                        <Sparkles className="w-2.5 h-2.5 text-purple-400 animate-pulse" />
                        Interactive 3D Hologram
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono text-slate-300 flex items-center gap-1.5 shadow">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                        {item.name} ({item.color})
                      </div>
                    </div>
                  );
                })()}

                {/* Audit rows */}
                <div className="grid md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Claimant Student ID</span>
                      <strong className="text-slate-800 text-sm mt-0.5 block">{activeClaim.studentId}</strong>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Ownership Proof Description</span>
                      <p className="text-slate-700 mt-1 font-medium bg-white p-2.5 rounded-lg border border-slate-150">{activeClaim.ownershipProofDescription}</p>
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Secret Identifying Key</span>
                      <div className="flex items-center gap-2 mt-1 text-slate-700 font-semibold bg-white p-2.5 rounded-lg border border-slate-150">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>"{activeClaim.secretIdentifier}"</span>
                      </div>
                    </div>
                    {isStaff && (
                      <div>
                        <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider block">Fraud Prevention Flags</span>
                        <div className="mt-1 space-y-1">
                          {activeClaim.fraudFlags.length > 0 ? activeClaim.fraudFlags.map((flg, i) => (
                            <span key={i} className="block text-[10px] bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded font-bold">
                              ⚠️ {flg}
                            </span>
                          )) : (
                            <span className="block text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded font-bold">
                              ✓ Zero Fraud flags. High integrity rating
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Admin Audit notes and actions (visible only to Security Staff) */}
                {isStaff ? (
                  <div className="border-t border-slate-100 pt-5 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase block">Security Action Notes *</label>
                      <input 
                        type="text"
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="e.g. Serial key matched database index SN812K. Ready for handover."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-sm font-medium"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {activeClaim.status === "SUBMITTED" && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onUpdateClaimStatus(activeClaim.id, "REVIEW", adminNotes)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition cursor-pointer flex items-center gap-1 shadow"
                        >
                          <Clock className="w-4 h-4" /> Move to Review
                        </motion.button>
                      )}
                      
                      {activeClaim.status === "REVIEW" && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onUpdateClaimStatus(activeClaim.id, "VERIFICATION", adminNotes)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition cursor-pointer flex items-center gap-1 shadow"
                        >
                          <FileText className="w-4 h-4" /> Move to Verification
                        </motion.button>
                      )}

                      {(activeClaim.status === "VERIFICATION" || activeClaim.status === "SUBMITTED" || activeClaim.status === "REVIEW") && (
                        <>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onUpdateClaimStatus(activeClaim.id, "APPROVED", adminNotes)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 shadow"
                          >
                            <CheckCircle className="w-4 h-4" /> Approve Claim
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onUpdateClaimStatus(activeClaim.id, "REJECTED", adminNotes)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer flex items-center gap-1 shadow"
                          >
                            <X className="w-4 h-4" /> Reject Case
                          </motion.button>
                        </>
                      )}

                      {activeClaim.status === "APPROVED" && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onUpdateClaimStatus(activeClaim.id, "RECOVERED", adminNotes);
                            setSelectedClaimId(null);
                          }}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer flex items-center gap-1.5 shadow"
                        >
                          <Award className="w-4.5 h-4.5" /> Handover Completed (Mark Recovered)
                        </motion.button>
                      )}
                    </div>
                  </div>
                ) : (
                  activeClaim.adminNotes && (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-700">
                      <strong className="block mb-1 text-slate-800">Security Office Case Notes:</strong>
                      "{activeClaim.adminNotes}"
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 space-y-3 shadow-sm h-full flex flex-col justify-center items-center">
              <div className="text-4xl">🗂️</div>
              <h3 className="font-bold text-slate-800 text-base">Select a Claim Case</h3>
              <p className="text-slate-500 text-xs max-w-sm">
                Select one of the properties claims from the inbox panel on the left to track detailed verification progress and read security notes.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
