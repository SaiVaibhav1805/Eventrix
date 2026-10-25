"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterestsLayout({ children }) {
  const router = useRouter();

  return (
    <div className="pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/explore")}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}
