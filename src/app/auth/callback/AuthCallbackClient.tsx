"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/";

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          router.push(next);
          return;
        }
      }
      
      // If no code or error, just go home
      router.push("/");
    }

    handleCallback();
  }, [searchParams, router, supabase]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-[#ebdbb2] font-mono">
      <div className="flex flex-col items-center gap-6">
        <Loader2 size={48} className="text-[#fabd2f] animate-spin" />
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-black uppercase tracking-tighter">Synchronizing_Identity</h1>
          <p className="text-[#928374] text-[10px] uppercase tracking-[0.4em] animate-pulse">Establishing_Neural_Link...</p>
        </div>
      </div>
    </div>
  );
}
