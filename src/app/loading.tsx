import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#0b0a0d] text-amber-500 font-mono animate-crt relative overflow-hidden">
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 m-8" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 m-8" />
      
      <div className="flex flex-col items-center gap-4 border border-[#232029] bg-zinc-950/40 p-8 rounded-lg shadow-[0_0_30px_rgba(245,158,11,0.05)]">
        <Activity className="w-8 h-8 animate-pulse text-amber-500" />
        <div className="space-y-2 text-center">
          <div className="text-xs font-bold tracking-widest uppercase">FETCHING_TELEMETRY</div>
          <div className="text-[10px] text-zinc-500">Querying database matrices...</div>
        </div>
      </div>
    </div>
  );
}
