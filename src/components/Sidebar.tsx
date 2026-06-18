"use client";

import { Mail, Calendar, Settings, Edit3, Command } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-[#232029] bg-[#121116] flex flex-col h-full shrink-0 relative z-10 select-none font-mono">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#232029] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 bg-zinc-950 border border-amber-500/25 group-hover:border-amber-500/50 rounded flex items-center justify-center shadow-lg shadow-amber-500/5 transition-all">
            <Command className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs tracking-wider bg-gradient-to-r from-amber-400 to-[#f4ebd0] bg-clip-text text-transparent font-mono uppercase">
              MODULE_TRG
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest font-semibold">LINK_NOMINAL</span>
            </div>
          </div>
        </Link>
        
        <button 
          onClick={() => window.dispatchEvent(new Event("open-compose-email"))}
          className="p-2 bg-zinc-950/60 border border-[#232029] hover:border-amber-500/30 hover:bg-[#18161f] text-zinc-400 hover:text-white rounded transition-all duration-200 cursor-pointer shadow-sm" 
          title="Compose (c)"
        >
          <Edit3 size={14} />
        </button>
      </div>
      
      {/* Navigation Label */}
      <div className="px-4 pt-6 pb-2 text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">
        {"// flight_modules"}
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1">
        <Link href="/" className="flex items-center justify-between px-3 py-2.5 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/40 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-all group">
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            <span className="font-mono text-xs uppercase tracking-wide">01 // Inbox Queue</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] font-mono text-zinc-500">G</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] font-mono text-zinc-500">I</kbd>
          </div>
        </Link>
        
        <Link href="/calendar" className="flex items-center justify-between px-3 py-2.5 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/40 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-all group">
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            <span className="font-mono text-xs uppercase tracking-wide">02 // Schedule Log</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] font-mono text-zinc-500">G</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] font-mono text-zinc-500">C</kbd>
          </div>
        </Link>

        <Link href="/settings" className="flex items-center justify-between px-3 py-2.5 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/40 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-all group">
          <div className="flex items-center gap-3">
            <Settings size={16} className="text-zinc-500 group-hover:text-amber-400 transition-colors" />
            <span className="font-mono text-xs uppercase tracking-wide">03 // Control Panel</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] font-mono text-zinc-500">G</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-950 border border-[#232029] rounded text-[9px] font-mono text-zinc-500">S</kbd>
          </div>
        </Link>
        
        <div className="pt-8 pb-2 px-2 text-[10px] font-mono font-bold text-zinc-500 tracking-widest uppercase">
          {"// telemetry_filters"}
        </div>
        
        <Link href="/priority" className="flex items-center justify-between px-3 py-2.5 rounded border border-transparent hover:border-[#232029] hover:bg-[#18161f]/40 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-all group">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wide text-zinc-300">High priority</span>
          </div>
          <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">CRITICAL_A</span>
        </Link>
      </nav>
      
      {/* Keyboard Helper Footer Panel */}
      <div className="p-4 border-t border-[#232029] bg-zinc-950/20 space-y-2 text-[10px] font-mono text-zinc-500">
        <div className="text-[9px] text-zinc-650 font-bold uppercase tracking-wider mb-3">Module Hotkeys</div>
        <div className="flex justify-between items-center">
          <span>COMMAND MENU</span>
          <kbd className="px-1.5 py-0.5 bg-[#18161f] border border-[#232029] rounded text-[9px] text-zinc-450">Ctrl+K</kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>GLOBAL SEARCH</span>
          <kbd className="px-1.5 py-0.5 bg-[#18161f] border border-[#232029] rounded text-[9px] text-zinc-450">S</kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>COMPOSE MSG</span>
          <kbd className="px-1.5 py-0.5 bg-[#18161f] border border-[#232029] rounded text-[9px] text-zinc-450">C</kbd>
        </div>
        <div className="flex justify-between items-center">
          <span>DECRYPT AI</span>
          <kbd className="px-1.5 py-0.5 bg-[#18161f] border border-[#232029] rounded text-[9px] text-zinc-450">/</kbd>
        </div>
      </div>
    </aside>
  );
}
