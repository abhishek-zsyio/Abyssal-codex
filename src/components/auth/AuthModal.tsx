"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, LogIn, Mail, Lock, Loader2, ShieldCheck, 
  UserPlus, LogOut, User as UserIcon, Terminal,
  Shield, Fingerprint, Cpu, Key
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { username },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
          }
        });
        if (error) throw error;
        setMessage("Verification link sent to email.");
      }
    } catch (err: any) {
      setError(err.message || "Auth error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm bg-[var(--background)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-[var(--primary)]" />
                <div>
                  <h2 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">
                    {user ? 'Subject_Status' : (isLogin ? 'Login_Sequence' : 'Enroll_Agent')}
                  </h2>
                  <span className="text-[7px] text-[var(--muted-foreground)] uppercase tracking-[0.2em] block">Uplink_Gateway</span>
                </div>
              </div>
              <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {user ? (
                <div className="space-y-6">
                  <div className="p-4 bg-[var(--card)]/20 border border-[var(--border)] relative group">
                    <span className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest block mb-3">Identity_Confirmed</span>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-[var(--primary)]/5 border border-[var(--primary)]/20 flex items-center justify-center shrink-0">
                         <Fingerprint size={20} className="text-[var(--primary)]" />
                       </div>
                       <div className="min-w-0">
                         <div className="text-[12px] font-bold text-[var(--foreground)] truncate uppercase tracking-tight">
                           {user.user_metadata?.username || 'ANONYMOUS'}
                         </div>
                         <div className="text-[9px] font-mono text-[var(--muted-foreground)] opacity-60 truncate">
                           {user.email}
                         </div>
                       </div>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full h-11 border-2 border-[var(--destructive)]/50 text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                    Terminate_Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-[var(--destructive)]/5 border border-[var(--destructive)]/20 text-[var(--destructive)] text-[9px] font-bold uppercase tracking-wider">
                      Error // {error}
                    </div>
                  )}

                  {message && (
                    <div className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/20 text-[var(--primary)] text-[9px] font-bold uppercase tracking-wider">
                      System // {message}
                    </div>
                  )}

                  <div className="space-y-3">
                    {!isLogin && (
                      <div className="space-y-1">
                        <label className="text-[7px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] ml-1">Codename</label>
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-[var(--card)]/20 border border-[var(--border)] focus:border-[var(--primary)]/50 outline-none px-3 py-2.5 text-[11px] placeholder:text-[var(--muted-foreground)]/20"
                          placeholder="OPERATOR_X"
                        />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[7px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] ml-1">Identity_Link</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[var(--card)]/20 border border-[var(--border)] focus:border-[var(--primary)]/50 outline-none px-3 py-2.5 text-[11px] placeholder:text-[var(--muted-foreground)]/20"
                        placeholder="email@abyssal.dev"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[7px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] ml-1">Access_Token</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[var(--card)]/20 border border-[var(--border)] focus:border-[var(--primary)]/50 outline-none px-3 py-2.5 text-[11px] placeholder:text-[var(--muted-foreground)]/20"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-[var(--primary)] text-black font-bold text-[10px] uppercase tracking-widest hover:brightness-110 active:translate-y-px transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : (isLogin ? <LogIn size={16} /> : <UserPlus size={16} />)}
                      {isLogin ? 'Execute_Login' : 'Begin_Enrollment'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsLogin(!isLogin)}
                      className="w-full text-[8px] uppercase tracking-[0.3em] text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all pt-2"
                    >
                      {isLogin ? "[ Request_New_Identity ]" : "[ Access_Existing_Vault ]"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 h-10 bg-[var(--card)]/10 border-t border-[var(--border)] flex items-center justify-between opacity-50">
              <div className="flex items-center gap-2">
                <Cpu size={10} className="text-[var(--primary)]" />
                <span className="text-[7px] uppercase tracking-widest">Secured_Uplink</span>
              </div>
              <div className="flex items-center gap-2">
                <Key size={10} />
                <span className="text-[7px] uppercase tracking-widest">TLS_1.3</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
