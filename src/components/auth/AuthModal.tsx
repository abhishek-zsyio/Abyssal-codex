"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, LogIn, Mail, Lock, Loader2, ShieldCheck, 
  UserPlus, LogOut, User as UserIcon, Terminal,
  Shield, Fingerprint
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
        setMessage("Check your email for the confirmation link.");
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[300] bg-black/85 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[301] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="pointer-events-auto w-full max-w-md bg-[var(--background)] border border-[var(--border)] shadow-[20px_20px_0px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden relative"
            >
              {/* Corner brackets - Minimalist version */}
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[var(--primary)]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[var(--primary)]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[var(--primary)]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[var(--primary)]" />

              {/* Header */}
              <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/30">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-[var(--primary)]" />
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em] font-bold">
                      Auth_Gateway
                    </span>
                  </div>
                  <h2 className="text-xl font-bold font-mono text-[var(--foreground)] uppercase tracking-widest overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={user ? 'vault' : (isLogin ? 'login' : 'register')}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="block"
                      >
                        {user ? 'Vault_Status' : (isLogin ? 'Login_Sequence' : 'Register_Agent')}
                      </motion.span>
                    </AnimatePresence>
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors border border-transparent hover:border-[var(--primary)]/20"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8">
                {user ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="p-6 bg-[var(--card)] border border-[var(--border)] relative group">
                      <div className="absolute -top-px -left-px w-1 h-4 bg-[var(--primary)]" />
                      <span className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest block mb-2">Subject_Identity</span>
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-[var(--primary)]/5 border border-[var(--primary)]/20 flex items-center justify-center">
                           <Fingerprint size={20} className="text-[var(--primary)]" />
                         </div>
                         <div className="flex-1 overflow-hidden">
                           <div className="text-sm font-mono font-bold text-[var(--foreground)] truncate">
                             {user.user_metadata?.username || 'ANONYMOUS'}
                           </div>
                           <div className="text-[10px] font-mono text-[var(--muted-foreground)] opacity-60">
                             {user.email}
                           </div>
                         </div>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      disabled={loading}
                      className="w-full relative group flex items-center justify-center gap-2 border-2 border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-white font-bold font-mono py-3.5 uppercase tracking-[0.2em] transition-all"
                    >
                      {loading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          <LogOut size={18} />
                          <span>Terminate_Session</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider overflow-hidden"
                        >
                          [ERROR] {">>"} {error}
                        </motion.div>
                      )}

                      {message && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          className="p-3 bg-[var(--primary)]/5 border border-[var(--primary)]/30 text-[var(--primary)] text-[10px] font-mono font-bold uppercase tracking-wider overflow-hidden"
                        >
                          [SYSTEM] {">>"} {message}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div layout className="space-y-4">
                      <AnimatePresence mode="popLayout">
                        {!isLogin && (
                          <motion.div 
                            key="username-field"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-1"
                          >
                            <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] ml-1">
                              Agent_Codename
                            </label>
                            <input
                              type="text"
                              required
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="w-full bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] outline-none px-4 py-3 font-mono text-sm transition-all placeholder:text-[var(--muted-foreground)]/30"
                              placeholder="OPERATOR_01"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] ml-1">
                          Email_Identity
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] outline-none px-4 py-3 font-mono text-sm transition-all placeholder:text-[var(--muted-foreground)]/30"
                          placeholder="user@abyssal.net"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase tracking-[0.2em] text-[var(--muted-foreground)] ml-1">
                          Security_Token
                        </label>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[var(--card)] border border-[var(--border)] focus:border-[var(--primary)] outline-none px-4 py-3 font-mono text-sm transition-all placeholder:text-[var(--muted-foreground)]/30"
                          placeholder="••••••••"
                        />
                      </div>
                    </motion.div>

                    <div className="space-y-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full group relative flex items-center justify-center gap-2 bg-[var(--primary)] text-black font-bold font-mono py-4 uppercase tracking-[0.3em] transition-all hover:bg-[var(--primary)]/90 active:translate-y-px overflow-hidden"
                      >
                        <motion.div
                          key={isLogin ? 'login' : 'register'}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <>
                              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                              <span>{isLogin ? 'Initialize' : 'Register'}</span>
                            </>
                          )}
                        </motion.div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="w-full text-[9px] font-mono uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-all text-center pt-2"
                      >
                        <motion.span
                          key={isLogin ? 'req-new' : 'acc-ext'}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {isLogin ? "[ Request_New_Identity ]" : "[ Access_Existing_Vault ]"}
                        </motion.span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Minimal Footer */}
              <div className="px-8 py-4 bg-[var(--card)]/20 border-t border-[var(--border)] flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                    <span className="text-[8px] font-mono tracking-widest">UPLINK_STABLE</span>
                  </div>
                </div>
                <div className="text-[8px] font-mono tracking-widest flex items-center gap-2">
                  <ShieldCheck size={10} />
                  <span>v2.5 // GATEWAY</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
