
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { AppHeader } from "@/components/index/AppHeader";
import { ActionButtons } from "@/components/index/ActionButtons";

const Index = () => {
  const { hasShoeDetails, hasSolePhoto, canSubmit } = useProgressTracking();
  usePWAInstall();

  console.log("Index page render:", { hasShoeDetails, hasSolePhoto, canSubmit });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col">
      <AppHeader />

      <div className="flex-grow flex items-center justify-center p-4 px-[8px] py-[8px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Complete the steps below to submit your shoe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActionButtons 
              hasShoeDetails={hasShoeDetails}
              hasSolePhoto={hasSolePhoto}
              canSubmit={canSubmit}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
