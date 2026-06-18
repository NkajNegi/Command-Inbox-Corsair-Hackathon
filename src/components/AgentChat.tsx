"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AgentChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<{ role: "user" | "agent", content: string }[]>([
    { role: "agent", content: "Cognitive decrypt agent online. Input query parameters or enable audio link." }
  ]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-agent-chat", handleOpen);
    return () => window.removeEventListener("open-agent-chat", handleOpen);
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMsg = message.trim();
    setConversation(prev => [...prev, { role: "user", content: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await res.json();
      
      if (data.reply) {
        setConversation(prev => [...prev, { role: "agent", content: data.reply }]);
      } else {
        setConversation(prev => [...prev, { role: "agent", content: "Error: Query lookup failed." }]);
      }
    } catch (err) {
      console.error(err);
      setConversation(prev => [...prev, { role: "agent", content: "Error: Link timed out." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }
    
    const SpeechRecognition = ((window as unknown as Record<string, unknown>).SpeechRecognition ||
                               (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as new () => {
      continuous: boolean;
      interimResults: boolean;
      onstart: () => void;
      onresult: (event: {
        results: {
          [key: number]: {
            [key: number]: {
              transcript: string;
            };
          };
        };
      }) => void;
      onerror: (event: { error: string }) => void;
      onend: () => void;
      start: () => void;
    };
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: {
      results: {
        [key: number]: {
          [key: number]: {
            transcript: string;
          };
        };
      };
    }) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: { error: string }) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <>
      {/* Glowing Cyber Float Action Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] z-40 cursor-pointer flex items-center justify-center border border-amber-400/20"
        title="Ask Corsair Agent"
      >
        <Sparkles size={20} className="animate-pulse" />
      </button>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-[#121116] border border-[#232029] shadow-[0_20px_50px_rgba(0,0,0,0.95)] rounded flex flex-col z-50 overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="p-4 bg-[#18161f] border-b border-[#232029] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-amber-400" />
                <h3 className="font-mono text-xs font-bold text-zinc-300 uppercase tracking-widest">{"// DECRYPT_AGENT"}</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 hover:bg-zinc-900 rounded transition-colors cursor-pointer border border-transparent hover:border-zinc-800"
              >
                <X size={15} />
              </button>
            </div>

            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#0b0a0d]/40">
              {conversation.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div 
                    className={`max-w-[85%] rounded px-4 py-2.5 text-xs leading-relaxed border ${
                      msg.role === "user" 
                        ? "bg-zinc-900 border-zinc-850 text-zinc-100" 
                        : "bg-amber-950/20 border-amber-900/40 text-amber-350"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900/60 border border-zinc-850 text-zinc-455 rounded px-4 py-3">
                    <Loader2 size={14} className="animate-spin text-zinc-500" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-[#232029] bg-[#121116]">
              <div className="flex items-center bg-[#0b0a0d] border border-[#232029] rounded px-3 py-1.5 focus-within:border-amber-500/35 transition-colors">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Query agent or select mic..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-200 py-1.5 placeholder:text-zinc-700"
                />
                <button 
                  onClick={handleMicClick}
                  className={`p-1.5 rounded transition-all mr-1 cursor-pointer border ${isListening ? 'text-red-400 bg-red-950/20 border-red-900 animate-pulse' : 'text-zinc-500 hover:text-zinc-200 border-transparent hover:bg-zinc-900 hover:border-zinc-850'}`}
                  title="Voice dictation"
                >
                  <Mic size={14} />
                </button>
                <button 
                  onClick={handleSend}
                  disabled={!message.trim() || loading}
                  className="text-amber-400 p-1.5 hover:bg-amber-500/10 border border-transparent rounded hover:border-amber-900/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
