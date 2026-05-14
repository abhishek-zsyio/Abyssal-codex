"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Key, Copy, Upload, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { exportVaultKey, importVaultKey, resetVault } from "@/utils/encryption";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityModal({ isOpen, onClose }: SecurityModalProps) {
  const { toast } = useToast();
  const [keyString, setKeyString] = useState<string | null>(null);
  const [importKeyInput, setImportKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadKey();
    }
  }, [isOpen]);

  async function loadKey() {
    try {
      const key = await exportVaultKey();
      setKeyString(key);
    } catch (_e) {
      console.error(_e);
    }
  }

  const handleCopyKey = () => {
    if (keyString) {
      navigator.clipboard.writeText(keyString);
      toast("Key copied to buffer", "success");
    }
  };

  const handleImportKey = async () => {
    if (!importKeyInput) return;
    try {
      await importVaultKey(importKeyInput);
      toast("Vault reconfigured", "success");
      setImportKeyInput("");
      loadKey();
      setTimeout(() => window.location.reload(), 800);
    } catch (_e) {
      toast("Invalid key format", "error");
    }
  };

  const handleResetVault = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetVault();
    toast("Vault wiped & reset", "info");
    setConfirmReset(false);
    loadKey();
    setTimeout(() => window.location.reload(), 800);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden font-mono"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card)]/40">
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} className="text-[var(--primary)]" />
                <div>
                  <h2 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">Security_Protocol</h2>
                  <span className="text-[7px] text-[var(--muted-foreground)] uppercase tracking-[0.2em] block">Vault_Access_Control</span>
                </div>
              </div>
              <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
              {/* Vault Key */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-bold text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                    <Key size={11} className="text-[var(--primary)]" />
                    Master_Key
                  </h3>
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="px-2 py-1 bg-[var(--card)] border border-[var(--border)] text-[8px] hover:text-[var(--primary)] transition-colors"
                    >
                      {showKey ? "Hide" : "Reveal"}
                    </button>
                    <button 
                      onClick={handleCopyKey}
                      className="px-2 py-1 bg-[var(--primary)] text-[var(--background)] border border-[var(--primary)] text-[8px] font-bold hover:brightness-110 transition-all flex items-center gap-1"
                    >
                      <Copy size={9} /> Copy
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <div className={cn(
                    "w-full bg-[var(--card)]/20 border border-[var(--border)] p-4 text-[9px] break-all min-h-[60px] transition-all duration-300",
                    !showKey && "blur-sm select-none opacity-20"
                  )}>
                    {keyString || "SYSTEM_BOOTING…"}
                  </div>
                  {!showKey && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                       <span className="text-[7px] uppercase tracking-widest">Encrypted_View</span>
                    </div>
                  )}
                </div>
                <p className="text-[8px] text-[var(--muted-foreground)] leading-relaxed opacity-60">
                  Key required for decryption. <span className="text-[var(--primary)]">Loss of key results in total data loss.</span>
                </p>
              </div>

              {/* Import */}
              <div className="space-y-3 pt-6 border-t border-[var(--border)]/30">
                <h3 className="text-[9px] font-bold text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2 opacity-60">
                  <Upload size={11} />
                  Restore_Vault
                </h3>
                <div className="flex gap-2">
                  <input 
                    type="password"
                    placeholder="Paste master key here…"
                    value={importKeyInput}
                    onChange={(e) => setImportKeyInput(e.target.value)}
                    className="flex-1 bg-[var(--card)]/20 border border-[var(--border)] p-2 text-[10px] focus:outline-none focus:border-[var(--primary)]/50"
                  />
                  <button 
                    onClick={handleImportKey}
                    className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-[9px] font-bold hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              </div>

              {/* Reset */}
              <div className="pt-6 border-t border-[var(--border)]/30">
                <div className="p-4 bg-[var(--destructive)]/[0.03] border border-[var(--destructive)]/20 space-y-3">
                  <div className="flex items-center gap-2 text-[var(--destructive)]">
                     <AlertTriangle size={12} />
                     <h3 className="text-[9px] font-bold uppercase tracking-widest">Danger_Zone</h3>
                  </div>
                  <p className="text-[8px] text-[var(--muted-foreground)] leading-relaxed opacity-60">
                    Wiping the vault generates a new key. Existing notes will become permanently unreadable.
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleResetVault}
                      className={cn(
                        "flex-1 h-9 text-[9px] font-bold tracking-widest transition-all border",
                        confirmReset 
                          ? "bg-[var(--destructive)] text-white border-[var(--destructive)]" 
                          : "text-[var(--destructive)] border-[var(--destructive)]/30 hover:bg-[var(--destructive)]/5"
                      )}
                    >
                      {confirmReset ? "Confirm Wipe?" : "Wipe_Buffer"}
                    </button>
                    {confirmReset && (
                      <button 
                        onClick={() => setConfirmReset(false)}
                        className="px-4 h-9 border border-[var(--border)] text-[9px] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 h-10 bg-[var(--card)]/10 border-t border-[var(--border)] flex items-center justify-between opacity-50">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-[var(--primary)] rounded-full" />
                <span className="text-[7px] uppercase tracking-[0.2em]">AES_256_GCM</span>
              </div>
              <span className="text-[7px] uppercase tracking-widest">Kernel_ID: 0xAF</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
