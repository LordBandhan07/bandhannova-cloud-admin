"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Server,
  Users,
  Activity,
  Cloud,
  ArrowRight,
  Database,
  Grid
} from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const navItems = [
    { href: "/", label: "Overview", icon: Layers },
    { href: "/nodes", label: "Spaces & Buckets", icon: Database },
    { href: "/load", label: "Load Controller", icon: Activity }
  ];

  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-screen w-screen overflow-hidden flex bg-background text-foreground bg-grid-pattern">
        
        {/* Minimal Black & White Sidebar */}
        <aside className={`flex flex-col h-full border-r border-border-custom bg-card transition-all duration-300 shrink-0 ${isSidebarCollapsed ? "w-20" : "w-64"}`}>
          
          {/* Header */}
          <div className="flex items-center gap-3 p-6 border-b border-border-custom justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              {!isSidebarCollapsed ? (
                <img
                  src="/bandhannova-logo-final.svg"
                  alt="BandhanNova"
                  className="h-5 w-auto block"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-foreground text-background font-black text-sm tracking-widest">
                  BN
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex w-full items-center gap-4 px-4 py-3 rounded transition-all duration-200 text-left ${
                    isActive
                      ? "bg-foreground text-background font-semibold"
                      : "text-zinc-400 hover:text-foreground hover:bg-zinc-950"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="text-[13px] tracking-wide uppercase">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border-custom space-y-3">
            {!isSidebarCollapsed && (
              <div className="rounded border border-border-custom bg-black p-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-indicator"></div>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Turso Cloud Sync</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-1 font-mono">REPLICATION: ONLINE</div>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex w-full h-9 items-center justify-center rounded border border-border-custom hover:border-foreground text-zinc-400 hover:text-foreground transition-all"
            >
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isSidebarCollapsed ? "" : "rotate-180"}`} />
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>

      </body>
    </html>
  );
}
