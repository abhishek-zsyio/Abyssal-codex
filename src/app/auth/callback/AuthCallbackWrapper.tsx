"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

const AuthCallbackClient = dynamic(() => import("./AuthCallbackClient"), { ssr: false });

export default function AuthCallbackWrapper() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0a0a]">
        <Loader2 size={48} className="text-[#fabd2f] animate-spin" />
      </div>
    }>
      <AuthCallbackClient />
    </Suspense>
  );
}
