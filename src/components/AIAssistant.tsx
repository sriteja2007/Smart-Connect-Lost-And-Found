import React, { useState } from "react";
import { Sparkles, Send, HelpCircle, Shield, Award, AlertCircle, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

interface AIAssistantProps {
  onAskAI: (message: string, history: ChatMessage[]) => Promise<string>;
}

export default function AIAssistant({ onAskAI }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ai", text: "Hello! I am your AI Campus Lost & Found Assistant, powered by Gemini. Ask me about our security policies, how to submit claims, collection hours, or how our points and badges system work!" }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    { text: "Where is the security office?", icon: "📍" },
    { text: "How does the claims process work?", icon: "📋" },
    { text: "What counts as secure proof?", icon: "🛡️" },
    { text: "How can I earn helper badges?", icon: "🏆" }
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { sender: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const responseText = await onAskAI(textToSend, messages);
      setMessages(prev => [...prev, { sender: "ai", text: responseText }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: "ai", text: "I'm experiencing higher traffic volumes on campus servers. Please check our FAQ page or visit the Ground Security desk." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-slate-100">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-6 rounded-[28px] border border-white/10 shadow-lg flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/35 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-mono uppercase flex items-center gap-2">
            Campus AI Assistant
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] px-2.5 py-0.5 rounded-full font-bold font-mono tracking-widest uppercase">GEMINI PRO</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Instant, server-side neural guidance on security protocols, collection schedules, and helpers XP.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick FAQs shortcuts (Left column) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Popular Inquiries</h3>
          
          <div className="space-y-2.5">
            {quickQuestions.map((qq, i) => (
              <motion.button
                key={i}
                disabled={isLoading}
                onClick={() => handleSend(qq.text)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-slate-950/40 border border-white/5 hover:border-purple-500/30 text-left text-xs font-semibold text-slate-300 rounded-2xl transition-all cursor-pointer flex items-center gap-3 disabled:opacity-50"
              >
                <span className="text-sm">{qq.icon}</span>
                <span className="font-mono">{qq.text}</span>
              </motion.button>
            ))}
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 p-4.5 rounded-2xl space-y-2 text-xs text-purple-300 font-mono">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-widest text-[9px] text-purple-400">
              <AlertCircle className="w-4 h-4" />
              Claim Notice
            </span>
            <p className="leading-relaxed font-light text-[11px] text-slate-400">
              AI provides instant informational lookups. Final verification audits and secure custody transfers must be processed physically at our Union Ground Desk counters.
            </p>
          </div>
        </div>

        {/* Chat Thread Panel (Right column) */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2 glass-panel border border-white/10 rounded-[28px] shadow-lg flex flex-col h-[480px] overflow-hidden"
        >
          
          {/* Thread list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
            {messages.map((msg, i) => {
              const isAi = msg.sender === "ai";

              return (
                <div key={i} className={`flex items-start gap-2.5 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 border ${isAi ? "bg-purple-500/20 text-purple-300 border-purple-500/35 shadow-[0_0_10px_rgba(168,85,247,0.15)]" : "bg-blue-500/20 text-blue-300 border-blue-500/35 shadow-[0_0_10px_rgba(59,130,246,0.15)]"}`}>
                    {isAi ? "✨" : "ME"}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-light ${isAi ? "bg-slate-900/80 border border-white/5 text-slate-200 rounded-tl-none font-mono" : "bg-blue-600 border border-blue-500 text-white rounded-tr-none"}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2.5 mr-auto">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/35 flex items-center justify-center text-xs font-bold shadow-[0_0_10px_rgba(168,85,247,0.15)] shrink-0">
                  ✨
                </div>
                <div className="bg-slate-900/80 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none text-xs text-slate-400 font-mono flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Neural network scanning...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }} 
            className="p-4 border-t border-white/10 bg-slate-950/80 flex gap-2 shrink-0"
          >
            <input 
              type="text"
              disabled={isLoading}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask anything about security rules, items, or points..."
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-900/40 border border-white/5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 text-xs font-medium text-slate-100 placeholder-slate-650 disabled:opacity-50 font-mono"
            />
            <button 
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-900 text-white border border-purple-500/30 px-5 py-3 rounded-2xl text-xs font-bold font-mono tracking-wider uppercase transition-all duration-300 shrink-0 flex items-center gap-1.5 shadow-[0_4px_15px_rgba(168,85,247,0.25)] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              SEND
            </button>
          </form>
        </motion.div>

      </div>
    </div>
  );
}
