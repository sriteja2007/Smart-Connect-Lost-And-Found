import React, { useState, useEffect, useRef } from "react";
import { Send, Image, File, Check, CheckCheck, ShieldAlert, Sparkles, User } from "lucide-react";
import { User as UserType, Message, UserRole } from "../types";

interface RealTimeChatProps {
  user: UserType;
  conversationId: string;
  messages: Message[];
  onSendMessage: (text: string, imageUrl?: string) => void;
  onClose?: () => void;
}

export default function RealTimeChat({
  user,
  conversationId,
  messages,
  onSendMessage,
  onClose
}: RealTimeChatProps) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText);
    setInputText("");

    // Simulate typing and replying state
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
    }, 2500);
  };

  const isStaff = user.role === UserRole.SECURITY_OFFICE || user.role === UserRole.SUPER_ADMIN;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-[550px] relative overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm">
            💬
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">Security & Claimant Direct Chat</h4>
            <p className="text-[10px] text-slate-400 font-mono">Case Conversation Reference: {conversationId.replace("claim_", "")}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 px-3 py-1 rounded-xl transition cursor-pointer">
            Close Panel
          </button>
        )}
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        <div className="text-center py-2 bg-slate-100 border border-slate-200 text-[10px] text-slate-500 rounded-xl font-semibold uppercase max-w-xs mx-auto">
          🔒 Secure End-to-End Chat Audited by Security
        </div>

        {messages.map((msg, i) => {
          const isMyMessage = msg.senderId === user.id;

          return (
            <div 
              key={i} 
              className={`flex items-start gap-2.5 max-w-[80%] ${isMyMessage ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Initials badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${isMyMessage ? "bg-blue-600" : "bg-slate-700"}`}>
                {msg.senderName.substring(0, 2).toUpperCase()}
              </div>

              <div className="space-y-1">
                <span className={`block text-[10px] font-bold text-slate-400 ${isMyMessage ? "text-right" : "text-left"}`}>
                  {msg.senderName} ({msg.senderRole})
                </span>
                
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${isMyMessage ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"}`}>
                  <p>{msg.text}</p>
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="shared attach" 
                      className="mt-2 rounded-lg max-w-full h-auto border border-slate-200" 
                    />
                  )}
                </div>

                <div className={`flex items-center gap-1 text-[9px] text-slate-400 font-medium ${isMyMessage ? "justify-end" : "justify-start"}`}>
                  <span>{msg.createdAt.substring(11, 16)}</span>
                  {isMyMessage && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2.5 mr-auto">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              CC
            </div>
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        <div ref={threadEndRef} />
      </div>

      {/* Input panel */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2 bg-white shrink-0">
        <button 
          type="button"
          onClick={() => {
            setInputText(prev => prev + " [Simulated Attachment: Photo_of_Receipt.png] ");
          }}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition cursor-pointer shrink-0"
          title="Share Purchase Receipt / Photo"
        >
          <Image className="w-5 h-5" />
        </button>
        <input 
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Type message regarding verification/collection desk..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs font-medium"
        />
        <button 
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
}
