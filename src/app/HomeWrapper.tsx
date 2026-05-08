"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Feedback";

const HomeClient = dynamic(() => import("./HomeClient"), { ssr: false });

export default function HomeWrapper() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
        <Spinner className="w-12 h-12" />
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}
