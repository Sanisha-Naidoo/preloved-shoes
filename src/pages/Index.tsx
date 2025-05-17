import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col">
      <header className="py-6 px-4 text-center">
        <div className="mx-auto mb-6 py-[40px]">
          <img src="/lovable-uploads/ba6fcc1a-24b1-4e24-8750-43bdc56bb2fb.png" alt="Reboot Logo" className="h-28 mx-auto object-contain" />
        </div>
        <h1 className="font-bold mb-2 text-4xl">Reboot</h1>
        <p className="text-gray-600">Beta</p>
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Choose how you'd like to register your shoe
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => navigate('/manual-entry')} className="w-full mb-4 h-14">
              Manually Enter Shoe Details
            </Button>
            <Button onClick={() => navigate('/barcode-scan')} className="w-full h-14" variant="secondary">
              Scan Barcode
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Index;