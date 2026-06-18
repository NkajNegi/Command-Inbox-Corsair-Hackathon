"use client";

import { useOptimistic, startTransition } from "react";
import { format } from "date-fns";
import { Archive, Terminal } from "lucide-react";

export type Email = {
  id: string;
  subject: string;
  snippet: string;
  from: string;
  date: Date;
  read: boolean;
  priority: number;
};

interface EmailListProps {
  emails: Email[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function EmailList({ emails, selectedId, onSelect }: EmailListProps) {
  const [optimisticEmails, addOptimisticAction] = useOptimistic(
    emails,
    (state, idToRemove: string) => state.filter((email) => email.id !== idToRemove)
  );

  const handleArchive = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(() => {
      addOptimisticAction(id);
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0a0d]/40 shrink-0 font-mono relative z-10">
      {/* List Header */}
      <div className="p-4 border-b border-[#232029] flex items-center justify-between shrink-0 h-14 bg-zinc-950/20 relative">
        <div className="flex items-center gap-2">
          <Terminal size={12} className="text-amber-500/70" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#f4ebd0]/70">
            BUFFER_QUEUE //
          </h2>
        </div>
        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
          {optimisticEmails.filter(e => !e.read).length} PENDING
        </span>
      </div>
      
      {/* Scrollable list of emails */}
      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {optimisticEmails.map((email) => (
          <div 
            key={email.id} 
            onClick={() => onSelect(email.id)}
            className={`p-4 border-b border-[#232029]/60 cursor-pointer transition-all duration-150 relative group ${
              selectedId === email.id 
                ? 'bg-[#18161f]/60 border-l border-l-amber-550 shadow-inner' 
                : 'hover:bg-zinc-900/15 hover:border-l hover:border-l-zinc-800'
            }`}
          >
            {/* Active selection glow accent */}
            {selectedId === email.id && (
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            )}
            
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${!email.read ? 'text-[#f4ebd0]' : 'text-zinc-550'}`}>
                {email.from.split("@")[0] || email.from}
              </span>
              <span className="text-[9px] text-zinc-600">
                {format(email.date, "h:mm a")}
              </span>
            </div>
            
            <div className={`text-[11px] mb-2 line-clamp-1 uppercase tracking-tight ${!email.read ? 'font-bold text-zinc-200' : 'text-zinc-400'}`}>
              {email.subject}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="text-[10px] font-sans text-zinc-550 line-clamp-2 leading-relaxed pr-8 flex-1">
                {email.snippet}
              </div>
              <button 
                onClick={(e) => handleArchive(e, email.id)}
                className="p-1.5 text-zinc-650 hover:text-amber-450 border border-transparent hover:border-[#232029] hover:bg-[#18161f] rounded opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                title="Archive (E)"
              >
                <Archive size={11} />
              </button>
            </div>
            
            {/* AI Priority Indicator */}
            {email.priority > 0.8 && (
              <div 
                className="absolute right-4 top-4 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)] animate-pulse" 
                title="High Priority (AI Assessed)" 
              />
            )}
          </div>
        ))}
        {emails.length === 0 && (
          <div className="p-8 text-center text-[10px] text-zinc-600">
            [ NO TELEMETRY PACKETS DETECTED ]
          </div>
        )}
      </div>
    </div>
  );
}
