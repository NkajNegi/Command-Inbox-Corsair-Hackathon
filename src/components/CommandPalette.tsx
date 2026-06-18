"use client";

import { useEffect, useState } from "react";
import { Search, Mail, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchAction = () => {
    setIsOpen(false);
    window.dispatchEvent(new Event("open-email-search"));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/75 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full max-w-xl bg-[#121116] border border-[#232029] rounded shadow-[0_30px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col font-mono relative z-50"
        >
          {/* Input header */}
          <div className="flex items-center px-4 border-b border-[#232029] bg-[#18161f]">
            <Search className="text-zinc-500 w-4 h-4 mr-3" />
            <input 
              autoFocus
              className="flex-1 bg-transparent py-3.5 outline-none text-xs text-[#f4ebd0] placeholder:text-zinc-700 focus:outline-none"
              placeholder="Query command registers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-[9px] font-mono text-zinc-550 border border-zinc-800 bg-[#0b0a0d] px-1.5 py-0.5 rounded">ESC</span>
          </div>

          <div className="p-2 space-y-1 max-h-[50vh] overflow-y-auto scrollbar-hide bg-[#0b0a0d]/40">
            <div className="px-2 py-1.5 text-[9px] font-mono font-bold text-zinc-555 tracking-wider uppercase mt-1">
              {"// system_registers"}
            </div>
            
            <button 
              onClick={() => { setIsOpen(false); window.dispatchEvent(new Event("open-compose-email")); }}
              className="w-full flex items-center px-3 py-2 text-xs text-zinc-400 hover:text-zinc-150 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/60 transition-all group cursor-pointer"
            >
              <Mail className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <span className="font-mono uppercase tracking-wide text-[10px]">01 // Compose Message</span>
              <kbd className="ml-auto text-[9px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-1.5 py-0.2 rounded">C</kbd>
            </button>
            
            <button 
              onClick={() => { setIsOpen(false); window.dispatchEvent(new Event("open-compose-event")); }}
              className="w-full flex items-center px-3 py-2 text-xs text-zinc-400 hover:text-zinc-150 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/60 transition-all group cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <span className="font-mono uppercase tracking-wide text-[10px]">02 // Schedule Event</span>
              <kbd className="ml-auto text-[9px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-1.5 py-0.2 rounded">E</kbd>
            </button>
            
            <button 
              onClick={handleSearchAction} 
              className="w-full flex items-center px-3 py-2 text-xs text-zinc-400 hover:text-zinc-150 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/60 transition-all group cursor-pointer"
            >
              <Search className="w-4 h-4 mr-3 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              <span className="font-mono uppercase tracking-wide text-[10px]">03 // Query Search</span>
              <kbd className="ml-auto text-[9px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-1.5 py-0.2 rounded">Shift+Cmd+F</kbd>
            </button>
            
            <div className="px-2 py-1.5 text-[9px] font-mono font-bold text-zinc-555 tracking-wider uppercase mt-3">
              {"// decrypt_queries"}
            </div>
            
            <button 
              onClick={() => { setIsOpen(false); window.dispatchEvent(new Event("open-agent-chat")); }}
              className="w-full flex items-center px-3 py-3 text-xs text-zinc-400 hover:text-zinc-150 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/60 transition-all group cursor-pointer text-left"
            >
              <Sparkles className="w-4 h-4 mr-3 text-amber-450 animate-pulse" />
              <div>
                <div className="text-amber-450 font-mono uppercase tracking-wide text-[10px] font-bold">Ask Decrypt Agent</div>
                <div className="text-[10px] text-zinc-600 font-sans mt-0.5 uppercase">e.g. &quot;Search flight telemetry logs&quot;</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
