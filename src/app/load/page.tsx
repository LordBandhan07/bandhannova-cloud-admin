"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldAlert, Cpu, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface Node {
  id: string;
  account_id: string;
  account_username: string;
  space_name: string;
  space_url: string;
  node_type: string;
  status: string;
  cpu_usage: number;
  ram_usage: number;
  storage_used: number;
  last_heartbeat: string;
}

export default function LoadControllerPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [algorithm, setAlgorithm] = useState("Round-Robin");
  const [rateLimit, setRateLimit] = useState(1500);
  const [routingStatus, setRoutingStatus] = useState<{ [key: string]: boolean }>({});
  const [activeConnections, setActiveConnections] = useState<{ [key: string]: number }>({});
  const [nodeLatency, setNodeLatency] = useState<{ [key: string]: number }>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = "http://localhost:8080/api";

  const fetchNodes = async () => {
    let data: Node[] = [];
    try {
      const res = await fetch(`${API_BASE}/nodes`);
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error("Offline");
      }
    } catch (err) {
      data = [];
    }

    setNodes(data);

    // Initialize status and connection counts if not set
    setRoutingStatus((prev) => {
      const next = { ...prev };
      data.forEach((node: Node) => {
        if (next[node.id] === undefined) {
          next[node.id] = true; // active by default
        }
      });
      return next;
    });

    setActiveConnections((prev) => {
      const next = { ...prev };
      data.forEach((node: Node) => {
        if (next[node.id] === undefined) {
          next[node.id] = Math.floor(Math.random() * 40) + 10;
        }
      });
      return next;
    });

    setNodeLatency((prev) => {
      const next = { ...prev };
      data.forEach((node: Node) => {
        if (next[node.id] === undefined) {
          next[node.id] = Math.floor(Math.random() * 20) + 8;
        }
      });
      return next;
    });
  };

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate Load Balancer Activities and Logs
  useEffect(() => {
    const logInterval = setInterval(() => {
      if (nodes.length === 0) return;

      const activeNodes = nodes.filter((n) => routingStatus[n.id]);
      if (activeNodes.length === 0) {
        setLogs((prev) => [
          ...prev.slice(-30),
          `[${new Date().toLocaleTimeString()}] [CRITICAL] No active compute nodes available! Traffic is currently dropping!`,
        ]);
        return;
      }

      // Random request log
      const randomNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
      const randomIp = `103.88.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      
      // Update simulated stats slightly
      setActiveConnections((prev) => {
        const next = { ...prev };
        const change = Math.floor(Math.random() * 5) - 2;
        next[randomNode.id] = Math.max(5, (next[randomNode.id] || 20) + change);
        return next;
      });

      setNodeLatency((prev) => {
        const next = { ...prev };
        const base = Math.floor(Math.random() * 10) + 8;
        // higher active connections = slightly higher latency
        const connections = activeConnections[randomNode.id] || 20;
        next[randomNode.id] = base + Math.floor(connections / 5);
        return next;
      });

      setLogs((prev) => [
        ...prev.slice(-40),
        `[${new Date().toLocaleTimeString()}] [ROUTE] Req from ${randomIp} routed to NVS: ${randomNode.space_name} (${algorithm}) • Active Connections: ${activeConnections[randomNode.id] || 20} • Latency: ${nodeLatency[randomNode.id] || 12}ms`,
      ]);
    }, 1200);

    return () => clearInterval(logInterval);
  }, [nodes, routingStatus, algorithm, activeConnections, nodeLatency]);

  // Log on Algorithm Change
  useEffect(() => {
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Load Balancer routing logic successfully updated to: ${algorithm.toUpperCase()}`,
    ]);
  }, [algorithm]);

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  const toggleRouting = (nodeId: string, name: string) => {
    const current = routingStatus[nodeId];
    setRoutingStatus((prev) => ({
      ...prev,
      [nodeId]: !current,
    }));

    if (current) {
      // Disabled node - empty active connections
      setActiveConnections((prev) => ({
        ...prev,
        [nodeId]: 0,
      }));
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [SHIELD] Node "${name}" has been disabled and isolated from load-balancer routing pool.`,
      ]);
      triggerNotification(`Node "${name}" isolated`);
    } else {
      setActiveConnections((prev) => ({
        ...prev,
        [nodeId]: Math.floor(Math.random() * 20) + 15,
      }));
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [SHIELD] Node "${name}" successfully re-attached and enabled in load-balancer routing pool.`,
      ]);
      triggerNotification(`Node "${name}" attached`);
    }
  };

  const resetAllConnections = () => {
    setActiveConnections((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = routingStatus[k] ? Math.floor(Math.random() * 15) + 10 : 0;
      });
      return next;
    });
    setLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] [SYSTEM] Cleared and re-distributed all connection handshakes across cluster nodes.`,
    ]);
    triggerNotification("Connections reset completed");
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 lg:p-12 relative">
      
      {/* Header */}
      <header className="flex justify-between items-end pb-8 border-b border-border-custom mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">
            Load Controller
          </h1>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mt-1">
            Total Load balancer distribution control and active traffic shaping
          </p>
        </div>
      </header>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of Hosts with toggles */}
        <div className="lg:col-span-2 border border-border-custom bg-card rounded p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-base font-bold uppercase tracking-wider">Node Traffic Routing</h2>
            <button
              onClick={resetAllConnections}
              className="px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded border border-border-custom hover:border-white text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="h-3 w-3" /> Re-balance Connections
            </button>
          </div>

          {nodes.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm tracking-wide uppercase">
              No compute hosts mapped.
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => {
                const isEnabled = routingStatus[node.id];
                const activeConn = activeConnections[node.id] || 0;
                const latency = nodeLatency[node.id] || 12;

                return (
                  <div
                    key={node.id}
                    className={`border border-border-custom rounded bg-black p-5 flex items-center justify-between gap-4 transition-all duration-200 ${
                      isEnabled ? "border-border-custom" : "border-dashed opacity-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold uppercase tracking-wide">
                          {node.space_name}
                        </span>
                        <span
                          className={`text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded border ${
                            isEnabled
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-500 border-zinc-700"
                          }`}
                        >
                          {isEnabled ? "ROUTING ENABLED" : "ISOLATED"}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        Host Spec: 2 Cores • 16.0 GB RAM • 100.0 GB SSD
                      </div>
                      
                      {isEnabled && (
                        <div className="flex gap-4 text-[10px] font-mono text-zinc-400 mt-2">
                          <div>
                            CONNECTIONS: <span className="text-white font-bold">{activeConn}</span>
                          </div>
                          <div>
                            LATENCY: <span className="text-white font-bold">{latency}ms</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Active routing toggle */}
                      <button
                        onClick={() => toggleRouting(node.id, node.space_name)}
                        className={`px-4 py-2 text-[9px] font-bold tracking-widest uppercase rounded transition-all ${
                          isEnabled
                            ? "bg-white text-black border border-white hover:bg-black hover:text-white"
                            : "bg-transparent text-zinc-500 border border-zinc-700 hover:border-white hover:text-white"
                        }`}
                      >
                        {isEnabled ? "Isolate Node" : "Enable Routing"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Balancing control panel */}
        <div className="space-y-8">
          
          {/* Global Balancing Mode */}
          <div className="border border-border-custom bg-card rounded p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4" /> Balancing Settings
            </h3>
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Routing Logic
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
              >
                <option value="Round-Robin">Round-Robin (Standard)</option>
                <option value="Least Connections">Least Connections</option>
                <option value="IP Hashing">IP Hashing</option>
                <option value="Resource-Aware">Resource-Aware (Weighted CPU)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                <span>Request Limit Cap</span>
                <span className="text-white font-mono">{rateLimit} RPS</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 border-none outline-none appearance-none rounded cursor-pointer accent-white"
              />
            </div>
          </div>

          {/* Activity Logs Console */}
          <div className="border border-border-custom bg-card rounded p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-4 w-4" /> Routing Activity Log
            </h3>
            <div className="h-64 bg-black border border-border-custom p-4 rounded overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-2.5">
              {logs.length === 0 ? (
                <div className="text-zinc-600 text-center pt-12 uppercase tracking-wide">
                  Waiting for incoming gateway requests...
                </div>
              ) : (
                logs.map((log, index) => {
                  let logClass = "text-zinc-400";
                  if (log.includes("[CRITICAL]")) logClass = "text-red-500 font-bold";
                  if (log.includes("[SYSTEM]")) logClass = "text-white font-bold";
                  if (log.includes("[SHIELD]")) logClass = "text-yellow-500";

                  return (
                    <div key={index} className={`${logClass} leading-relaxed border-b border-border-custom/5 pb-1`}>
                      {log}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-8 right-8 bg-white text-black text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded shadow-lg z-50">
          {notification}
        </div>
      )}

    </div>
  );
}
