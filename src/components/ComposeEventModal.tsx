"use client";

import { useState, useEffect } from "react";
import { X, Calendar as CalendarIcon, Clock, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ComposeEventModal Component
 * A sleek modal to quickly draft and send a calendar invite using Corsair API.
 */
export default function ComposeEventModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [id, setId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState("");
  const [inviteAttendees, setInviteAttendees] = useState(true);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      setIsOpen(true);
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (detail.id) setId(detail.id);
        if (detail.title) setTitle(detail.title);
        if (detail.date) setDate(detail.date);
        if (detail.time) setTime(detail.time);
        if (detail.attendees) setAttendees(detail.attendees);
      }
    };
    window.addEventListener("open-compose-event", handleOpen);
    return () => window.removeEventListener("open-compose-event", handleOpen);
  }, []);

  const handleSend = async () => {
    try {
      const endpoint = id ? "/api/edit-event" : "/api/schedule-event";
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title, date, time, attendees: inviteAttendees ? attendees : "" }),
      });
      // Optionally trigger a page refresh here
      window.location.reload();
    } catch (e) {
      console.error("Error scheduling event", e);
    }
    setIsOpen(false);
    setId(null);
    setTitle("");
    setDate("");
    setTime("");
    setAttendees("");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CalendarIcon size={18} className="text-accent" />
              {id ? "Edit Event" : "New Event"}
            </h2>
            <button onClick={() => setIsOpen(false)} className="p-1 text-muted hover:text-foreground rounded-md transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-5 bg-background">
            {/* Title */}
            <div>
              <input 
                type="text" 
                placeholder="Event Title" 
                className="w-full bg-transparent border-b border-border focus:border-accent outline-none text-xl font-semibold py-2 transition-colors placeholder:text-muted/60"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            
            {/* Date and Time row */}
            <div className="flex gap-4">
              <div className="flex-1 flex items-center border-b border-border focus-within:border-accent transition-colors py-2">
                <CalendarIcon size={16} className="text-muted mr-3" />
                <input 
                  type="date" 
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted/60"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center border-b border-border focus-within:border-accent transition-colors py-2">
                <Clock size={16} className="text-muted mr-3" />
                <input 
                  type="time" 
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted/60"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            {/* Attendees */}
            <div className="flex flex-col border-b border-border focus-within:border-accent transition-colors py-2">
              <div className="flex items-center">
                <Users size={16} className="text-muted mr-3" />
                <input 
                  type="text" 
                  placeholder="Add guests (comma separated emails)" 
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted/60"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                />
              </div>
              {attendees.length > 0 && (
                <label className="flex items-center space-x-2 text-[11px] text-muted mt-2 ml-7 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={inviteAttendees} 
                    onChange={(e) => setInviteAttendees(e.target.checked)} 
                    className="rounded border-border bg-transparent text-accent focus:ring-accent/50" 
                  />
                  <span>Send invitations to guests</span>
                </label>
              )}
            </div>
            
            {/* Location */}
            <div className="flex items-center border-b border-border focus-within:border-accent transition-colors py-2">
              <MapPin size={16} className="text-muted mr-3" />
              <input 
                type="text" 
                placeholder="Add location or video conferencing" 
                className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted/60"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border bg-surface flex items-center justify-between">
            <div className="text-xs text-muted flex items-center gap-2">
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted-bg border border-border rounded font-mono">Cmd+Enter</kbd> to send</span>
            </div>
            <button 
              onClick={handleSend}
              className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg text-sm font-medium shadow-md shadow-accent/20 transition-all active:scale-95"
            >
              Send Invite
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
