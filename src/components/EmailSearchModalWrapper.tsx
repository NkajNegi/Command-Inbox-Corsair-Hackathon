"use client";

import { useState, useEffect } from "react";
import EmailSearchModal from "./EmailSearchModal";

export default function EmailSearchModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open advanced search with Ctrl+Shift+F
      if (e.key.toLowerCase() === "f" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Also listen for a custom event from CommandPalette if needed
  useEffect(() => {
    const handleOpenSearch = () => setIsOpen(true);
    window.addEventListener("open-email-search", handleOpenSearch);
    return () => window.removeEventListener("open-email-search", handleOpenSearch);
  }, []);

  return <EmailSearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
