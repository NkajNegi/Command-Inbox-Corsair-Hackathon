"use client";

import { useState, useEffect } from "react";
import { Terminal, Activity, Sliders, Key, Database, Cpu, Check, RefreshCw } from "lucide-react";
import Link from "next/link";
import type { Session } from "next-auth";

export default function SettingsClient({ session }: { session: Session }) {
  const [autoDecrypt, setAutoDecrypt] = useState(true);
  const [model, setModel] = useState("llama3-70b");
  const [cipher, setCipher] = useState("aes-256-gcm");
  const [clientId, setClientId] = useState("corsair_client_id_apollo_11");
  const [clientSecret, setClientSecret] = useState("••••••••••••••••••••••••••••••••");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const savedAutoDecrypt = localStorage.getItem("corsair_auto_decrypt");
    if (savedAutoDecrypt !== null) setAutoDecrypt(savedAutoDecrypt === "true");
    
    const savedModel = localStorage.getItem("corsair_ai_model");
    if (savedModel) setModel(savedModel);
    
    const savedCipher = localStorage.getItem("corsair_cipher");
    if (savedCipher) setCipher(savedCipher);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate saving delay and persist
    setTimeout(() => {
      localStorage.setItem("corsair_auto_decrypt", autoDecrypt.toString());
      localStorage.setItem("corsair_ai_model", model);
      localStorage.setItem("corsair_cipher", cipher);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1200);
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
              MODULE_TRG // CONTROL_PANEL
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
      <div className="flex-1 overflow-y-auto p-6 md:p-10 relative superhuman-scrollbar">
        {/* Tactical L-Bracket Frames inside main view */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/20 pointer-events-none z-10" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/20 pointer-events-none z-10" />

        <div className="max-w-4xl mx-auto space-y-10 z-10 relative">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-zinc-100 uppercase">
              {"// system_control_panel: parameters_config"}
            </h2>
            <p className="text-[10px] text-zinc-550 mt-1 uppercase tracking-wider">
              Manage local decryption ciphers, Groq models, and Google API tunnels
            </p>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Form Settings */}
            <div className="space-y-6">
              
              {/* Panel 1: AI Decrypt Parameters */}
              <div className="border border-[#232029] bg-zinc-950/20 p-5 rounded-lg space-y-4 relative">
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-500/20" />
                <h3 className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                  <Sliders size={12} /> {"// decrypt_ai_matrix"}
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  {/* Auto Decrypt Toggle */}
                  <div className="flex items-center justify-between border-b border-[#232029] pb-3">
                    <span className="text-[#8c839a] uppercase">Auto Decrypt Incoming</span>
                    <button
                      type="button"
                      onClick={() => setAutoDecrypt(!autoDecrypt)}
                      className={`w-9 h-5 rounded flex items-center p-0.5 transition-colors cursor-pointer ${autoDecrypt ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-zinc-950 border border-[#232029]'}`}
                    >
                      <div className={`w-3.5 h-3.5 rounded transition-transform ${autoDecrypt ? 'bg-amber-500 translate-x-4 shadow-[0_0_6px_rgba(245,158,11,0.5)]' : 'bg-[#8c839a]'}`} />
                    </button>
                  </div>

                  {/* Dropdown 1: Groq AI Model */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#8c839a] uppercase">Groq AI Processor</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="bg-zinc-950 border border-[#232029] text-zinc-300 px-3 py-2 rounded text-xs focus:border-amber-500/30 focus:outline-none"
                    >
                      <option value="llama3-70b">Llama-3-70b-Instruct (Groq)</option>
                      <option value="llama3-8b">Llama-3-8b-Instant (Groq)</option>
                      <option value="mixtral-8x7b">Mixtral-8x7b-32768 (Groq)</option>
                    </select>
                  </div>

                  {/* Dropdown 2: SSL Cipher */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#8c839a] uppercase">Encryption Cipher</label>
                    <select
                      value={cipher}
                      onChange={(e) => setCipher(e.target.value)}
                      className="bg-zinc-950 border border-[#232029] text-zinc-300 px-3 py-2 rounded text-xs focus:border-amber-500/30 focus:outline-none"
                    >
                      <option value="aes-256-gcm">AES-256-GCM (Hardware Accel)</option>
                      <option value="chacha20-poly1305">ChaCha20-Poly1305 (Nominal)</option>
                      <option value="aes-128-cbc">AES-128-CBC (Legacy Decrypt)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Panel 2: Corsair SDK Connection Link */}
              <div className="border border-[#232029] bg-zinc-950/20 p-5 rounded-lg space-y-4 relative">
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-500/20" />
                <h3 className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                  <Key size={12} /> {"// corsair_sdk_link"}
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#8c839a] uppercase">Corsair Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="bg-zinc-950 border border-[#232029] text-zinc-350 px-3 py-2 rounded text-xs focus:border-amber-500/30 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[#8c839a] uppercase">Corsair Client Secret</label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="bg-zinc-950 border border-[#232029] text-zinc-350 px-3 py-2 rounded text-xs focus:border-amber-500/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button Row */}
              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded shadow-md shadow-amber-500/10 cursor-pointer border border-amber-400/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>WRITING SYSTEM CONFIG...</span>
                    </>
                  ) : (
                    <span>WRITE PARAMETERS</span>
                  )}
                </button>

                {saveSuccess && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold animate-pulse">
                    <Check size={14} />
                    <span>SYSTEM PARAMETERS UPDATED // NOMINAL</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: DB Matrix Status & telemetry feeds */}
            <div className="space-y-6">
              
              {/* Panel 3: Local Postgres Matrix */}
              <div className="border border-[#232029] bg-zinc-950/20 p-5 rounded-lg space-y-4 relative">
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-500/20" />
                <h3 className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                  <Database size={12} /> {"// db_environment_matrix"}
                </h3>

                <div className="space-y-4 pt-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#232029]/60 pb-2">
                    <span className="text-[#8c839a] uppercase">Drizzle ORM Engine</span>
                    <span className="text-zinc-200">v0.31.2</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#232029]/60 pb-2">
                    <span className="text-[#8c839a] uppercase">Postgres Status</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                      <span className="text-amber-400 font-bold uppercase">Linked (Neon)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#232029]/60 pb-2">
                    <span className="text-[#8c839a] uppercase">Local Email Buffer</span>
                    <span className="text-zinc-200 uppercase">47 Sync Packets</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8c839a] uppercase">Local Calendar Buffer</span>
                    <span className="text-zinc-200 uppercase">12 Sync Packets</span>
                  </div>
                </div>
              </div>

              {/* Panel 4: System CPU Telemetry */}
              <div className="border border-[#232029] bg-zinc-950/20 p-5 rounded-lg space-y-4 relative">
                <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-amber-500/20" />
                <h3 className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                  <Cpu size={12} /> {"// cognitive_system_core"}
                </h3>

                <div className="space-y-2 pt-2 text-[10px] text-zinc-550 uppercase leading-relaxed font-mono">
                  <p>&gt; sys_cpu_load: 14.2% nominal</p>
                  <p>&gt; core_temp: 34.5°c stable</p>
                  <p>&gt; ssl_cipher_bits: 256-bit secure</p>
                  <p>&gt; vector_dimension: 1536 (pgvector)</p>
                  <p>&gt; flight_mode: SPEED_OF_COMMAND active</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
