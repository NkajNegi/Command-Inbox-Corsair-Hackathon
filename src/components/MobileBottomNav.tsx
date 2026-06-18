"use client";

import { Mail, Calendar, Sparkles, Command } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const openAgent = () => {
    window.dispatchEvent(new Event("open-agent-chat"));
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#121116]/85 backdrop-blur-xl border-t border-[#232029] z-50 flex items-center justify-around px-4 pb-safe select-none">
      <Link href="/" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/' ? 'text-amber-500' : 'text-zinc-500'}`}>
        <Mail size={18} />
        <span className="text-[9px] font-mono uppercase tracking-wide">Inbox</span>
      </Link>
      
      <Link href="/calendar" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/calendar' ? 'text-amber-500' : 'text-zinc-500'}`}>
        <Calendar size={18} />
        <span className="text-[9px] font-mono uppercase tracking-wide">Calendar</span>
      </Link>
      
      <button onClick={openAgent} className="flex flex-col items-center gap-1 p-2 text-amber-500 relative cursor-pointer">
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-md"></div>
        <Sparkles size={22} className="relative z-10" />
      </button>

      <button onClick={openCommandPalette} className="flex flex-col items-center gap-1 p-2 text-zinc-500 hover:text-zinc-200 cursor-pointer">
        <Command size={18} />
        <span className="text-[9px] font-mono uppercase tracking-wide">Cmd</span>
      </button>
    </nav>
  );
}
