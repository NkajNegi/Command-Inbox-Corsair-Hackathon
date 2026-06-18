"use client";

import { useState } from "react";
import EventList, { type CalendarEvent } from "@/components/EventList";
import { Terminal, Activity, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";

export default function CalendarClient({ 
  initialEvents, 
  session 
}: { 
  initialEvents: CalendarEvent[]; 
  session: Session; 
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch("/api/sync-events", { method: "POST" });
      router.refresh();
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
              MODULE_TRG // CALENDAR
            </span>
            <div className="flex items-center gap-3 mt-1 font-mono text-[9px] text-[#8c839a]">
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
          <div className="hidden lg:flex items-center gap-2 border border-[#232029] bg-zinc-950/40 px-3 py-1 rounded text-[10px] font-mono text-[#8c839a]">
            <Activity size={12} className="text-amber-500 animate-pulse" />
            <span>BUFFER_NET: SECURE</span>
          </div>

          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 text-[10px] font-mono font-bold text-amber-400 hover:text-amber-300 transition-all px-3.5 py-1.5 rounded border border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer shadow-sm shadow-amber-500/5"
          >
            <RefreshCw size={11} className={isSyncing ? "animate-spin text-amber-400" : "text-[#8c839a]"} />
            <span>{isSyncing ? "SYNCING..." : "SYNC CALENDAR"}</span>
          </button>
          
          <div className="flex items-center gap-2.5 border-l border-[#232029] pl-3">
            {session?.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="User avatar" className="w-6 h-6 rounded-full border border-zinc-800 shadow-inner" />
            )}
            <span className="text-[10px] font-mono text-[#8c839a] hidden sm:block">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
          
          <Link 
            href="/api/auth/signout"
            className="text-[10px] font-mono font-bold text-[#8c839a] hover:text-red-400 transition-colors px-2 py-1.5 rounded hover:bg-red-500/5 cursor-pointer border border-transparent hover:border-red-950/20"
          >
            [SIGNOUT]
          </Link>
        </div>
      </div>

      {/* Main Console Workspace */}
      <div className="flex-1 overflow-hidden relative">
        {/* Tactical L-Bracket Frames inside main view */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/20 pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/20 pointer-events-none z-10" />
        
        <EventList 
          events={initialEvents} 
          onCreateEvent={() => window.dispatchEvent(new Event("open-compose-event"))} 
          onSync={handleSync}
          isSyncing={isSyncing}
        />
      </div>
    </div>
  );
}
