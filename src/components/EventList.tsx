"use client";

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { Plus, Edit2, Calendar as CalendarIcon, List } from "lucide-react";
import { useState } from "react";

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
  const [viewMode, setViewMode] = useState<"timeline" | "month">("timeline");

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

  // Monthly Calendar Math
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

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
           <div className="flex bg-zinc-950 border border-[#232029] rounded p-0.5">
             <button 
               onClick={() => setViewMode("timeline")}
               className={`p-1.5 rounded flex items-center justify-center transition-colors ${viewMode === "timeline" ? "bg-[#232029] text-amber-500" : "text-zinc-500 hover:text-zinc-300"}`}
               title="Timeline View"
             >
               <List size={14} />
             </button>
             <button 
               onClick={() => setViewMode("month")}
               className={`p-1.5 rounded flex items-center justify-center transition-colors ${viewMode === "month" ? "bg-[#232029] text-amber-500" : "text-zinc-500 hover:text-zinc-300"}`}
               title="Month View"
             >
               <CalendarIcon size={14} />
             </button>
           </div>
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
          
          {viewMode === "timeline" ? (
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
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((day, idx) => {
                  const dayEvents = events.filter(e => isSameDay(e.start, day));
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`min-h-[100px] p-2 border ${isCurrentMonth ? 'bg-zinc-950/40 border-[#232029]/80' : 'bg-[#0b0a0d]/20 border-transparent opacity-50'} rounded hover:border-[#232029] transition-all flex flex-col gap-1`}
                    >
                      <div className={`text-[10px] font-bold mb-1 ${isCurrentMonth ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {format(day, "d")}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                        {dayEvents.map(event => (
                          <div 
                            key={event.id}
                            onClick={() => handleEditEvent(event)}
                            className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] px-1.5 py-1 rounded truncate cursor-pointer hover:bg-amber-500/20 transition-colors"
                            title={`${format(event.start, "h:mm a")} - ${event.title}`}
                          >
                            <span className="font-bold mr-1">{format(event.start, "HH:mm")}</span>
                            {event.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
