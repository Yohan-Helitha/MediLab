import React, { useState, useRef, useEffect } from "react";
import PublicLayout from "../../layout/PublicLayout";
import { consultationApi } from "../../api/consultationApi";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import ReactMarkdown from 'react-markdown';

// Safety net: strips raw JSON error payloads before showing to user
const sanitizeErrorMessage = (msg) => {
  if (!msg) return 'Something went wrong. Please try again.';
  const lowerMsg = msg.toLowerCase();
  
  if (lowerMsg.includes('500') || lowerMsg.includes('failed') || lowerMsg.includes('undefined')) {
    return "I'm sorry, I'm having a little trouble connecting to my medical database right now. Please try again in a few seconds!";
  }

  if (msg.trim().startsWith('{') || msg.includes('"error":') || msg.includes('"status":')) {
    return 'Dr. MediLab is currently attending to many patients. Please try again in a moment.';
  }
  return msg;
};

function AIDoctorChatPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Chatbot State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const isInitialMount = useRef(true);

  // User-specific storage key
  const storageKey = user?._id || user?.id || user?.systemId 
    ? `mediLabChatHistory_${user._id || user.id || user.systemId}`
    : "mediLabChatHistory_guest";

  // Persistent Chat: Load from localStorage on mount or when user changes
  useEffect(() => {
    const savedChat = localStorage.getItem(storageKey);
    if (savedChat) {
      setChatHistory(JSON.parse(savedChat));
    } else {
      setChatHistory([]);
    }
    isInitialMount.current = true; // Reset initial mount flag on user change
  }, [storageKey]);

  // Sync chat history to localStorage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0 || localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(chatHistory));
    }
    
    // Prevent scrolling to bottom on the very first load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (chatHistory.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, storageKey]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const now = new Date();
    const userMsg = { 
      role: "user", 
      content: chatMessage,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const response = await consultationApi.chatWithAI(chatMessage, user?.fullName || user?.name, chatHistory);
      const nowAI = new Date();
      const aiMsg = { 
        role: "assistant", 
        content: response.reply || response.data?.reply || "No response received.",
        timestamp: nowAI.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: nowAI.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatHistory((prev) => [...prev, { role: "error", content: sanitizeErrorMessage(error.message) }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-slate-50/50 py-10 px-4 md:px-8">
        <div className="max-w-[800px] mx-auto space-y-8">
          
          <div className="bg-white rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden min-h-[920px] flex flex-col">
            
            {/* Header Rendering */}
            <div className="bg-teal-700 px-8 py-6 md:px-10 text-white relative overflow-hidden transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.453-.914l-.547-.547z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-teal-100 italic">
                    {t("aiDoctor.badge")}
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {t("navbar.aiDoctorChat")}
                </h1>
                <p className="text-teal-50/70 text-xs font-medium max-w-xl leading-relaxed mt-1 italic">
                  {t("aiDoctor.subtitle")}
                </p>
              </div>
            </div>

            {/* Content Rendering */}
            <div className="p-8 md:p-12 flex flex-col h-[820px] animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                     <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest italic">{t("aiDoctor.historyPersistent")}</span>
                   </div>
                   {chatHistory.length > 0 && (
                     <button 
                       onClick={() => {
                         if(confirm(t("aiDoctor.clearConfirm"))) {
                           setChatHistory([]);
                           localStorage.removeItem(storageKey);
                         }
                       }}
                       className="text-[10px] font-bold text-rose-400 hover:text-rose-600 uppercase tracking-widest transition-colors flex items-center gap-1"
                     >
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       {t("aiDoctor.clearButton")}
                     </button>
                   )}
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
                  {chatHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium italic">{t("aiDoctor.emptyPrompt")}</p>
                    </div>
                  ) : (
                    chatHistory.map((msg, idx) => {
                      const showDateSeparator = idx === 0 || msg.date !== chatHistory[idx - 1].date;
                      return (
                        <React.Fragment key={idx}>
                          {showDateSeparator && msg.date && (
                            <div className="flex justify-center my-6">
                              <span className="bg-slate-200/50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm">
                                {msg.date}
                              </span>
                            </div>
                          )}
                          <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                                ? 'bg-teal-700 text-white rounded-tr-none' 
                                : msg.role === 'error'
                                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                            }`}>
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.timestamp && (
                              <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium italic">
                                {msg.timestamp}
                              </span>
                            )}
                          </div>
                        </React.Fragment>
                      );
                    })
                  )}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.5s]"></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="relative mt-auto">
                  <input 
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={t("aiDoctor.inputPlaceholder")}
                    className="w-full py-4 pl-6 pr-14 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 text-sm focus:border-teal-500/30 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                    disabled={chatLoading}
                  />
                  <button 
                    type="submit"
                    disabled={!chatMessage.trim() || chatLoading}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-teal-700 text-white rounded-xl hover:bg-teal-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </form>
            </div>

            {/* Security Footer (Constant) */}
            <div className="bg-slate-50 px-8 py-5 flex flex-col md:flex-row items-center justify-between border-t border-slate-100 gap-4 mt-auto">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[14px] font-bold text-slate-400 uppercase">{t("ai.common.security.aes")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[14px] font-bold text-slate-400 uppercase">{t("ai.common.security.hipaa")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-slate-300 uppercase ">{t("ai.common.security.engineLabel")}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default AIDoctorChatPage;
