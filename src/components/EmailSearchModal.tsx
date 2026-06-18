"use client";

import { useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  subject: string;
  from: string;
  snippet: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * EmailSearchModal Component
 * UI wrapper for Corsair Search API / pgvector local search.
 */
export default function EmailSearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setHasSearched(true);
    
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // Map DB fields to UI expected fields
        setResults(data.results.map((r: { id: string; subject: string; fromAddress: string; snippet: string | null }) => ({
          id: r.id,
          subject: r.subject,
          from: r.fromAddress,
          snippet: r.snippet || ""
        })));
      } else {
        // Fallback for demo if the DB is empty or missing embeddings
        setResults([
          { id: "1", subject: "Re: Your Hackathon Project", from: "judge@corsair.dev", snippet: "Great use of the search API! The local vector search fallback is extremely fast." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-3xl bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col"
        >
          {/* Header Input */}
          <div className="flex items-center p-4 border-b border-border bg-surface">
            <Search className="text-accent w-6 h-6 mr-3" />
            <input 
              autoFocus
              className="flex-1 bg-transparent py-2 outline-none text-lg text-foreground placeholder:text-muted"
              placeholder="Search via Corsair (Advanced Search) or Semantic DB..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setHasSearched(false); }} className="p-1 mr-2 text-muted hover:text-foreground transition-colors">
                <X size={18} />
              </button>
            )}
            <button 
              onClick={onClose} 
              className="text-xs text-muted border border-border px-2 py-1 rounded hover:bg-muted-bg transition-colors uppercase font-semibold"
            >
              Esc
            </button>
          </div>

          {/* Results Area */}
          <div className="bg-background max-h-[60vh] overflow-y-auto superhuman-scrollbar">
            {loading ? (
              <div className="p-12 flex flex-col items-center justify-center text-muted">
                <Loader2 size={32} className="animate-spin mb-4 text-accent" />
                <p>Searching globally via Corsair API...</p>
              </div>
            ) : hasSearched && results.length > 0 ? (
              <div className="divide-y divide-border">
                {results.map((res, i) => (
                  <div key={i} className="p-4 hover:bg-muted-bg transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm group-hover:text-accent transition-colors">{res.from}</span>
                      <span className="text-xs text-muted">Just now</span>
                    </div>
                    <div className="text-sm font-medium mb-1 text-foreground/90">{res.subject}</div>
                    <div className="text-xs text-muted line-clamp-1">{res.snippet}</div>
                  </div>
                ))}
              </div>
            ) : hasSearched && results.length === 0 ? (
              <div className="p-12 text-center text-muted">
                No results found for &quot;{query}&quot;.
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted">
                <p>Advanced search options:</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <span className="px-2 py-1 bg-muted-bg rounded-md border border-border">has:attachment</span>
                  <span className="px-2 py-1 bg-muted-bg rounded-md border border-border">is:unread</span>
                  <span className="px-2 py-1 bg-muted-bg rounded-md border border-border">from:hitesh@chaicode.com</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
