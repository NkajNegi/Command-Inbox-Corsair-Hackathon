"use client";

import { format } from "date-fns";
import { Plus, Edit2 } from "lucide-react";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  location: string;
  attendees: string[];
};

interface EventListProps {
  events: CalendarEvent[];
  onCreateEvent: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export default function EventList({ events, onCreateEvent }: EventListProps) {
  const handleEditEvent = (event: CalendarEvent) => {
    window.dispatchEvent(new CustomEvent("open-compose-event", {
      detail: {
        id: event.id,
        title: event.title,
        date: format(event.start, "yyyy-MM-dd"),
        time: format(event.start, "HH:mm"),
        attendees: event.attendees.join(", ")
      }
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0a0d] text-[#f4ebd0] font-mono relative">
      {/* Subtle Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-[#232029] flex items-center justify-between shrink-0 bg-[#121116]/80 backdrop-blur-md z-10">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-zinc-100 font-mono uppercase">
            {"// calendar_timeline: "}{format(new Date(), "MMMM yyyy")}
          </h1>
          <p className="text-[10px] text-zinc-550 mt-1 uppercase font-mono tracking-wider">Sync & triage system appointments</p>
        </div>
        <div className="flex gap-2 font-mono">
           <button 
             onClick={onCreateEvent}
             className="flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[10px] font-bold rounded transition-all shadow-md shadow-amber-500/10 cursor-pointer border border-amber-400/20"
           >
             <Plus size={14} />
             <span>NEW EVENT</span>
           </button>
        </div>
      </div>
      
      {/* Scrollable Events */}
      <div className="flex-1 p-6 overflow-y-auto scrollbar-hide relative z-10 font-mono">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">{"// incoming_schedule"}</h2>
          
          <div className="space-y-4">
            {events.map(event => (
              <div 
                key={event.id} 
                className="bg-zinc-950/20 border border-[#232029]/80 rounded p-5 flex items-center justify-between group hover:border-[#232029] transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center gap-5">
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-zinc-905 border border-[#232029] rounded group-hover:border-amber-500/40 transition-colors">
                    <span className="text-[9px] font-bold text-amber-500 font-mono uppercase tracking-widest">{format(event.start, "MMM")}</span>
                    <span className="text-sm font-bold text-zinc-250 font-mono leading-none mt-0.5">{format(event.start, "d")}</span>
                  </div>
                  
                  {/* Event Details */}
                  <div>
                    <h3 className="font-semibold text-zinc-300 text-xs mb-1 font-mono tracking-tight">{event.title}</h3>
                    <div className="text-[10px] text-zinc-550 flex items-center gap-2 font-mono">
                      <span>{format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}</span>
                      <span>•</span>
                      <span>{event.location || "No location specified"}</span>
                    </div>
                  </div>
                </div>
                
                {/* Attendees and actions */}
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-1.5 font-mono">
                     {event.attendees.map((attendee, i) => (
                       <div 
                         key={i} 
                         className="w-7 h-7 rounded border border-[#232029] bg-zinc-900 text-[9px] font-bold text-zinc-400 flex items-center justify-center shadow-inner" 
                         title={attendee}
                       >
                         {attendee.charAt(0).toUpperCase()}
                       </div>
                     ))}
                  </div>
                  <button 
                    onClick={() => handleEditEvent(event)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 border border-transparent hover:border-[#232029] hover:bg-[#18161f] rounded opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            ))}
            
            {events.length === 0 && (
              <div className="text-center p-12 text-[10px] font-mono text-zinc-650 border border-dashed border-[#232029] rounded">
                [ NO SCHEDULED APPOINTMENTS DETECTED ]
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
