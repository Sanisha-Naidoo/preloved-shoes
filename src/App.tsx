
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/lib/supabase";
import Index from "./pages/Index";
import ManualEntry from "./pages/ManualEntry";
import BarcodeScan from "./pages/BarcodeScan";
import PhotoCapture from "./pages/PhotoCapture";
import Rating from "./pages/Rating";
import Submit from "./pages/Submit";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Check if Supabase is configured and show a warning if not
    if (!isSupabaseConfigured()) {
      toast.warning(
        "Supabase is not configured. Please connect your Lovable Project to Supabase.",
        {
          duration: 10000,
        }
      );
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manual-entry" element={<ManualEntry />} />
            <Route path="/barcode-scan" element={<BarcodeScan />} />
            <Route path="/photo-capture" element={<PhotoCapture />} />
            <Route path="/rating" element={<Rating />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
