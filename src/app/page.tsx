"use client";

import React, { useState, useEffect } from "react";
import { Server, Cpu, Activity, HardDrive, ArrowUpRight, Grid } from "lucide-react";

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

interface ClusterStats {
  total_accounts: number;
  total_nodes: number;
  total_vcpu: number;
  total_ram_gb: number;
  total_storage_gb: number;
  used_ram_gb: number;
  used_storage_gb: number;
  active_workers: number;
  sleeping_workers: number;
  failed_workers: number;
}

export default function OverviewPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [stats, setStats] = useState<ClusterStats>({
    total_accounts: 0,
    total_nodes: 0,
    total_vcpu: 0,
    total_ram_gb: 0,
    total_storage_gb: 0,
    used_ram_gb: 0,
    used_storage_gb: 0,
    active_workers: 0,
    sleeping_workers: 0,
    failed_workers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [revealedHypervisors, setRevealedHypervisors] = useState<{ [key: string]: boolean }>({});

  const API_BASE = "http://localhost:8080/api";

  const fetchData = async () => {
    try {
      const [resStats, resNodes] = await Promise.all([
        fetch(`${API_BASE}/cluster/stats`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API_BASE}/nodes`).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (resStats && resNodes) {
        setStats(resStats);
        setNodes(resNodes);
      } else {
        throw new Error("Backend Offline");
      }
    } catch (err) {
      setStats({
        total_accounts: 0,
        total_nodes: 0,
        total_vcpu: 0,
        total_ram_gb: 0,
        total_storage_gb: 0,
        used_ram_gb: 0,
        used_storage_gb: 0,
        active_workers: 0,
        sleeping_workers: 0,
        failed_workers: 0,
      });
      setNodes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const toggleHypervisor = (nodeId: string) => {
    setRevealedHypervisors((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 lg:p-12">
      
      {/* Top Header */}
      <header className="flex justify-between items-end pb-8 border-b border-border-custom mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase">
            Bare-Metal Compute Grid
          </h1>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mt-1">
            Nova Cloud Server Controller • Cluster Overview
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-zinc-950 border border-border-custom text-xs font-mono">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-indicator"></div>
          GRID ONLINE
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="border border-border-custom bg-card rounded p-6 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
            Active Compute Nodes <Server className="h-3.5 w-3.5 text-zinc-500" />
          </h3>
          <div className="text-3xl font-extrabold my-4 tracking-tight">{stats.total_nodes}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            ● {stats.active_workers} Active • 0 Offline
          </div>
        </div>

        <div className="border border-border-custom bg-card rounded p-6 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
            Aggregated Thread Core <Cpu className="h-3.5 w-3.5 text-zinc-500" />
          </h3>
          <div className="text-3xl font-extrabold my-4 tracking-tight">{stats.total_vcpu} Cores</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Nova Compute Engine v4 hyperthreads
          </div>
        </div>

        <div className="border border-border-custom bg-card rounded p-6 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
            Memory Allocation <Activity className="h-3.5 w-3.5 text-zinc-500" />
          </h3>
          <div className="text-3xl font-extrabold my-4 tracking-tight">{stats.total_ram_gb} GB</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider flex justify-between">
            <span>Free: {stats.total_ram_gb - stats.used_ram_gb} GB</span>
            <span className="font-bold text-white">0% USED</span>
          </div>
        </div>

        <div className="border border-border-custom bg-card rounded p-6 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex justify-between items-center">
            Consolidated Storage <HardDrive className="h-3.5 w-3.5 text-zinc-500" />
          </h3>
          <div className="text-3xl font-extrabold my-4 tracking-tight">
            {(stats.total_storage_gb / 1000).toFixed(1)} TB
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
            Dataset SSD Lake Capacity
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Active Host Instances */}
        <div className="lg:col-span-2 border border-border-custom bg-card rounded p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-base font-bold uppercase tracking-wider">Active Host Instances</h2>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-950 border border-border-custom text-zinc-400">
              Edge Synced
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-zinc-500 text-sm tracking-wide uppercase">
              Initializing connection to Nova backend...
            </div>
          ) : nodes.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm tracking-wide uppercase">
              No bare-metal hosts provisioned in cluster database.
            </div>
          ) : (
            <div className="space-y-4">
              {nodes.map((node) => {
                const maskedTarget = `https://${node.account_username}.nova-node.cloud`;
                const nodeTypeLabel = node.node_type === "API Worker" ? "Bare-Metal Core" : node.node_type;
                
                return (
                  <div
                    key={node.id}
                    className="border border-border-custom rounded bg-black p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-800 transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold uppercase tracking-wide">
                          {node.space_name}
                        </span>
                        <span className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          {node.status}
                        </span>
                      </div>
                      <div
                        className="text-xs text-zinc-500 font-mono hover:text-white cursor-pointer select-all truncate max-w-sm"
                        title="Copy Node Address"
                        onClick={() => {
                          navigator.clipboard.writeText(maskedTarget);
                        }}
                      >
                        {maskedTarget}
                      </div>
                      <div className="text-[10px] text-zinc-600 uppercase tracking-wide">
                        {nodeTypeLabel} • 2 vCPUs • 16.0 GB RAM • 100.0 GB SSD
                      </div>
                      
                      {/* Concealed Hypervisor Details */}
                      <div className="pt-2">
                        <button
                          onClick={() => toggleHypervisor(node.id)}
                          className="text-[9px] font-bold text-zinc-700 hover:text-zinc-500 uppercase tracking-widest"
                        >
                          [Instance Hypervisor]
                        </button>
                        {revealedHypervisors[node.id] && (
                          <div className="mt-1.5 p-2 bg-zinc-950 border border-border-custom rounded font-mono text-[9px] text-zinc-600 word-break-all select-all">
                            TARGET: {node.space_url}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Allocation and Distribution Info */}
        <div className="space-y-8">
          
          {/* Allocation details */}
          <div className="border border-border-custom bg-card rounded p-6 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider">Resource Allocation</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs uppercase tracking-wide text-zinc-400">
                <span>Free RAM Pool</span>
                <span className="font-bold text-white">
                  0 GB / {stats.total_ram_gb} GB
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-950 border border-border-custom rounded overflow-hidden">
                <div className="h-full bg-white transition-all duration-500" style={{ width: "0%" }}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs uppercase tracking-wide text-zinc-400">
                <span>Dataset Storage Vault</span>
                <span className="font-bold text-white">
                  0 GB / {stats.total_storage_gb} GB
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-950 border border-border-custom rounded overflow-hidden">
                <div className="h-full bg-white transition-all duration-500" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>

          {/* Core breakdown info */}
          <div className="border border-border-custom bg-card rounded p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider">Node Types</h3>
            <div className="space-y-3">
              {[
                { name: "Bare-Metal Compute", count: nodes.filter((n) => n.node_type === "API Worker").length },
                { name: "Edge Load Balancer", count: nodes.filter((n) => n.node_type === "Load Balancer").length },
                { name: "Hyper-Scale LLM", count: nodes.filter((n) => n.node_type === "LLM Inference").length },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs uppercase tracking-wider">
                  <span className="text-zinc-500">{item.name}</span>
                  <span className="font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
