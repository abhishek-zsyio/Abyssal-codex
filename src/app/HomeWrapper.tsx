"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Feedback";

import { useState, useEffect } from "react";
import { MobileRestriction } from "@/components/home/MobileRestriction";

const HomeClient = dynamic(() => import("./HomeClient"), { ssr: false });

export default function HomeWrapper() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (isMobile) {
    return <MobileRestriction />;
  }

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
