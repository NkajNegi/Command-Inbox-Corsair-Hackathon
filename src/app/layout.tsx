import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
import { auth } from "@/auth";
import MobileBottomNav from "@/components/MobileBottomNav";

const CommandPalette = dynamic(() => import("@/components/CommandPalette"));
const AgentChat = dynamic(() => import("@/components/AgentChat"));
const EmailSearchModalWrapper = dynamic(() => import("@/components/EmailSearchModalWrapper"));
const ComposeEmailModal = dynamic(() => import("@/components/ComposeEmailModal"));
const ComposeEventModal = dynamic(() => import("@/components/ComposeEventModal"));
import KeyboardShortcuts from "@/components/KeyboardShortcuts";

const inter = Inter({ subsets: ["latin"] });
const jbMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Command Inbox",
  description: "Superhuman-style Gmail and Google Calendar workflow app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" className={isLoggedIn ? "dark overflow-hidden" : ""} suppressHydrationWarning>
      <body 
        className={`${inter.className} ${jbMono.variable} ${isLoggedIn ? "bg-background text-foreground h-screen overflow-hidden pb-16 md:pb-0" : "bg-[#030303] text-white min-h-screen overflow-y-auto"} flex antialiased`}
        suppressHydrationWarning
      >
        {isLoggedIn && (
          <div className="hidden md:flex h-full fixed inset-y-0 left-0 z-20">
            <Sidebar />
          </div>
        )}
        <main className={`flex-1 flex flex-col relative z-10 w-full ${isLoggedIn ? 'h-full overflow-hidden md:pl-64' : 'min-h-screen overflow-visible'}`}>
          {children}
        </main>
        {isLoggedIn && (
          <>
            <MobileBottomNav />
            <KeyboardShortcuts />
            <CommandPalette />
            <AgentChat />
            <EmailSearchModalWrapper />
            <ComposeEmailModal />
            <ComposeEventModal />
          </>
        )}
      </body>
    </html>
  );
}
