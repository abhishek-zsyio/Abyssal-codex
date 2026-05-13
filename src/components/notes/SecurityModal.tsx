"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Key, Copy, Download, Upload, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { exportVaultKey, importVaultKey, resetVault } from "@/utils/encryption";
import { Button } from "@/components/ui/Button";

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
    } catch (e) {
      console.error(e);
    }
  }

  const handleCopyKey = () => {
    if (keyString) {
      navigator.clipboard.writeText(keyString);
      toast("KEY_COPIED: [SECURE_BUFFER_FILLED]", "system");
    }
  };

  const handleImportKey = async () => {
    if (!importKeyInput) return;
    try {
      await importVaultKey(importKeyInput);
      toast("KEY_REPLACED: [VAULT_RECONFIGURED]", "system");
      setImportKeyInput("");
      loadKey();
      setTimeout(() => window.location.reload(), 1000); // Reload to apply new key
    } catch (e) {
      toast("IMPORT_FAILED: [INVALID_KEY_FORMAT]", "system");
    }
  };

  const handleResetVault = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    await resetVault();
    toast("VAULT_WIPED: [NEW_KEY_GENERATED]", "system");
    setConfirmReset(false);
    loadKey();
    setTimeout(() => window.location.reload(), 1000);
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-[201] flex items-center justify-center p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto w-full max-w-2xl bg-[var(--background)] border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-dotted border-[var(--border)] flex items-center justify-between bg-[var(--card)]/30">
                <div>
                  <span className="text-[8px] font-mono text-[var(--primary)] uppercase tracking-[0.4em] block mb-1">
                    SECURITY_KERNEL // VAULT_ACCESS
                  </span>
                  <h2 className="text-xl font-bold font-mono text-[var(--foreground)] uppercase tracking-widest flex items-center gap-3">
                    <ShieldAlert size={20} className="text-[var(--primary)]" />
                    Security_Protocol
                  </h2>
                </div>
                <button onClick={onClose} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                {/* Vault Key Display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                      <Key size={12} className="text-[var(--primary)]" />
                      Master_Encryption_Key
                    </h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)} className="h-7 text-[8px] px-2">
                        {showKey ? "HIDE_KEY" : "SHOW_KEY"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCopyKey} className="h-7 text-[8px] px-2">
                        <Copy size={10} className="mr-1" /> COPY
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className={cn(
                      "w-full bg-[var(--card)]/20 border border-[var(--border)] p-4 font-mono text-[10px] break-all min-h-[80px] transition-all duration-500",
                      !showKey && "blur-md select-none opacity-20"
                    )}>
                      {keyString || "INITIALIZING_VAULT..."}
                    </div>
                    {!showKey && (
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-[0.3em]">ENCRYPTED_VIEW</span>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase leading-relaxed opacity-60">
                    This key is stored locally in your browser. It is required to decrypt your notes. 
                    <span className="text-[var(--primary)]"> If you lose this key, your notes are lost forever.</span>
                  </p>
                </div>

                {/* Import Key */}
                <div className="space-y-4 pt-6 border-t border-dotted border-[var(--border)]">
                  <h3 className="text-[10px] font-mono font-bold text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
                    <Upload size={12} className="text-[var(--primary)]" />
                    Import_Existing_Key
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="password"
                      placeholder="PASTE_JWK_HERE..."
                      value={importKeyInput}
                      onChange={(e) => setImportKeyInput(e.target.value)}
                      className="flex-1 bg-[var(--card)]/20 border border-[var(--border)] p-2 font-mono text-[10px] focus:outline-none focus:border-[var(--primary)]/50"
                    />
                    <Button onClick={handleImportKey} className="rounded-none h-10 px-4">IMPORT</Button>
                  </div>
                </div>

                {/* Reset Vault */}
                <div className="space-y-4 pt-6 border-t border-dotted border-[var(--border)]">
                  <div className="p-4 bg-[var(--destructive)]/5 border border-[var(--destructive)]/20 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-[var(--destructive)]">
                       <AlertTriangle size={14} />
                       <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest">DANGER_ZONE</h3>
                    </div>
                    <p className="text-[9px] font-mono text-[var(--muted-foreground)] uppercase leading-relaxed">
                      Generating a new key will make all currently stored notes unreadable. 
                      Only do this if you want to start fresh and wipe all existing data.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleResetVault}
                      className={cn(
                        "w-full h-10 text-[10px] font-mono tracking-widest rounded-none",
                        confirmReset && "animate-pulse"
                      )}
                    >
                      {confirmReset ? "CONFIRM_DESTRUCTION?" : "GENERATE_NEW_VAULT_KEY"}
                    </Button>
                    {confirmReset && (
                      <Button variant="outline" onClick={() => setConfirmReset(false)} className="w-full h-8 text-[8px] font-mono rounded-none">CANCEL</Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-4 bg-[var(--card)]/50 border-t border-dotted border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[var(--primary)] rotate-45" />
                  <span className="text-[8px] font-mono text-[var(--muted-foreground)] uppercase tracking-widest">
                    AES-256-GCM // ZERO_KNOWLEDGE_ACTIVE
                  </span>
                </div>
                <div className="text-[7px] font-mono text-[var(--muted-foreground)] uppercase opacity-40">
                  Securing technical documentation since 0x00
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
