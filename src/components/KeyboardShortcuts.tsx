"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    let lastKey = "";
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Ignore if any modifier keys are pressed (prevents conflicting with OS shortcuts like Cmd+C or Ctrl+C)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      // Sequence: g then i (Go to Inbox)
      if (lastKey === "g" && key === "i") {
        router.push("/");
        lastKey = "";
        return;
      }

      // Sequence: g then c (Go to Calendar)
      if (lastKey === "g" && key === "c") {
        router.push("/calendar");
        lastKey = "";
        return;
      }

      // Sequence: g then s (Go to Settings)
      if (lastKey === "g" && key === "s") {
        router.push("/settings");
        lastKey = "";
        return;
      }

      // Single keys
      switch (key) {
        case "c":
          e.preventDefault();
          window.dispatchEvent(new Event("open-compose-email"));
          break;
        case "e":
          e.preventDefault();
          window.dispatchEvent(new Event("open-compose-event"));
          break;
        case "s":
          e.preventDefault();
          window.dispatchEvent(new Event("open-email-search"));
          break;
        case "/":
          e.preventDefault();
          window.dispatchEvent(new Event("open-agent-chat"));
          break;
        case "g":
          lastKey = "g";
          clearTimeout(timeout);
          timeout = setTimeout(() => { lastKey = ""; }, 1000);
          return; // Don't clear lastKey
      }

      lastKey = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [router]);

  return null; // This is a logic-only component
}
