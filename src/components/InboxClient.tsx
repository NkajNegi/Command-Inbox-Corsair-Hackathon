"use client";

import { useState, useEffect, useCallback } from "react";
import EmailList, { type Email } from "@/components/EmailList";
import EmailDetail from "@/components/EmailDetail";
import { RefreshCw, Terminal, Activity, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import type { Session } from "next-auth";

export default function InboxClient({ initialEmails, session }: { initialEmails: Email[], session: Session }) {
  const [selectedId, setSelectedId] = useState<string | null>(initialEmails[0]?.id || null);
  const [hiddenEmailIds, setHiddenEmailIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      // Clamp width between 300px and 600px
      const newWidth = Math.max(300, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isDragging]);

  const displayEmails = initialEmails.filter(e => !hiddenEmailIds.has(e.id));
  const selectedEmail = displayEmails.find(e => e.id === selectedId) || null;

  const handleActionComplete = (id: string) => {
    // Hide the email immediately for instantaneous UI response
    setHiddenEmailIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    
    // Select the next available email, or null if empty
    const currentIndex = displayEmails.findIndex(e => e.id === id);
    if (currentIndex !== -1) {
      const nextEmail = displayEmails[currentIndex + 1] || displayEmails[currentIndex - 1] || null;
      setSelectedId(nextEmail?.id || null);
    } else {
      setSelectedId(null);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/sync-emails", { method: "POST" });
      const data = await res.json();
      router.refresh();

      if (data.newEvents && data.newEvents.length > 0) {
        const ev = data.newEvents[0];
        window.dispatchEvent(new CustomEvent("open-compose-event", { 
          detail: { 
            title: ev.title || "", 
            date: ev.date || "", 
            time: ev.time || "", 
            attendees: ev.attendees || "" 
          } 
        }));
      }
    } catch (e) {
      console.error(e);
    }
    setIsSyncing(false);
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0b0a0d] text-[#f4ebd0] overflow-hidden relative font-mono cyber-grid-overlay">
      {/* Top Console Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-[#232029] bg-[#121116]/95 backdrop-blur-md relative z-10 gap-4">
        
        {/* Core Title & System Status */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-zinc-950 border border-amber-500/25 rounded flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/5">
            <Terminal size={14} className="text-amber-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wider bg-gradient-to-r from-amber-400 to-[#f4ebd0] bg-clip-text text-transparent font-mono uppercase">
              MODULE_TRG // TELEMETRY
            </span>
            <div className="flex items-center gap-3 mt-1 font-mono text-[9px] text-zinc-550">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                <span className="text-amber-400 font-bold">[TUNNEL_LINK: OK]</span>
              </span>
              <span>•</span>
              <span>YAW: +0.02° | PITCH: -1.14°</span>
              <span>•</span>
              <span className="hidden sm:inline">CYCLE_LATENCY: 0.14ms</span>
            </div>
          </div>
        </div>

        {/* Dashboard Actions and User Telemetry */}
        <div className="flex items-center justify-end gap-3 flex-wrap">
          {/* Telemetry Indicator */}
          <div className="hidden lg:flex items-center gap-2 border border-[#232029] bg-zinc-950/40 px-3 py-1 rounded text-[10px] font-mono text-zinc-550">
            <Activity size={12} className="text-amber-500 animate-pulse" />
            <span>BUFFER_NET: SECURE</span>
          </div>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 transition-all px-3.5 py-1.5 rounded border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer shadow-sm shadow-amber-500/5"
          >
            <RefreshCw size={11} className={isSyncing ? "animate-spin text-amber-400" : "text-amber-550"} />
            <span>{isSyncing ? "SYNCING..." : "SYNC INBOX"}</span>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent("open-compose-email"))}
            className="flex items-center gap-2 text-[10px] font-mono font-bold text-zinc-950 transition-all px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 cursor-pointer shadow-md shadow-amber-500/10 border border-amber-400/20"
          >
            <Plus size={11} />
            <span>COMPOSE</span>
          </button>
          
          <div className="flex items-center gap-2.5 border-l border-[#232029] pl-3">
            {session?.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="User avatar" className="w-6 h-6 rounded-full border border-zinc-800 shadow-inner" />
            )}
            <span className="text-[10px] font-mono text-zinc-550 hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
          
          <Link 
            href="/api/auth/signout"
            className="text-[10px] font-mono font-bold text-zinc-600 hover:text-red-400 transition-colors px-2 py-1.5 rounded hover:bg-red-500/5 cursor-pointer border border-transparent hover:border-red-950/20"
          >
            [SIGNOUT]
          </Link>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Column Pane (Email List Queue) */}
        <div 
          style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
          className={`w-full md:w-[var(--sidebar-width)] shrink-0 h-full bg-[#0b0a0d]/40 ${selectedId ? 'hidden md:flex flex-col' : 'flex flex-col'}`}
        >
          <EmailList 
            emails={displayEmails} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
        </div>
        
        {/* Resizer Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="hidden md:block w-1 cursor-col-resize bg-[#232029] hover:bg-amber-500/80 active:bg-amber-500 transition-colors z-20 shrink-0"
        />
        
        {/* Right Column Pane (Detail Decryption View) */}
        <div className={`flex-1 h-full bg-[#0b0a0d]/25 relative ${selectedId ? 'flex flex-col' : 'hidden md:flex flex-col'}`}>
          {/* Tactical L-Bracket Frames inside main view */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/20 pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/20 pointer-events-none z-10" />
          <EmailDetail 
            email={selectedEmail} 
            onBack={() => setSelectedId(null)} 
            onActionComplete={handleActionComplete}
          />
        </div>
      </div>
    </div>
  );
}
