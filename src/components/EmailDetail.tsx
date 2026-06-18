"use client";

import { format } from "date-fns";
import type { Email } from "./EmailList";
import { MoreHorizontal, Archive, Trash2, CalendarPlus, ChevronLeft, Shield, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface EmailDetailProps {
  email: Email | null;
  onBack?: () => void;
  onActionComplete?: (id: string) => void;
}

export default function EmailDetail({ email, onBack, onActionComplete }: EmailDetailProps) {
  const router = useRouter();
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isParsingEvent, setIsParsingEvent] = useState(false);

  const handleParseEvent = async () => {
    if (!email || isParsingEvent) return;
    setIsParsingEvent(true);
    try {
      const res = await fetch("/api/parse-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: email.subject, snippet: email.snippet })
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new CustomEvent("open-compose-event", { 
          detail: { 
            title: data.title, 
            date: data.date, 
            time: data.time, 
            attendees: data.attendees 
          } 
        }));
      } else {
        throw new Error("AI parsing failed");
      }
    } catch (e) {
      console.error(e);
      // Fallback
      window.dispatchEvent(new CustomEvent("open-compose-event", { 
        detail: { title: email.subject, description: email.snippet } 
      }));
    } finally {
      setIsParsingEvent(false);
    }
  };

  const handleAction = async (action: "archive" | "delete") => {
    if (!email || isMutating) return;
    setIsMutating(true);
    
    // OPTIMISTIC UI: Instantly remove it from the screen
    if (onActionComplete) onActionComplete(email.id);
    if (onBack) onBack(); // On mobile, slide back instantly

    try {
      const res = await fetch("/api/email-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id, action }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsMutating(false);
    }
  };

  const handleQuickReply = async () => {
    if (!replyText.trim() || !email || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.from,
          subject: email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`,
          body: replyText,
        }),
      });
      if (res.ok) {
        setReplyText("");
        // Dispatch keyboard toast update to notify transmission was successful
        console.log("[Quick Reply] Dispatched response successfully.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-[#0b0a0d]/40 relative z-10 font-mono">
        <div className="w-12 h-12 bg-zinc-950 border border-[#232029] rounded-xl flex items-center justify-center mb-4 shadow-md">
          <Shield size={16} className="text-amber-550/40 animate-pulse" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-zinc-650">[ SYS_STANDBY // AWAITING_DECRYPTION_CMD ]</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#121116]/25 h-full flex flex-col relative overflow-hidden z-10 border-l border-[#232029]">
      {/* Header section */}
      <div className="p-6 border-b border-[#232029] shrink-0 bg-[#121116]/90 z-10 font-mono">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3 max-w-[80%]">
            <button 
              onClick={onBack} 
              className="md:hidden p-1.5 -ml-2 text-zinc-400 hover:text-zinc-200 hover:bg-[#18161f] rounded transition-colors border border-transparent hover:border-[#232029] cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xs font-bold leading-tight text-zinc-100 uppercase tracking-tight">{"// DECRYPTED: "}{email.subject}</h1>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button 
              onClick={handleParseEvent}
              className="p-2 text-amber-450 hover:text-amber-300 hover:bg-amber-500/10 border border-transparent hover:border-amber-900/20 rounded transition-all cursor-pointer relative" 
              title="Add to Calendar (AI Auto-Fill)"
              disabled={isParsingEvent}
            >
              {isParsingEvent ? (
                <Loader2 size={15} className="animate-spin text-amber-300" />
              ) : (
                <CalendarPlus size={15} />
              )}
            </button>
            <button 
              onClick={() => handleAction("archive")}
              className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-[#18161f] border border-transparent hover:border-[#232029] rounded transition-all cursor-pointer" 
              title="Archive (e)"
            >
              <Archive size={15} />
            </button>
            <button 
              onClick={() => handleAction("delete")}
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-950/20 rounded transition-all cursor-pointer" 
              title="Delete (#)"
            >
              <Trash2 size={15} />
            </button>
            <button 
              onClick={() => alert("Additional options menu not implemented in hackathon mode.")}
              className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-[#18161f] border border-transparent hover:border-[#232029] rounded transition-all cursor-pointer">
              <MoreHorizontal size={15} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-955 border border-[#232029] text-amber-500 flex items-center justify-center font-bold text-xs">
              {email.from.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-zinc-350">{email.from}</div>
              <div className="text-[9px] text-zinc-650 mt-0.5">FROM_LINK: active_terminal</div>
            </div>
          </div>
          <div className="text-[9px]">
            {format(email.date, "yyyy-MM-dd HH:mm:ss")}
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-8 text-[11px] font-sans leading-relaxed text-zinc-400 flex-1 overflow-y-auto superhuman-scrollbar">
        <p className="font-mono text-[9px] text-zinc-650 tracking-wider mb-6">{"// DATA_STREAM_DECRYPTED"}</p>
        <div className="space-y-4">
          <p>Hello,</p>
          <p className="leading-relaxed text-[#f4ebd0]/90">{email.snippet}</p>
          <p className="text-zinc-600 font-mono text-[10px] leading-relaxed">
            [ SECURE PIPELINE: Raw calendar and message contents are isolated in the local module flight buffer. ]
          </p>
          <p>
            Best regards,<br/>
            <span className="font-mono text-zinc-300">{email.from}</span>
          </p>
        </div>
      </div>

      {/* Quick Reply Bar styled as input prompt */}
      <div className="p-3.5 border border-[#232029] bg-[#121116]/90 backdrop-blur-md ml-4 mr-24 mb-4 mt-4 rounded flex items-center shadow-inner relative z-10 font-mono">
         <span className="text-amber-500 text-xs mr-3 font-bold select-none">&gt;_</span>
         <input 
           type="text" 
           value={replyText}
           onChange={(e) => setReplyText(e.target.value)}
           onKeyDown={(e) => {
             if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
               e.preventDefault();
               handleQuickReply();
             }
           }}
           disabled={isSending}
           placeholder={isSending ? "TRANSMITTING RESPONSE MATRIX..." : "Transmit response message..."} 
           className="bg-transparent border-none outline-none flex-1 text-xs text-zinc-200 placeholder:text-zinc-700 focus:ring-0 focus:outline-none disabled:opacity-50" 
         />
         <div className="text-[9px] text-zinc-605 flex items-center gap-2">
           <span>Press</span>
           <kbd className="px-2 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] text-zinc-400">Cmd + Enter</kbd>
           <span>to transmit</span>
         </div>
      </div>
    </div>
  );
}
