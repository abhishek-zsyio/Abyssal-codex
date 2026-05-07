"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Shield, Globe, Terminal, Cpu, ExternalLink, Hash, Activity, Lock, Database } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";


export default function SharedNoteClient({ params }: { params: { id: string } }) {
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error || !data || !data.is_public) {
          setError("DATA_SEGMENT_NOT_FOUND");
        } else {
          setNote(data);
        }
      } catch (err) {
        setError("CONNECTION_INTERRUPTED");
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [params.id]);

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-6">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-[#fabd2f]/20 border-t-[#fabd2f] rounded-full"
          />
          <div className="flex flex-col items-center">
            <span className="text-[#fabd2f] text-[10px] tracking-[0.4em] uppercase animate-pulse">Initializing_Handshake</span>
            <span className="text-[#928374] text-[8px] tracking-[0.2em] mt-2 font-mono">SECURE_LINK_V4.0.1</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-mono p-8 text-center">
        <div className="w-16 h-16 border border-[#fb4934]/30 flex items-center justify-center mb-8">
          <Lock size={32} className="text-[#fb4934]" />
        </div>
        <h1 className="text-[#fb4934] text-xl font-bold tracking-[0.3em] uppercase mb-4">Access_Denied</h1>
        <p className="text-[#928374] text-xs uppercase tracking-widest mb-12 max-w-xs">
          The requested data segment is either private, corrupted, or does not exist in the codex.
        </p>
        <Link 
          href="/" 
          className="px-8 py-3 border border-[#fabd2f] text-[#fabd2f] text-[10px] uppercase tracking-[0.3em] hover:bg-[#fabd2f] hover:text-[#0a0a0a] transition-all"
        >
          Return_To_Core
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ebdbb2] selection:bg-[#fabd2f] selection:text-[#1d2021] font-sans overflow-x-hidden custom-scrollbar relative">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04]" 
           style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Scanning Line */}
      <motion.div 
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="fixed left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#fabd2f]/20 to-transparent z-[100] pointer-events-none"
      />

      {/* Side HUD Info (Left) */}
      <div className="fixed left-6 bottom-24 hidden xl:flex flex-col gap-8 pointer-events-none z-50">
        <div className="flex flex-col gap-2">
          <span className="text-[7px] font-mono text-[#928374] uppercase tracking-[0.4em]">Signal_Strength</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={`h-3 w-1 ${i <= 4 ? "bg-[#fabd2f]" : "bg-[#282828]"}`} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[7px] font-mono text-[#928374] uppercase tracking-[0.4em]">Encryption</span>
          <span className="text-[9px] font-mono text-[#ebdbb2]">AES-256-CODEX</span>
        </div>
      </div>

      {/* Side HUD Info (Right) */}
      <div className="fixed right-6 bottom-24 hidden xl:flex flex-col gap-8 items-end pointer-events-none z-50">
        <div className="flex flex-col items-end gap-2">
          <span className="text-[7px] font-mono text-[#928374] uppercase tracking-[0.4em]">Data_Sector</span>
          <span className="text-[9px] font-mono text-[#ebdbb2]">SEC_{note.id.split('-')[0].toUpperCase()}</span>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-[7px] font-mono text-[#928374] uppercase tracking-[0.4em]">Temporal_Sync</span>
          <span className="text-[9px] font-mono text-[#ebdbb2] uppercase">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Header HUD */}
      <header className="sticky top-0 z-50 border-b border-[#282828] bg-[#0a0a0a]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 bg-[#fabd2f] flex items-center justify-center rounded-sm relative group cursor-pointer"
          >
            <div className="absolute inset-0 border border-[#fabd2f] animate-ping opacity-20 group-hover:opacity-40" />
            <Terminal size={20} className="text-[#0a0a0a]" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#fabd2f] uppercase tracking-[0.25em] font-bold">Public_Fragment</span>
              <div className="h-1.5 w-1.5 rounded-full bg-[#fabd2f] animate-pulse shadow-[0_0_8px_#fabd2f]" />
            </div>
            <h1 className="text-xs font-mono text-[#928374] uppercase tracking-wider truncate max-w-[150px] md:max-w-none">
              ID_{note.id.split('-')[0]} // SECURE_ACCESS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={10} className="text-[#b8bb26]" />
              <span className="text-[8px] font-mono text-[#928374] uppercase tracking-widest">Connection_Live</span>
            </div>
            <span className="text-[10px] font-mono text-[#ebdbb2] opacity-80 uppercase tracking-tighter">ABYSSAL_NETWORK_V1</span>
          </div>
          <Link 
            href="/"
            className="group relative flex items-center gap-3 px-5 py-2.5 bg-[#fabd2f]/5 border border-[#fabd2f]/20 hover:border-[#fabd2f]/60 transition-all text-[#fabd2f] text-[10px] font-mono uppercase tracking-[0.2em] rounded-sm overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#fabd2f] translate-y-full group-hover:translate-y-0 transition-transform duration-300 -z-10" />
            <span className="group-hover:text-[#0a0a0a] transition-colors">Launch_Core_Codex</span>
            <ExternalLink size={12} className="group-hover:text-[#0a0a0a] transition-colors" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-24 relative">
        {/* Decorative Grid Corners */}
        <div className="absolute top-10 left-4 w-4 h-4 border-l border-t border-[#fabd2f]/30" />
        <div className="absolute top-10 right-4 w-4 h-4 border-r border-t border-[#fabd2f]/30" />
        <div className="absolute bottom-10 left-4 w-4 h-4 border-l border-b border-[#fabd2f]/30" />
        <div className="absolute bottom-10 right-4 w-4 h-4 border-r border-b border-[#fabd2f]/30" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 border border-[#fabd2f]/20 bg-[#fabd2f]/5">
              <Database size={16} className="text-[#fabd2f]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-[#928374] uppercase tracking-[0.4em]">Fragment_Metadata</span>
              <div className="h-[1px] w-full bg-[#fabd2f]/20 mt-1" />
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#ebdbb2] mb-8 leading-[0.9]">
            {note.title?.toUpperCase() || "UNTITLED_STREAM"}
            <span className="text-[#fabd2f] block mt-2 opacity-50">_</span>
          </h1>

          <div className="flex flex-wrap gap-4">
            <div className="px-4 py-2 border border-[#282828] bg-[#111] text-[10px] font-mono text-[#928374] uppercase tracking-[0.2em] flex items-center gap-2">
              <Hash size={12} className="text-[#fabd2f]" />
              {note.id.split('-')[0]}
            </div>
            <div className="px-4 py-2 border border-[#282828] bg-[#111] text-[10px] font-mono text-[#928374] uppercase tracking-[0.2em]">
              MODIFIED_{new Date(note.updated_at).toLocaleDateString()}
            </div>
            {note.tags?.map((tag: string) => (
              <div key={tag} className="px-4 py-2 border border-[#fabd2f]/30 bg-[#fabd2f]/5 text-[10px] font-mono text-[#fabd2f] uppercase tracking-[0.2em] font-bold">
                #{tag}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.article 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-gruvbox max-w-none prose-pre:bg-[#111] prose-pre:border-[#282828] prose-code:text-[#fe8019]"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.content}
          </ReactMarkdown>
        </motion.article>

        <footer className="mt-40 pb-20 border-t border-[#282828] flex flex-col items-center">
          <div className="flex items-center gap-6 mt-16 mb-12">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-[#282828]" />
            <Shield size={20} className="text-[#fabd2f] opacity-50" />
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-[#282828]" />
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-[11px] font-mono text-[#928374] uppercase tracking-[0.5em]">
              END_OF_FRAGMENT
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-[9px] font-mono text-[#504945] tracking-widest uppercase">
                Secure_Handshake_Completed // Origin: Abyssal_Node_0x1
              </p>
              <p className="text-[9px] font-mono text-[#3c3836] tracking-tighter uppercase">
                Checksum: {Math.random().toString(16).substring(2, 10).toUpperCase()}
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* CRT Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1000] opacity-[0.03] scanline" />

      {/* Global CSS for Markdown in Fragment */}
      <style dangerouslySetInnerHTML={{ __html: `
        .prose h1, .prose h2, .prose h3, .prose h4 { color: #fabd2f; font-family: var(--font-mono), monospace; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; margin-top: 3rem; }
        .prose h1 { font-size: 2.5rem; }
        .prose p { color: #ebdbb2; line-height: 2; margin-bottom: 2rem; font-size: 1.1rem; text-align: justify; }
        .prose code { color: #fe8019; background: #181818; padding: 0.2em 0.5em; border-radius: 0px; font-size: 0.9em; border: 1px solid #282828; }
        .prose pre { background: #0a0a0a !important; border: 1px solid #282828; border-radius: 0px; padding: 2rem !important; margin: 3rem 0; }
        .prose blockquote { border-left: 2px solid #fabd2f; background: #111; padding: 2rem; font-style: normal; color: #d5c4a1; position: relative; }
        .prose blockquote::before { content: "DATA_LOG"; position: absolute; top: 0; left: 0; font-size: 8px; background: #fabd2f; color: #0a0a0a; padding: 2px 6px; font-weight: bold; }
        .prose a { color: #b8bb26; text-decoration: none; border-bottom: 1px dashed #b8bb26; transition: all 0.2s; }
        .prose a:hover { color: #fabd2f; border-bottom-style: solid; text-shadow: 0 0 10px #fabd2f; }
        .prose ul li::marker { color: #fabd2f; content: "→ "; }
        .prose ul li { padding-left: 0.5rem; margin-bottom: 1rem; }
        .prose img { border: 1px solid #282828; padding: 4px; background: #111; margin: 4rem 0; }
      `}} />
    </div>
  );
}
