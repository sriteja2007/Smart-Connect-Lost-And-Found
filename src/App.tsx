import React, { useState, useEffect } from "react";
import { 
  Shield, Bell, Search, MapPin, MessageSquare, Award, Sparkles, 
  LogOut, Menu, User, BookOpen, UserCheck, Settings, Home, FileText
} from "lucide-react";

import { User as UserType, UserRole, LostItem, FoundItem, Claim, ClaimStatus, Message, Notification, Badge, LeaderboardEntry } from "./types";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import SearchPage from "./components/SearchPage";
import InteractiveMap from "./components/InteractiveMap";
import ClaimsManager from "./components/ClaimsManager";
import RealTimeChat from "./components/RealTimeChat";
import AdminConsole from "./components/AdminConsole";
import AIAssistant from "./components/AIAssistant";
import GamificationCenter from "./components/GamificationCenter";
import Background3DScene from "./components/Background3DScene";

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("landing"); // landing, login, dashboard, search, map, claims, chat, admin, assistant, gamification
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Data States
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<UserType[]>([]);

  // Active chat details
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState("");
  const [loginStudentId, setLoginStudentId] = useState("");
  const [registerForm, setRegisterForm] = useState({
    name: "",
    studentId: "",
    email: "",
    phone: "",
    department: "Computer Science",
    role: "STUDENT"
  });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // --------------------------------------------------------
  // FETCH SYNCING FUNCTIONS
  // --------------------------------------------------------
  const fetchAllData = async () => {
    try {
      const [lostRes, foundRes, claimsRes, badgesRes, usersRes] = await Promise.all([
        fetch("/api/lost-items"),
        fetch("/api/found-items"),
        fetch("/api/claims"),
        fetch("/api/gamification/badges"),
        fetch("/api/users")
      ]);

      const [lostData, foundData, claimsData, badgesData, usersData] = await Promise.all([
        lostRes.json(),
        foundRes.json(),
        claimsRes.json(),
        badgesRes.json(),
        usersRes.json()
      ]);

      if (lostData.items) setLostItems(lostData.items);
      if (foundData.items) setFoundItems(foundData.items);
      if (claimsData.claims) setClaims(claimsData.claims);
      if (badgesData.badges) setBadges(badgesData.badges);
      if (usersData.users) setUsersList(usersData.users);

      // Fetch user-specific notifications
      if (currentUser) {
        const notRes = await fetch(`/api/notifications/${currentUser.id}`);
        const notData = await notRes.json();
        if (notData.notifications) setNotifications(notData.notifications);

        // Fetch leaderboard
        const ldRes = await fetch("/api/gamification/leaderboard");
        const ldData = await ldRes.json();
        if (ldData.leaderboard) setLeaderboard(ldData.leaderboard);

        // Fetch analytics if admin/security
        if (currentUser.role === UserRole.SECURITY_OFFICE || currentUser.role === UserRole.SUPER_ADMIN) {
          const analyRes = await fetch("/api/analytics/dashboard");
          const analyData = await analyRes.json();
          setAnalytics(analyData);
        }
      }
    } catch (error) {
      console.error("Failed to sync client data with Express server API:", error);
    }
  };

  // Run initial loading
  useEffect(() => {
    fetchAllData();
    // Poll data every 10 seconds for real-time feel (chat sync & smart matching updates)
    const interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Sync specific active chat messages
  useEffect(() => {
    if (activeConversationId) {
      const syncChat = async () => {
        try {
          const res = await fetch(`/api/messages/${activeConversationId}`);
          const data = await res.json();
          if (data.messages) setMessages(data.messages);
        } catch (err) {
          console.error("Failed to fetch chat thread messages:", err);
        }
      };
      syncChat();
      const chatInterval = setInterval(syncChat, 3000);
      return () => clearInterval(chatInterval);
    }
  }, [activeConversationId]);

  // --------------------------------------------------------
  // AUTH SERVICE HANDLERS
  // --------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, studentId: loginStudentId })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        setActiveTab("dashboard");
      } else {
        setAuthError(data.error || "Login credentials failed.");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setAuthSuccess("Registration successful! Signing you in...");
        setTimeout(() => {
          setCurrentUser(data.user);
          setActiveTab("dashboard");
          setAuthSuccess("");
        }, 1500);
      } else {
        setAuthError(data.error || "Failed to register user account.");
      }
    } catch (err) {
      setAuthError("Failed to connect to server backend registry.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("landing");
    setIsMobileMenuOpen(false);
  };

  // --------------------------------------------------------
  // ACTIONS HANDLERS
  // --------------------------------------------------------
  const handleReportLost = async (formData: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/lost-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, reporterId: currentUser.id })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to post lost item report:", err);
    }
  };

  const handleReportFound = async (formData: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/found-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, reporterId: currentUser.id })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to post found item report:", err);
    }
  };

  const handleSubmitClaim = async (claimData: any) => {
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(claimData)
      });
      if (res.ok) {
        fetchAllData();
        setActiveTab("claims");
      }
    } catch (err) {
      console.error("Failed to submit property claim request:", err);
    }
  };

  const handleUpdateClaimStatus = async (claimId: string, status: ClaimStatus, notes?: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (err) {
      console.error("Failed to update claim verification status:", err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!currentUser || !activeConversationId) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text
        })
      });
      if (res.ok) {
        // Optimistically pull thread
        const msgRes = await fetch(`/api/messages/${activeConversationId}`);
        const msgData = await msgRes.json();
        if (msgData.messages) setMessages(msgData.messages);

        // Also simulate an instant reply from Security Staff or opposing Student after 2 seconds
        if (activeConversationId.startsWith("claim_")) {
          setTimeout(async () => {
            const replySenderName = currentUser.role === UserRole.STUDENT ? "Officer Dave Robinson" : "Claimant Alice";
            const replySenderRole = currentUser.role === UserRole.STUDENT ? UserRole.SECURITY_OFFICE : UserRole.STUDENT;
            const replyText = currentUser.role === UserRole.STUDENT 
              ? "Thanks for providing details. I am reviewing the receipt now on row Locker-A. It matches our index data. Please visit Desk Ground soon." 
              : "I have provided all correct proofs. Please let me know once verified. Appreciate your diligent return efforts!";

            await fetch("/api/messages", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                conversationId: activeConversationId,
                senderId: "simulated_responder",
                senderName: replySenderName,
                senderRole: replySenderRole,
                text: replyText
              })
            });
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleAskAI = async (message: string, chatHistory: any[]) => {
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, chatHistory })
      });
      const data = await res.json();
      return data.reply || "I am processing high volumes. Please try again.";
    } catch (err) {
      return "Unable to connect to AI server.";
    }
  };

  const handleReadNotifications = async () => {
    if (!currentUser) return;
    try {
      await fetch(`/api/notifications/${currentUser.id}/read`, { method: "POST" });
      fetchAllData();
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  // --------------------------------------------------------
  // ROUTE SWITCH RENDERER
  // --------------------------------------------------------
  const renderContent = () => {
    if (activeTab === "landing") {
      return (
        <LandingPage 
          onStart={() => setActiveTab("login")} 
          onExplorePublic={() => {
            // Let them browse as guest (Alice simulated session)
            setCurrentUser(usersList[0] || {
              id: "user1",
              name: "Alice Chen",
              email: "alice.chen@campus.edu",
              studentId: "S202451",
              role: UserRole.STUDENT,
              points: 150,
              badges: ["badge1"],
              department: "Computer Science",
              createdAt: new Date().toISOString()
            });
            setActiveTab("search");
          }} 
        />
      );
    }

    if (activeTab === "login") {
      return (
        <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden bg-[#050816]">
          {/* Cyber backgrounds */}
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="glass-panel p-8 md:p-10 rounded-[32px] w-full max-w-5xl grid md:grid-cols-2 gap-10 border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative z-10">
            {/* Left Login Form */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-400">Identity Security</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">Control</span> Hub
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">Authenticate with your digital credentials to establish a secure viewport session.</p>
              </div>

              {authError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-2">
                  <span className="font-mono text-[14px]">⚠️</span> {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus Mail Address</label>
                  <input 
                    type="email" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder="student@campus.edu" 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium text-slate-100 placeholder-slate-600 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Student / Employee ID</label>
                    <span className="text-[10px] text-blue-400 font-bold hover:underline cursor-pointer tracking-wide">Request Access?</span>
                  </div>
                  <input 
                    type="text" 
                    value={loginStudentId} 
                    onChange={e => setLoginStudentId(e.target.value)}
                    placeholder="e.g. S202451" 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm font-medium text-slate-100 placeholder-slate-600 transition-all font-mono"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(96,165,250,0.5)] cursor-pointer"
                >
                  Confirm Identity Log in
                </button>
              </form>

              {/* Instant Account Selectors for Demo Testing */}
              <div className="border-t border-white/10 pt-5 space-y-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block font-mono">Bypass Authentication (Sandbox Simulators):</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <button 
                    onClick={() => {
                      setLoginEmail("alice.chen@campus.edu");
                      setLoginStudentId("S202451");
                    }}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl text-slate-300 border border-white/10 hover:border-blue-500/30 cursor-pointer text-left truncate transition-all"
                  >
                    👩‍🎓 Student: Alice Chen
                  </button>
                  <button 
                    onClick={() => {
                      setLoginEmail("bob.jones@campus.edu");
                      setLoginStudentId("S202488");
                    }}
                    className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded-xl text-slate-300 border border-white/10 hover:border-blue-500/30 cursor-pointer text-left truncate transition-all"
                  >
                    👨‍🎓 Student: Bob Jones
                  </button>
                  <button 
                    onClick={() => {
                      setLoginEmail("dave.robinson@campus.edu");
                      setLoginStudentId("SEC-007");
                    }}
                    className="p-3 bg-blue-950/40 hover:bg-blue-950/60 text-blue-300 rounded-xl border border-blue-500/20 hover:border-blue-500/50 cursor-pointer text-left truncate col-span-2 transition-all"
                  >
                    👮 Security Desk: Dave Robinson (Staff Admin)
                  </button>
                </div>
              </div>
            </div>

            {/* Right Registration Form */}
            <div className="border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-10 space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-500 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400">Registry System</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  Enlist <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-mono">Terminal</span>
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">Establish a brand new secure operator profile registered inside the central database.</p>
              </div>

              {authSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl text-xs font-semibold">
                  ✓ {authSuccess}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={registerForm.name}
                      onChange={e => setRegisterForm({...registerForm, name: e.target.value})}
                      placeholder="John Doe" 
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 transition-all font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus Code ID</label>
                    <input 
                      type="text" 
                      required
                      value={registerForm.studentId}
                      onChange={e => setRegisterForm({...registerForm, studentId: e.target.value})}
                      placeholder="e.g. S202499" 
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={registerForm.email}
                    onChange={e => setRegisterForm({...registerForm, email: e.target.value})}
                    placeholder="john.doe@campus.edu" 
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 text-xs font-medium text-slate-100 placeholder-slate-600 transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                    <select 
                      value={registerForm.department}
                      onChange={e => setRegisterForm({...registerForm, department: e.target.value})}
                      className="w-full px-3 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-purple-500 text-xs font-medium text-slate-100 font-mono"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Business School">Business School</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Category</label>
                    <select 
                      value={registerForm.role}
                      onChange={e => setRegisterForm({...registerForm, role: e.target.value})}
                      className="w-full px-3 py-3 rounded-2xl bg-slate-900/50 border border-white/10 focus:outline-none focus:border-purple-500 text-xs font-medium text-slate-100 font-mono"
                    >
                      <option value="STUDENT">Student</option>
                      <option value="FACULTY_STAFF">Faculty / Staff</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(217,70,239,0.5)] cursor-pointer"
                >
                  Create Terminal Profile
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    if (!currentUser) return null;

    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            user={currentUser} 
            lostItems={lostItems} 
            foundItems={foundItems} 
            claimsCount={claims.filter(c => c.claimantId === currentUser.id).length}
            matchesCount={notifications.filter(n => n.type === "MATCH" && !n.read).length}
            onNavigate={setActiveTab}
            onReportLost={handleReportLost}
            onReportFound={handleReportFound}
          />
        );
      case "search":
        return (
          <SearchPage 
            user={currentUser} 
            lostItems={lostItems} 
            foundItems={foundItems} 
            matches={claims} // Pass claims as indicators
            onSubmitClaim={handleSubmitClaim}
          />
        );
      case "map":
        return <InteractiveMap lostItems={lostItems} foundItems={foundItems} />;
      case "claims":
        return (
          <ClaimsManager 
            user={currentUser} 
            claims={claims} 
            foundItems={foundItems} 
            usersList={usersList}
            onUpdateClaimStatus={handleUpdateClaimStatus}
            onOpenChat={(convId) => {
              setActiveConversationId(convId);
              setActiveTab("chat");
            }}
          />
        );
      case "chat":
        return activeConversationId ? (
          <div className="max-w-4xl mx-auto py-6">
            <RealTimeChat 
              user={currentUser} 
              conversationId={activeConversationId} 
              messages={messages} 
              onSendMessage={handleSendMessage}
              onClose={() => setActiveTab("claims")}
            />
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">No active chat thread selected.</div>
        );
      case "assistant":
        return <AIAssistant onAskAI={handleAskAI} />;
      case "gamification":
        return <GamificationCenter user={currentUser} badges={badges} leaderboard={leaderboard} />;
      case "admin":
        return (
          <AdminConsole 
            user={currentUser} 
            analytics={analytics} 
            claims={claims} 
            usersList={usersList}
            onOpenClaim={(claimId) => {
              setActiveConversationId(`claim_${claimId}`);
              setActiveTab("chat");
            }}
          />
        );
      default:
        return <div className="text-center py-20">Route not found</div>;
    }
  };

  const isStaff = currentUser && (currentUser.role === UserRole.SECURITY_OFFICE || currentUser.role === UserRole.SUPER_ADMIN);

  return (
    <div className="bg-[#050816] min-h-screen flex flex-col justify-between font-sans selection:bg-blue-500/30 selection:text-white relative">
      <Background3DScene />
      
      {/* Top Navbar Header (Visible inside application when user logged in) */}
      {currentUser && activeTab !== "landing" && (
        <header className="glass-panel sticky top-4 mx-4 md:mx-6 my-4 rounded-[24px] z-40 px-6 py-3.5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setActiveTab("dashboard")}>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.7)] transition-all">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-base group-hover:text-blue-400 transition-colors">CampusConnect</span>
                <span className="text-[9px] block text-slate-400 font-mono uppercase tracking-widest">Lost & Found Portal</span>
              </div>
            </div>

            {/* Desktop Nav menu links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-400">
              <button 
                onClick={() => setActiveTab("dashboard")} 
                className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "dashboard" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
              >
                <Home className="w-4 h-4" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("search")} 
                className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "search" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
              >
                <Search className="w-4 h-4" /> Registry Search
              </button>
              <button 
                onClick={() => setActiveTab("map")} 
                className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "map" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
              >
                <MapPin className="w-4 h-4" /> Incident Map
              </button>
              <button 
                onClick={() => setActiveTab("claims")} 
                className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "claims" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
              >
                <FileText className="w-4 h-4" /> Claims Inbox
              </button>
              <button 
                onClick={() => setActiveTab("gamification")} 
                className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "gamification" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
              >
                <Award className="w-4 h-4" /> Leaderboard
              </button>
              <button 
                onClick={() => setActiveTab("assistant")} 
                className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "assistant" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
              >
                <Sparkles className="w-4 h-4" /> AI Assistant
              </button>
              {isStaff && (
                <button 
                  onClick={() => setActiveTab("admin")} 
                  className={`flex items-center gap-1.5 transition py-1 cursor-pointer ${activeTab === "admin" ? "text-blue-400 border-b-2 border-blue-400 glow-text-primary" : "hover:text-slate-200"}`}
                >
                  <Settings className="w-4 h-4" /> Admin Console
                </button>
              )}
            </nav>

            {/* Profile stats & Alert bell controls */}
            <div className="flex items-center gap-4">
              
              {/* Notification bell dropdown toggle */}
              <div className="relative">
                <button 
                  onClick={() => {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                    if (!showNotificationsDropdown) {
                      handleReadNotifications();
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-white/10 relative transition cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-extrabold animate-bounce">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-3 bg-slate-950/90 border border-white/10 rounded-2xl shadow-2xl w-80 py-3 z-50 text-xs backdrop-blur-md">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-white/5">
                      <span className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px] font-mono">Inbox Notifications</span>
                      <button onClick={handleReadNotifications} className="text-blue-400 hover:underline text-[10px] font-bold">Mark all read</button>
                    </div>
                    <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                      {notifications.map((not, i) => (
                        <div key={i} className={`p-3.5 transition hover:bg-white/5 ${!not.read ? "bg-blue-500/5 font-medium border-l-2 border-blue-500" : ""}`}>
                          <span className="font-bold text-slate-200 block">{not.title}</span>
                          <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{not.message}</p>
                          <span className="text-[9px] text-slate-500 block mt-1.5 font-mono">{not.createdAt.substring(11, 16)}</span>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="text-center py-6 text-slate-500 font-mono">Zero notification alerts.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile card dropdown & sign-out */}
              <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                <div className="hidden sm:block text-right">
                  <span className="block text-xs font-bold text-slate-200 leading-tight">{currentUser.name}</span>
                  <span className="text-[8px] font-mono font-extrabold text-blue-400 uppercase tracking-wider">{currentUser.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-xl bg-slate-900/60 border border-white/10 transition cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile menu trigger */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-white/10 block lg:hidden cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile menu panel dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/5 bg-slate-950 p-4 space-y-2 text-xs font-bold text-slate-400 flex flex-col rounded-b-2xl">
              <button onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left">Dashboard</button>
              <button onClick={() => { setActiveTab("search"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left">Registry Search</button>
              <button onClick={() => { setActiveTab("map"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left">Incident Map</button>
              <button onClick={() => { setActiveTab("claims"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left">Claims Inbox</button>
              <button onClick={() => { setActiveTab("gamification"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left">Leaderboard</button>
              <button onClick={() => { setActiveTab("assistant"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left">AI Assistant</button>
              {isStaff && (
                <button onClick={() => { setActiveTab("admin"); setIsMobileMenuOpen(false); }} className="p-2.5 hover:bg-white/5 rounded-xl text-left text-blue-400">Admin Console</button>
              )}
            </div>
          )}
        </header>
      )}

      {/* Main Container Content */}
      <main className="flex-1 px-4 md:px-6 py-6 max-w-7xl w-full mx-auto">
        {renderContent()}
      </main>

      {/* Mobile Bottom Bar Navigation (When logged in) */}
      {currentUser && activeTab !== "landing" && (
        <div className="lg:hidden bg-slate-950/90 border-t border-white/10 sticky bottom-0 left-0 right-0 py-3 px-4 flex justify-around items-center z-40 shadow-2xl backdrop-blur-lg">
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === "dashboard" ? "text-blue-400" : "text-slate-500"}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] font-bold">Home</span>
          </button>
          <button 
            onClick={() => setActiveTab("search")} 
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === "search" ? "text-blue-400" : "text-slate-500"}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[9px] font-bold">Search</span>
          </button>
          <button 
            onClick={() => setActiveTab("map")} 
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === "map" ? "text-blue-400" : "text-slate-500"}`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[9px] font-bold">Map</span>
          </button>
          <button 
            onClick={() => setActiveTab("claims")} 
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === "claims" ? "text-blue-400" : "text-slate-500"}`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-bold">Claims</span>
          </button>
          <button 
            onClick={() => setActiveTab("assistant")} 
            className={`flex flex-col items-center gap-1 cursor-pointer ${activeTab === "assistant" ? "text-blue-400" : "text-slate-500"}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[9px] font-bold">Assistant</span>
          </button>
        </div>
      )}
    </div>
  );
}
