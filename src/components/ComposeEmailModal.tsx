"use client";

import { X, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ComposeEmailModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-compose-email", handleOpen);
    return () => window.removeEventListener("open-compose-email", handleOpen);
  }, []);

  const handleSend = async () => {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
    } catch (e) {
      console.error("Error sending email", e);
    }
    setIsOpen(false);
    setTo("");
    setSubject("");
    setBody("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-end justify-end p-6 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-t-xl overflow-hidden flex flex-col pointer-events-auto"
        >
          <div className="bg-muted-bg px-4 py-2.5 flex justify-between items-center border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">New Message</h3>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <input 
              autoFocus
              type="text" 
              placeholder="To" 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-transparent border-b border-border pb-2 outline-none text-sm text-foreground placeholder:text-muted" 
            />
            <input 
              type="text" 
              placeholder="Subject" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-transparent border-b border-border pb-2 outline-none text-sm text-foreground placeholder:text-muted font-medium" 
            />
            <textarea 
              placeholder="Write your email here..." 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="bg-transparent border-none outline-none resize-none h-48 text-sm text-foreground placeholder:text-muted pt-2 superhuman-scrollbar"
            />
          </div>
          <div className="p-4 border-t border-border flex justify-between items-center bg-muted-bg/50">
            <button 
              onClick={handleSend}
              className="bg-accent hover:bg-accent/90 text-background font-medium text-sm px-4 py-1.5 rounded-md flex items-center transition-colors"
            >
              <Send size={14} className="mr-2" /> Send
            </button>
            <div className="text-xs text-muted flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-background border border-border rounded font-mono font-semibold">Cmd + Enter</kbd>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
