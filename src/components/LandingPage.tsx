"use client";

import { useState, useEffect } from "react";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { 
  Command, 
  Inbox, 
  Calendar, 
  ArrowRight, 
  Zap, 
  Lock, 
  Search, 
  Activity,
  Terminal,
  HelpCircle,
  Check
} from "lucide-react";
import { signIn } from "next-auth/react";

interface MockEmail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  body: string;
  date: string;
  priority: string | null;
}

const mockEmails: MockEmail[] = [
  {
    id: "mock-e1",
    subject: "Project Launch Plan & Key Milestones",
    from: "Sarah Jenkins",
    snippet: "Hi Team, attached is the revised roadmap for our product launch. Please review the timelines and verify that key deliverables are aligned.",
    body: "Hi Team,\n\nAttached is the revised roadmap for our product launch. Please review the timelines and verify that key deliverables are aligned.\n\nLet's get this completed by Friday.\n\nBest,\nSarah Jenkins",
    date: "10:42",
    priority: "PRIORITY_A"
  },
  {
    id: "mock-e2",
    subject: "Quick question about the database schema",
    from: "Dave Harris",
    snippet: "Can we jump on a call later today to discuss the migration? I want to make sure the vector indexing column type is mapped correctly.",
    body: "Hey there,\n\nCan we jump on a call later today to discuss the migration? I want to make sure the vector indexing column type is mapped correctly for our pgvector setups.\n\nThanks,\nDave Harris",
    date: "Yesterday",
    priority: null
  }
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "split" | "ai">("inbox");
  const [logLines, setLogLines] = useState<string[]>([]);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [showMockPalette, setShowMockPalette] = useState(false);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  // Mockup interactive states
  const [mockView, setMockView] = useState<"inbox" | "calendar">("inbox");
  const [mockCommandQuery, setMockCommandQuery] = useState("");
  const [selectedMockEmail, setSelectedMockEmail] = useState<MockEmail | null>(null);
  const [crtOverlayEnabled, setCrtOverlayEnabled] = useState(true);

  // Initial mock calendar events
  const [mockCalendarEvents, setMockCalendarEvents] = useState([
    {
      id: "mock-c1",
      title: "Houston Telemetry Sync",
      start: "10:00 AM",
      end: "11:30 AM",
      location: "Orbit Console",
      attendees: ["Sarah Jenkins", "Dave Harris"]
    },
    {
      id: "mock-c2",
      title: "Groq Agent Alignment Review",
      start: "1:00 PM",
      end: "2:00 PM",
      location: "Cognitive Module",
      attendees: ["Sarah Jenkins"]
    }
  ]);

  const mockCommands = [
    {
      id: "cmd-cal",
      category: "Calendar",
      text: "Schedule sync tomorrow at 3 PM",
      hotkey: "Enter",
      action: () => {
        setMockCalendarEvents(prev => [
          ...prev,
          {
            id: "mock-c-new-" + Date.now(),
            title: "Simulated Telemetry Sync Meeting",
            start: "3:00 PM",
            end: "4:00 PM",
            location: "Telemetry Capsule",
            attendees: ["Sarah Jenkins", "You"]
          }
        ]);
        setMockView("calendar");
        setShowMockPalette(false);
        setMockCommandQuery("");
        setActiveToast("EVENT LINKED // APPOINTMENT WRITTEN TO CALENDAR TIMELINE");
      }
    },
    {
      id: "cmd-email",
      category: "Email",
      text: "Transmit \"nominal status report\"",
      hotkey: "Enter",
      action: () => {
        setShowMockPalette(false);
        setMockCommandQuery("");
        setActiveToast("TRANSMITTED // EMAIL REPLY DISPATCHED");
      }
    },
    {
      id: "cmd-crt",
      category: "System",
      text: "Toggle CRT scanline overlay",
      hotkey: "Enter",
      action: () => {
        setCrtOverlayEnabled(prev => !prev);
        setShowMockPalette(false);
        setMockCommandQuery("");
        setActiveToast("TELEMETRY MUTATED // CRT FILTER TOGGLED");
      }
    },
    {
      id: "cmd-ai",
      category: "AI",
      text: "Decode Sarah Jenkins' roadmap thread",
      hotkey: "Enter",
      action: () => {
        setShowMockPalette(false);
        setMockCommandQuery("");
        setSelectedMockEmail(mockEmails[0]);
        setActiveToast("DECRYPTING // OPENED ROADMAP THREAD");
      }
    }
  ];

  const filteredCommands = mockCommands.filter(cmd => 
    cmd.text.toLowerCase().includes(mockCommandQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(mockCommandQuery.toLowerCase())
  );

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredCommands.length > 0) {
      filteredCommands[0].action();
    }
  };

  // Global keyboard listener on landing page to trigger mock elements
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowMockPalette(prev => !prev);
        setActiveToast(prev => prev ? null : "INPUT DETECTED // SUMMONING SIMULATED PALETTE");
      }
      if (e.key === "Escape") {
        setShowMockPalette(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Dismiss toast after a few seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Simulate flight console logs printing on screen
  useEffect(() => {
    const logs = [
      "SYSTEM_INIT // LOADING BOOT VARIABLES...",
      "TUNNEL_LINK: SECURING CHANNEL PORT 443...",
      "OAUTH_HANDSHAKE: [SUCCESS] CLIENT_TOKEN VALIDATED",
      "BUFFER_DECRYPT: PARSING GMAIL HEADER STRINGS...",
      "COGNITIVE_CORE: GROQ_LLM AT RISK ACCORDANCE SCORE: NOMINAL",
      "SYNC: [OK] 47 EMAILS INDEXED TO POSTGRES BUFFER",
      "SYNC: [OK] 12 EVENTS SYNCED TO CALENDAR MATRIX",
      "FLIGHT_COMPUTER: STANDBY // SPEED_OF_COMMAND MODE ACTIVE"
    ];

    let timer: NodeJS.Timeout;
    const printLog = (index: number) => {
      if (index < logs.length) {
        setLogLines(prev => [...prev, logs[index]]);
        timer = setTimeout(() => printLog(index + 1), 1800);
      } else {
        timer = setTimeout(() => {
          setLogLines([]);
          printLog(0);
        }, 5000);
      }
    };

    printLog(0);
    return () => clearTimeout(timer);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.35,
        ease: "easeOut" as const
      }
    })
  };

  const heroSentence = "Triage your inbox at the speed of command.".split(" ");

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className={`min-h-screen bg-[#0b0a0d] text-[#f4ebd0] overflow-x-hidden relative selection:bg-amber-500/30 selection:text-white cyber-grid-overlay font-mono ${crtOverlayEnabled ? 'animate-crt' : ''}`}>
      
      {/* Apollo Capsule Patent Schematic Backdrop */}
      <div className="absolute top-0 left-0 right-0 h-[750px] w-full pointer-events-none opacity-[0.09] z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/apollo_blueprint.png" alt="Apollo Blueprint Schematic" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0a0d]/90 to-[#0b0a0d]" />
      </div>

      {/* Interactive Keycap Toast Alert */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-6 z-50 px-4 py-3 bg-[#121116] border border-amber-500 text-[10px] text-amber-500 rounded shadow-2xl flex items-center gap-2.5 shadow-amber-500/10 font-mono font-bold"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>{activeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Console Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#232029] bg-[#0b0a0d]/65 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-950 border border-amber-500/25 rounded flex items-center justify-center shadow-lg shadow-amber-500/5">
            <Command className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#f59e0b] font-bold">
            FLIGHT_COMMAND // MODULE_TRG
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => signIn("google")}
            className="text-[10px] uppercase tracking-wider text-zinc-550 hover:text-amber-400 transition-colors cursor-pointer"
          >
            [ DECRYPT_SESSION ]
          </button>
          <button 
            onClick={() => signIn("google")}
            className="text-[10px] uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-zinc-950 px-4 py-2.5 rounded transition-all duration-200 shadow-md shadow-amber-500/10 font-bold cursor-pointer border border-amber-400/20"
          >
            INITIALIZE BOOT
          </button>
        </div>
      </nav>

      {/* Hero Content Section */}
      <main className="relative z-10 flex flex-col items-center pt-24 px-6 max-w-7xl mx-auto">
        <motion.div 
          className="text-center max-w-4xl animate-crt"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Status Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-zinc-950 border border-amber-500/20 text-xs text-amber-400/95 mb-8 backdrop-blur-sm shadow-inner tracking-wider">
            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>LINK_ESTABLISHED // APOLLO_D_NET</span>
          </motion.div>
          
          {/* Main Title with benefit-driven focus */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 leading-[1.1] text-zinc-100">
            {heroSentence.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mr-2.5"
              >
                {word.includes("command.") ? (
                  <span className="text-amber-500 neon-amber-glow">
                    command.
                  </span>
                ) : word}
              </motion.span>
            ))}
          </h1>
          
          {/* Benefit-driven Description */}
          <motion.p variants={itemVariants} className="text-xs md:text-sm text-zinc-550 mb-10 max-w-2xl mx-auto leading-relaxed uppercase tracking-wider">
            RECLAIM 4 HOURS EVERY WEEK. TRIAGE GMAIL CORRESPONDENCE 4x FASTER. COMMAND INBOX MERGES YOUR MESSAGE LOGS AND CALENDAR TIMELINE INTO A PHOSPHOR-AMBER CRT FLIGHT MODULE.
          </motion.p>

          {/* Interactive Keyboard Summon Reminder */}
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center gap-2 border border-zinc-800 bg-[#121116]/40 px-3 py-1.5 rounded text-[10px] text-zinc-500 mb-8"
          >
            <span>TAP</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-850 rounded text-[9px] text-zinc-350 font-mono">Cmd + K</kbd>
            <span>ON THIS PAGE TO LAUNCH COMMAND MENU</span>
          </motion.div>
          
          {/* Standardized Google OAuth Button */}
          <motion.div variants={itemVariants} className="flex flex-col items-center justify-center gap-4">
            <button 
              onClick={() => signIn("google")}
              className="group flex items-center gap-3 bg-zinc-950 border border-zinc-850 hover:border-amber-500/35 text-zinc-350 hover:text-white px-6 py-3.5 rounded font-medium text-xs hover:bg-[#121116] transition-all duration-200 shadow-lg cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>CONNECT_TELEMETRY_LINK</span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-amber-450 group-hover:translate-x-1 transition-all" />
            </button>
            
            <p className="text-[9px] text-zinc-600 flex items-center gap-1.5 mt-2">
              <Lock className="w-3 h-3 text-zinc-750" /> [ CONNECTION: SSL_SECURE // AUTHENTICATION: LOCAL ]
            </p>
          </motion.div>
        </motion.div>

        {/* Live UI Mockup Preview */}
        <motion.div 
          className="mt-20 w-full max-w-5xl relative rounded-xl border border-zinc-850 bg-[#0a0a0c] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.95)]"
        >
          {/* Top Titlebar */}
          <div className="flex items-center justify-between bg-[#121116] px-4 py-3 border-b border-[#232029]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
            </div>
            <div className="flex items-center gap-2 bg-[#0b0a0d] border border-[#232029] rounded-md px-3 py-1 text-xs font-mono text-zinc-500 w-64 md:w-80">
              <Search className="w-3.5 h-3.5 text-zinc-700" />
              <span>command-inbox.corsair.dev</span>
            </div>
            <div className="w-12" />
          </div>

          <div className="flex h-[480px] text-zinc-350">
            {/* Sidebar */}
            <div className="w-56 border-r border-[#232029] bg-[#121116]/80 p-4 hidden md:flex flex-col justify-between">
              <div className="space-y-6">
                <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider px-2">{"// core_nav"}</div>
                <nav className="space-y-1">
                  <button 
                    type="button"
                    onClick={() => { setMockView("inbox"); setSelectedMockEmail(null); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium cursor-pointer border transition-all ${mockView === 'inbox' ? 'bg-[#18161f] border-[#232029] text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-350'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Inbox className={`w-3.5 h-3.5 ${mockView === 'inbox' ? 'text-amber-500' : 'text-zinc-550'}`} />
                      <span className="font-mono uppercase">01 // Inbox</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded">{mockEmails.length}</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => { setMockView("calendar"); setSelectedMockEmail(null); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium cursor-pointer border transition-all ${mockView === 'calendar' ? 'bg-[#18161f] border-[#232029] text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-350'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className={`w-3.5 h-3.5 ${mockView === 'calendar' ? 'text-amber-500' : 'text-zinc-550'}`} />
                      <span className="font-mono uppercase">02 // Calendar</span>
                    </div>
                    <span className="text-[10px] font-mono bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded">{mockCalendarEvents.length}</span>
                  </button>
                </nav>
              </div>
              
              <div className="p-2.5 bg-zinc-950/40 border border-[#232029] rounded">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-bold text-amber-500">
                    TM
                  </div>
                  <span className="text-[9px] font-mono text-zinc-650 uppercase">TELEMETRY_LINK</span>
                </div>
              </div>
            </div>

            {/* Mock Contents */}
            <div className="flex-1 bg-[#0a0a0c]/60 p-6 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-3 h-full overflow-y-auto superhuman-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-mono text-zinc-550 uppercase tracking-widest">
                    {selectedMockEmail ? "// decrypt_stream" : mockView === "inbox" ? "// buffer_status" : "// schedule_matrix"}
                  </h4>
                  <span className="text-[10px] font-mono text-zinc-600">Flight Console</span>
                </div>
                
                {selectedMockEmail ? (
                  /* Decrypted Email Details inside Mockup */
                  <div className="p-4 border border-[#232029] bg-zinc-950/40 rounded space-y-4 relative">
                    <div className="flex items-center justify-between pb-2 border-b border-[#232029]">
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={() => setSelectedMockEmail(null)}
                          className="text-[10px] text-amber-500 hover:text-amber-400 font-mono font-bold"
                        >
                          &lt; BACK
                        </button>
                        <span className="text-xs font-bold text-zinc-200 font-mono uppercase truncate max-w-[150px] md:max-w-[200px]">
                          {selectedMockEmail.subject}
                        </span>
                      </div>
                      <span className="text-[9px] text-zinc-600 font-mono">{selectedMockEmail.from}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-sans whitespace-pre-line leading-relaxed uppercase">
                      {selectedMockEmail.body}
                    </div>
                    
                    {/* Simulated respond action */}
                    <div className="pt-4 flex items-center gap-2 border-t border-[#232029]">
                      <input 
                        type="text" 
                        placeholder="Type response packet..." 
                        className="bg-transparent border border-[#232029] rounded px-2.5 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-500/30 flex-1 font-mono"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setSelectedMockEmail(null);
                            setActiveToast("TRANSMITTED // DISPATCHED RESPONSE SUCCESSFULLY");
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          setSelectedMockEmail(null);
                          setActiveToast("TRANSMITTED // DISPATCHED RESPONSE SUCCESSFULLY");
                        }}
                        className="px-3 py-1 bg-amber-500 text-zinc-950 text-[10px] font-bold rounded cursor-pointer"
                      >
                        SEND
                      </button>
                    </div>
                  </div>
                ) : mockView === "inbox" ? (
                  /* Mock Emails list */
                  <div className="space-y-3">
                    {mockEmails.map((email) => (
                      <div 
                        key={email.id}
                        onClick={() => setSelectedMockEmail(email)}
                        className="p-3 bg-zinc-950/20 border border-[#232029]/80 hover:border-amber-500/25 rounded flex items-start justify-between cursor-pointer transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-zinc-300">{email.from}</span>
                            {email.priority && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded border border-amber-500/10 font-mono">{email.priority}</span>
                            )}
                          </div>
                          <div className="text-xs font-medium text-zinc-400 font-mono">{email.subject}</div>
                          <p className="text-[11px] text-zinc-600 truncate max-w-[180px] md:max-w-md">{email.snippet}</p>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600">{email.date}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Mock Calendar Timeline list */
                  <div className="space-y-2">
                    {mockCalendarEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="p-3 bg-zinc-950/20 border border-[#232029]/80 rounded flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-8 h-8 bg-zinc-900 border border-[#232029] rounded">
                            <span className="text-[8px] font-bold text-amber-500 font-mono uppercase tracking-widest">JUN</span>
                            <span className="text-xs font-bold text-zinc-350 font-mono leading-none mt-0.5">18</span>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-zinc-300 font-mono">{event.title}</div>
                            <div className="text-[9px] text-zinc-500 font-mono">{event.start} - {event.end} | {event.location}</div>
                          </div>
                        </div>
                        <div className="flex -space-x-1">
                          {event.attendees.map((att, i) => (
                            <div 
                              key={i} 
                              className="w-5 h-5 rounded border border-[#232029] bg-zinc-900 text-[8px] font-bold text-zinc-500 flex items-center justify-center"
                              title={att}
                            >
                              {att.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* FLOATING COMMAND PALETTE OVERLAY (Controlled interactively via state) */}
              <AnimatePresence>
                {showMockPalette && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 z-20"
                  >
                    <div className="w-full max-w-md bg-[#121116] border border-amber-500/40 rounded shadow-[0_25px_60px_rgba(245,158,11,0.15)] overflow-hidden">
                      <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 px-3 py-3 border-b border-[#232029] bg-[#0b0a0d]">
                        <Command className="w-4 h-4 text-amber-500" />
                        <input 
                          type="text" 
                          placeholder="Query command queue..." 
                          className="bg-transparent border-0 text-xs text-white placeholder-zinc-700 focus:outline-none focus:ring-0 w-full font-mono"
                          value={mockCommandQuery}
                          onChange={(e) => setMockCommandQuery(e.target.value)}
                          autoFocus
                        />
                        <button 
                          type="button"
                          onClick={() => { setShowMockPalette(false); setMockCommandQuery(""); }}
                          className="text-[9px] font-mono bg-[#18161f] text-zinc-550 px-1.5 py-0.5 rounded cursor-pointer border border-[#232029]"
                        >
                          ESC
                        </button>
                      </form>
                      
                      <div className="p-1.5 space-y-0.5 text-xs text-zinc-400">
                        {filteredCommands.length > 0 ? (
                          filteredCommands.map((cmd, idx) => (
                            <button
                              key={cmd.id}
                              type="button"
                              onClick={() => cmd.action()}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors cursor-pointer border ${idx === 0 ? 'bg-amber-500/5 border-amber-500/15 text-amber-500 font-bold' : 'border-transparent hover:bg-[#18161f]/50'}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">[{cmd.category}]</span>
                                <span className="font-mono text-xs uppercase tracking-wider">{cmd.text}</span>
                              </div>
                              <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 border border-[#232029] px-1 rounded">{cmd.hotkey}</span>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-zinc-600 font-mono uppercase text-[9px]">
                            [ NO COMMAND CONDUITS DETECTED ]
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Bar */}
              <div className="flex items-center justify-between border-t border-[#232029] pt-4 text-[10px] font-mono text-zinc-650 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> SYNC: OK</span>
                  <span>SSL_ESTABLISHED</span>
                </div>
                <div>v2.1.4</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Flight Console Logs Simulator */}
        <section className="w-full max-w-4xl mt-24 border border-amber-500/12 bg-zinc-950/40 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-500/40" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-500/40" />
          
          <div className="flex items-center justify-between border-b border-[#232029] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-amber-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#f4ebd0]/70 uppercase">
                {"// SYSTEM_STREAM_OUTPUT // MONITOR"}
              </span>
            </div>
            <span className="text-[9px] font-mono text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">STREAM_LIVE</span>
          </div>
          
          <div className="h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-amber-500/80 superhuman-scrollbar">
            {logLines.length === 0 ? (
              <span className="text-zinc-600 animate-pulse">&gt; LOADING STREAM...</span>
            ) : (
              logLines.map((line, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-zinc-700 font-bold select-none">&gt;</span>
                  <span>{line}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Competitor-Inspired Split Inbox Showcase */}
        <section className="w-full mt-32 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">{"// flight_computer_subsystems"}</h2>
            <p className="text-xl font-bold text-zinc-150 uppercase tracking-tight">Full Control Module Suite</p>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="grid grid-cols-3 border border-[#232029] bg-zinc-950/30 rounded p-1.5 max-w-xl mx-auto text-xs">
            <button 
              onClick={() => setActiveTab("inbox")}
              className={`py-2 rounded font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === "inbox" ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10" : "text-zinc-500 hover:text-zinc-350"}`}
            >
              [ INBOX_NET ]
            </button>
            <button 
              onClick={() => setActiveTab("split")}
              className={`py-2 rounded font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === "split" ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10" : "text-zinc-500 hover:text-zinc-350"}`}
            >
              [ SPLIT_INBOX ]
            </button>
            <button 
              onClick={() => setActiveTab("ai")}
              className={`py-2 rounded font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === "ai" ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/10" : "text-zinc-500 hover:text-zinc-350"}`}
            >
              [ DECRYPT_AI ]
            </button>
          </div>

          {/* Tab Description Container */}
          <div className="max-w-3xl mx-auto border border-[#232029] bg-zinc-950/20 p-8 rounded-xl min-h-64 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-500/20" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-500/20" />

            {activeTab === "inbox" && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">{"// MODULE_01 // INBOX_NET"}</span>
                <h3 className="text-lg font-bold text-zinc-150 uppercase tracking-tight">Command-Line Email Telemetry</h3>
                <p className="text-xs text-zinc-550 leading-relaxed font-sans uppercase">
                  Triage Gmail at lightning speed. Hit keyboard hotkeys to read, archive, delete, or compose messages without picking up your mouse. Built-in indexers sync Postgres records in real-time.
                </p>
                <div className="flex gap-4 pt-2 font-mono text-[9px] text-zinc-650">
                  <span className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> INSTANT SYNC</span>
                  <span className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> OPTIMISTIC ACTIONS</span>
                </div>
              </div>
            )}

            {activeTab === "split" && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">{"// MODULE_02 // SPLIT_INBOX"}</span>
                <h3 className="text-lg font-bold text-zinc-150 uppercase tracking-tight">Focus Tunnels: Split Telemetry</h3>
                <p className="text-xs text-zinc-550 leading-relaxed font-sans uppercase">
                  Divide your email queues into multiple high-priority streams. Keep system logs, crew chat correspondence, and action items isolated. Answer the important packets without looking at secondary alerts.
                </p>
                <div className="flex gap-4 pt-2 font-mono text-[9px] text-zinc-650">
                  <span className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> CUSTOM SPLIT DIRECTIVES</span>
                  <span className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> AUTO-PRIORITIZED VIEWS</span>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">{"// MODULE_03 // DECRYPT_AI"}</span>
                <h3 className="text-lg font-bold text-zinc-150 uppercase tracking-tight">Groq Neural Decryption</h3>
                <p className="text-xs text-zinc-555 leading-relaxed font-sans uppercase">
                  Trigger the cognitive assistant modal with <kbd className="px-1 py-0.5 bg-[#18161f] border border-[#232029] rounded text-[9px]">Cmd+/</kbd>. Draft replies, summarize long threads, or execute meeting creations using voice speech dictation.
                </p>
                <div className="flex gap-4 pt-2 font-mono text-[9px] text-zinc-650">
                  <span className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> SPEECH TO TEXT</span>
                  <span className="flex items-center gap-1.5"><Check size={11} className="text-amber-500" /> GROQ COGNITIVE ENGINE</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Space Flight Social Proof Section (Apollo Inspired) */}
        <section className="w-full mt-32 space-y-12 max-w-5xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">{"// flight_director_evaluations"}</h2>
            <p className="text-xl font-bold text-zinc-150 uppercase tracking-tight">Endorsed Mission Logs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono">
            <div className="bg-[#121116]/50 border border-[#232029] p-6 rounded relative">
              <span className="text-[9px] text-zinc-500 uppercase block mb-3">{"// log_entry: cmdr_h_miller"}</span>
              <p className="text-[11px] text-[#f4ebd0]/80 leading-relaxed uppercase">
                &quot;Triaging telemetry capsule packets from Houston was taking up 3 hours per orbit. Implementing Command Inbox cut our latency down to minutes. The hotkey mappings are solid.&quot;
              </p>
              <div className="mt-4 text-[9px] text-amber-500/80 font-bold uppercase">{"// FLIGHT_DIRECTOR // JAP-13 MISSION"}</div>
            </div>

            <div className="bg-[#121116]/50 border border-[#232029] p-6 rounded relative">
              <span className="text-[9px] text-zinc-500 uppercase block mb-3">{"// log_entry: sys_spec_d_kemp"}</span>
              <p className="text-[11px] text-[#f4ebd0]/80 leading-relaxed uppercase">
                &quot;The neural voice decrypt module processes messy alert feeds in seconds. Reclaiming hours on data parsing lets me focus on physical hardware maintenance logs.&quot;
              </p>
              <div className="mt-4 text-[9px] text-amber-500/80 font-bold uppercase">{"// TELEMETRY_SPECIALIST // APOLLO_D_NET"}</div>
            </div>
          </div>
        </section>

        {/* Flight Architecture / How it Works */}
        <section className="w-full mt-32 space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">{"// system_architecture"}</h2>
            <p className="text-xl font-bold text-zinc-150 uppercase tracking-tight">Telemetry Process Sequence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border border-[#232029] bg-zinc-950/40 p-6 rounded relative">
              <div className="absolute top-3 right-3 text-xs font-mono text-amber-500/40 font-black">PH_01</div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase font-mono mb-3">{"// CONNECT OAUTH LINK"}</h4>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-sans uppercase">
                Authorize your Google account through OAuth client scopes directly in your browser. All data link allocations are isolated to your local environment.
              </p>
            </div>
            
            <div className="border border-[#232029] bg-zinc-950/40 p-6 rounded relative">
              <div className="absolute top-3 right-3 text-xs font-mono text-amber-500/40 font-black">PH_02</div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase font-mono mb-3">{"// SYNCHRONIZE BUFFERS"}</h4>
              <p className="text-[11px] text-zinc-555 leading-relaxed font-sans uppercase">
                Our secure listener buffers pull Gmail messages and Calendar schedules directly via Corsair SDK API calls, writing metadata packets to PostgreSQL.
              </p>
            </div>

            <div className="border border-[#232029] bg-zinc-950/40 p-6 rounded relative">
              <div className="absolute top-3 right-3 text-xs font-mono text-amber-500/40 font-black">PH_03</div>
              <h4 className="text-xs font-bold text-zinc-200 uppercase font-mono mb-3">{"// MUTATE AT LIGHTSPEED"}</h4>
              <p className="text-[11px] text-zinc-555 leading-relaxed font-sans uppercase">
                Operate flight panels with instant keyboard hotkeys. Draft, schedule, sync, and mutate parameters directly on Google Workspace without page load lags.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing / Access Grids */}
        <section className="w-full mt-32 space-y-16">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">{"// console_access_plans"}</h2>
            <p className="text-xl font-bold text-zinc-150 uppercase tracking-tight">Deploy Module Pricing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Plan 1 */}
            <div className="border border-[#232029] bg-zinc-950/30 p-8 rounded flex flex-col justify-between relative">
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-500/20" />
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{"// community_console"}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-zinc-200">$0</span>
                  <span className="text-[10px] text-zinc-500 font-mono">/ FOREVER</span>
                </div>
                <p className="text-[11px] text-zinc-555 leading-relaxed font-sans uppercase">
                  Deploy to local server configurations. Host on private Postgres endpoints. Full source code included.
                </p>
                <ul className="space-y-2 text-[10px] text-zinc-400 font-mono">
                  <li className="flex items-center gap-2"><Check size={11} className="text-amber-500" /> KEYBOARD COMMAND ENGINE</li>
                  <li className="flex items-center gap-2"><Check size={11} className="text-amber-500" /> TWO-WAY CALENDAR UPDATE</li>
                  <li className="flex items-center gap-2"><Check size={11} className="text-amber-500" /> NEURAL AGENT INTERRUPTS</li>
                </ul>
              </div>
              <button 
                onClick={() => signIn("google")}
                className="w-full mt-8 py-3 bg-[#18161f] border border-[#232029] hover:border-amber-500/30 text-amber-500 text-xs font-bold rounded font-mono uppercase tracking-wider cursor-pointer"
              >
                [ CONNECT_SANDBOX ]
              </button>
            </div>

            {/* Plan 2 */}
            <div className="border border-amber-500/20 bg-zinc-950/50 p-8 rounded flex flex-col justify-between relative shadow-[0_0_20px_rgba(245,158,11,0.03)]">
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-500" />
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider font-bold">{"// cloud_command"}</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-amber-500">$9</span>
                  <span className="text-[10px] text-zinc-500 font-mono">/ USER_MONTH</span>
                </div>
                <p className="text-[11px] text-zinc-555 leading-relaxed font-sans uppercase">
                  Fully hosted on our global secure edge cluster. Zero configuration required. Unlimited syncing throughput buffers.
                </p>
                <ul className="space-y-2 text-[10px] text-zinc-400 font-mono">
                  <li className="flex items-center gap-2"><Check size={11} className="text-amber-500" /> EVERYTHING IN COMMUNITY</li>
                  <li className="flex items-center gap-2"><Check size={11} className="text-amber-500" /> AUTOMATIC WEBHOOK BACKUPS</li>
                  <li className="flex items-center gap-2"><Check size={11} className="text-amber-500" /> ZERO-LATENCY EDGE ROUTING</li>
                </ul>
              </div>
              <button 
                onClick={() => signIn("google")}
                className="w-full mt-8 py-3 bg-amber-500 text-zinc-950 hover:bg-amber-400 text-xs font-bold rounded font-mono uppercase tracking-wider cursor-pointer border border-amber-400/20"
              >
                BOOT CLOUD ENGINE
              </button>
            </div>
          </div>
        </section>

        {/* Interactive FAQ Accordion */}
        <section className="w-full max-w-3xl mt-32 space-y-12 mb-32">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-500">{"// system_faq_index"}</h2>
            <p className="text-xl font-bold text-zinc-150 uppercase tracking-tight">Security & Operation Guide</p>
          </div>

          <div className="space-y-4">
            {/* Q1 */}
            <div className="border border-[#232029] bg-zinc-950/20 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase font-mono text-zinc-250 cursor-pointer hover:bg-[#18161f]/40 transition-colors"
              >
                <span>{"// 01. Do you store or see my Google password?"}</span>
                <HelpCircle size={14} className={`text-amber-500 transition-transform duration-200 ${faqOpen[1] ? "rotate-180" : ""}`} />
              </button>
              {faqOpen[1] && (
                <div className="p-4 border-t border-[#232029] text-[11px] font-sans text-zinc-500 uppercase leading-relaxed bg-[#0c0a13]/20">
                  Absolutely not. Authentication utilizes Google&apos;s OAuth 2.0 flow. Access tokens are held inside client browser runtime sessions and are never transmitted to unauthorized databases.
                </div>
              )}
            </div>

            {/* Q2 */}
            <div className="border border-[#232029] bg-zinc-950/20 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase font-mono text-zinc-250 cursor-pointer hover:bg-[#18161f]/40 transition-colors"
              >
                <span>{"// 02. How does the AI Assistant write/schedule actions?"}</span>
                <HelpCircle size={14} className={`text-amber-500 transition-transform duration-200 ${faqOpen[2] ? "rotate-180" : ""}`} />
              </button>
              {faqOpen[2] && (
                <div className="p-4 border-t border-[#232029] text-[11px] font-sans text-zinc-550 uppercase leading-relaxed bg-[#0c0a13]/20">
                  The integrated Decrypt AI connects to the Groq LLM API. The agent parses the email or schedule query context in memory, structures arguments according to Corsair specifications, and performs updates locally.
                </div>
              )}
            </div>

            {/* Q3 */}
            <div className="border border-[#232029] bg-zinc-950/20 rounded-lg overflow-hidden">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full p-4 flex items-center justify-between text-left text-xs font-bold uppercase font-mono text-zinc-250 cursor-pointer hover:bg-[#18161f]/40 transition-colors"
              >
                <span>{"// 03. What is the role of the Corsair SDK framework?"}</span>
                <HelpCircle size={14} className={`text-amber-500 transition-transform duration-200 ${faqOpen[3] ? "rotate-180" : ""}`} />
              </button>
              {faqOpen[3] && (
                <div className="p-4 border-t border-[#232029] text-[11px] font-sans text-zinc-555 uppercase leading-relaxed bg-[#0c0a13]/20">
                  The Corsair SDK maps Gmail and Calendar APIs to high-performance, structured Javascript connectors. This eliminates slow middleware buffers and allows our Postgres DB webhook integration to mirror indices instantly.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
