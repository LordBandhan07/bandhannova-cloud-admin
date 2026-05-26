"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  Activity,
  ArrowRight,
  Database,
  Lock,
  Terminal,
  ShieldCheck,
  PowerOff
} from "lucide-react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("BNC_ADMIN_AUTH");
    if (token === "BNC_AUTHENTICATED_SESSION_KEY_2026") {
      setIsAuthenticated(true);
    }
    setHasCheckedAuth(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthenticating(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("BNC_ADMIN_AUTH", data.token);
        setIsAuthenticated(true);
        setPasswordInput("");
      } else {
        setAuthError(data.error || "Access Denied: Invalid Key");
      }
    } catch (err) {
      setAuthError("Auth Server Offline");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("BNC_ADMIN_AUTH");
    setIsAuthenticated(false);
  };

  const navItems = [
    { href: "/", label: "Overview", icon: Layers },
    { href: "/nodes", label: "Spaces & Buckets", icon: Database },
    { href: "/load", label: "Load Controller", icon: Activity }
  ];

  if (!hasCheckedAuth) {
    return (
      <html lang="en" className="h-full antialiased dark">
        <body className="h-screen w-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-[10px] font-bold tracking-widest text-zinc-600 uppercase font-mono animate-pulse">
            Booting secure container...
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="h-screen w-screen overflow-hidden flex bg-background text-foreground bg-grid-pattern">
        
        {!isAuthenticated ? (
          /* High-Fidelity Cyber Security Gate */
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
            
            <div className="absolute inset-0 bg-radial-glow opacity-30 z-0"></div>

            <div className="w-full max-w-md border border-border-custom bg-card rounded p-8 shadow-2xl relative z-10 hover:border-zinc-800 transition-all duration-300">
              
              {/* Core header */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-border-custom mb-8">
                <div className="h-12 w-12 rounded-full border border-white/10 bg-zinc-950 flex items-center justify-center mb-4 text-white shadow-glow">
                  <Lock className="h-5 w-5" />
                </div>
                <img
                  src="/bandhannova-logo-final.svg"
                  alt="BandhanNova"
                  className="h-6 w-auto block mb-2"
                />
                <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-500 font-mono mt-1 flex items-center gap-1">
                  <Terminal className="h-3 w-3" /> SECURITY CONTAINER GATEWAY
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Enter Admin Access Key
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full bg-black border border-border-custom rounded px-4 py-3 text-xs text-white focus:outline-none focus:border-white transition-all text-center tracking-widest font-mono shadow-inner"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/30 border border-red-900 rounded text-center text-[10px] font-extrabold text-red-500 uppercase tracking-widest animate-shake">
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full bg-white hover:bg-black text-black hover:text-white border border-white font-extrabold py-3 rounded text-xs uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isAuthenticating ? "Decrypting..." : "Decrypt & Unlock"}
                </button>
              </form>

              {/* Security Footer */}
              <div className="mt-8 pt-4 border-t border-border-custom text-center text-[9px] font-mono text-zinc-600 uppercase flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-500" /> bsscs private administration network
              </div>

            </div>
          </div>
        ) : (
          /* Fully Unlocked Admin Workspace */
          <>
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
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className={`flex h-9 items-center justify-center rounded border border-border-custom hover:border-red-500 text-zinc-500 hover:text-red-500 transition-all font-bold text-[10px] uppercase tracking-widest gap-2 w-full`}
                >
                  <PowerOff className="h-3.5 w-3.5" />
                  {!isSidebarCollapsed && <span>Lock Console</span>}
                </button>

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
          </>
        )}

      </body>
    </html>
  );
}
