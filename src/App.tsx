
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/submit/ErrorBoundary";
import Index from "./pages/Index";
import ManualEntry from "./pages/ManualEntry";
import PhotoCapture from "./pages/PhotoCapture";
import Rating from "./pages/Rating";
import OptionalBarcodeScan from "./pages/OptionalBarcodeScan";
import Submit from "./pages/Submit";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/manual-entry" element={<ManualEntry />} />
              <Route path="/photo-capture" element={<PhotoCapture />} />
              <Route path="/rating" element={<Rating />} />
              <Route path="/optional-barcode-scan" element={<OptionalBarcodeScan />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
