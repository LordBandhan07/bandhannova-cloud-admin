"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Database, Globe, Link2, FolderHeart, Key, RefreshCw, Layers } from "lucide-react";

interface Account {
  id: string;
  email: string;
  user_name: string;
  huggingface_space_url: string;
  huggingface_backend_url: string;
  huggingface_bucket_url: string;
  huggingface_storage_url: string;
  huggingface_token: string;
  status: string;
  added_at: string;
}

interface Node {
  id: string;
  account_id: string;
  account_username: string;
  space_name: string;
  space_url: string;
  node_type: string;
  status: string;
}

export default function SpacesBucketsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  
  // Unified Form States
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [spaceUrl, setSpaceUrl] = useState("");
  const [backendUrl, setBackendUrl] = useState("");
  const [bucketUrl, setBucketUrl] = useState("");
  const [storageUrl, setStorageUrl] = useState("");
  const [token, setToken] = useState("");

  const [notification, setNotification] = useState<string | null>(null);

  const API_BASE = "http://localhost:8080/api";

  const fetchData = async () => {
    try {
      const [resAccounts, resNodes] = await Promise.all([
        fetch(`${API_BASE}/accounts`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_BASE}/nodes`).then((r) => (r.ok ? r.json() : []))
      ]);
      setAccounts(resAccounts);
      setNodes(resNodes);
    } catch (err) {
      setAccounts([]);
      setNodes([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const triggerNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !userName.trim() ||
      !email.trim() ||
      !spaceUrl.trim() ||
      !backendUrl.trim() ||
      !bucketUrl.trim() ||
      !storageUrl.trim() ||
      !token.trim()
    ) {
      triggerNotification("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/accounts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: userName.trim(),
          email: email.trim(),
          huggingface_space_url: spaceUrl.trim(),
          huggingface_backend_url: backendUrl.trim(),
          huggingface_bucket_url: bucketUrl.trim(),
          huggingface_storage_url: storageUrl.trim(),
          huggingface_token: token.trim()
        })
      });

      if (res.ok) {
        triggerNotification(`Space & Bucket package provisioned successfully!`);
        setUserName("");
        setEmail("");
        setSpaceUrl("");
        setBackendUrl("");
        setBucketUrl("");
        setStorageUrl("");
        setToken("");
        fetchData();
      } else {
        triggerNotification("Failed to provision subscription package");
      }
    } catch (err) {
      triggerNotification("Connection error");
    }
  };

  const handleRebuild = async (user: string) => {
    // Find the compute node ID associated with this username
    const targetNode = nodes.find(n => n.account_username === user && n.node_type === "API Worker");
    if (!targetNode) {
      triggerNotification("No active compute space found to rebuild");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/nodes/${targetNode.id}/rebuild`, { method: "POST" });
      if (res.ok) {
        triggerNotification(`Rebuild signal dispatched for ${user}-node`);
        fetchData();
      } else {
        triggerNotification("Failed to send rebuild signal");
      }
    } catch (err) {
      triggerNotification("Connection error");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to terminate Hugging Face Subscription Profile "@${name}"?\nThis will automatically drop both the compute space and the storage bucket from the database!`)) return;

    try {
      const res = await fetch(`${API_BASE}/accounts/${id}`, { method: "DELETE" });
      if (res.status === 204) {
        triggerNotification(`Subscription @${name} terminated and cleaned`);
        fetchData();
      } else {
        triggerNotification("Failed to delete subscription");
      }
    } catch (err) {
      triggerNotification("Connection error");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto p-8 lg:p-12 relative">
      
      {/* Header */}
      <header className="flex justify-between items-end pb-8 border-b border-border-custom mb-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase flex items-center gap-3">
            Spaces & Buckets Manager
          </h1>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mt-1">
            Register and orchestrate 16GB RAM + 2vCPU + 100GB Storage Account Packages
          </p>
        </div>
      </header>

      {/* Main split sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Registered unified packages */}
        <div className="xl:col-span-2 border border-border-custom bg-card rounded p-8">
          <h2 className="text-base font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
            <Database className="h-5 w-5 text-white" /> Provisioned Packages ({accounts.length})
          </h2>

          {accounts.length === 0 ? (
            <div className="text-center py-20 text-zinc-600 text-xs tracking-widest uppercase">
              No active subscription packages found. Use the panel on the right to provision one.
            </div>
          ) : (
            <div className="space-y-6">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="border border-border-custom rounded bg-black p-6 hover:border-zinc-800 transition-all duration-200"
                >
                  {/* Top Header details */}
                  <div className="flex items-start justify-between gap-4 border-b border-border-custom pb-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold uppercase tracking-wide text-zinc-200">
                          @{acc.user_name}
                        </span>
                        <span className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Active Pack
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 font-mono">
                        {acc.email}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRebuild(acc.user_name)}
                        className="px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded border border-border-custom hover:border-white text-zinc-400 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3" /> Rebuild
                      </button>
                      <button
                        onClick={() => handleDelete(acc.id, acc.user_name)}
                        className="px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded border border-border-custom hover:border-red-500 text-zinc-500 hover:text-red-500 transition-all flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3 w-3" /> Terminate
                      </button>
                    </div>
                  </div>

                  {/* Body Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
                    {/* Compute column */}
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-border-custom pb-1.5">
                        Compute Host (16GB RAM + 2vCPU)
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Globe className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[9px]">Backend URL:</span>
                        <a href={acc.huggingface_backend_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white font-mono truncate max-w-[220px]">
                          {acc.huggingface_backend_url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Link2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[9px]">Space Link:</span>
                        <a href={acc.huggingface_space_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white font-mono truncate max-w-[220px]">
                          {acc.huggingface_space_url}
                        </a>
                      </div>
                    </div>

                    {/* Storage column */}
                    <div className="space-y-2.5">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-border-custom pb-1.5">
                        Storage Vault (100GB Storage)
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <FolderHeart className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[9px]">Bucket URL:</span>
                        <a href={acc.huggingface_bucket_url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white font-mono truncate max-w-[220px]">
                          {acc.huggingface_bucket_url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Key className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        <span className="font-semibold uppercase tracking-wider text-[9px]">API Token:</span>
                        <span className="font-mono text-zinc-600 select-all truncate">
                          {acc.huggingface_token.slice(0, 12)}••••••••••••
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Protocols / Extra strings */}
                  <div className="bg-zinc-950 p-2.5 rounded border border-border-custom mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span className="uppercase font-bold tracking-wider text-zinc-400">STORAGE PROTOCOL:</span>
                    <span>{acc.huggingface_storage_url}</span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Unified provisioning form */}
        <div>
          <div className="border border-border-custom bg-card rounded p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Provision Space & Bucket
            </h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Hugging Face Username
                </label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. dorothyschubbe"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Customer Email ID
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. emboss-silk-easily@duck.com"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Hugging Face Space URL
                </label>
                <input
                  type="url"
                  required
                  value={spaceUrl}
                  onChange={(e) => setSpaceUrl(e.target.value)}
                  placeholder="https://huggingface.co/spaces/user/space-name"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Hugging Face Backend Direct URL
                </label>
                <input
                  type="url"
                  required
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://user-space-name.hf.space"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Hugging Face Bucket URL
                </label>
                <input
                  type="url"
                  required
                  value={bucketUrl}
                  onChange={(e) => setBucketUrl(e.target.value)}
                  placeholder="https://huggingface.co/buckets/user/storage-name"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Hugging Face Storage Protocol URL
                </label>
                <input
                  type="text"
                  required
                  value={storageUrl}
                  onChange={(e) => setStorageUrl(e.target.value)}
                  placeholder="hf://buckets/user/storage-name"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Hugging Face Secure API Token
                </label>
                <input
                  type="password"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="hf_••••••••••••••••••••••••"
                  className="w-full bg-black border border-border-custom rounded px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-black text-black hover:text-white border border-white font-bold py-2.5 rounded text-xs uppercase tracking-widest transition-all duration-200 mt-2"
              >
                Provision Package
              </button>
            </form>
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
