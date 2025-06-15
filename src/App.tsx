
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/submit/ErrorBoundary";
import Index from "./pages/Index";
import ManualEntry from "./pages/ManualEntry";
import PhotoCapture from "./pages/PhotoCapture";
import Rating from "./pages/Rating";
import Submit from "./pages/Submit";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log("App component rendering");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/manual-entry" element={<ManualEntry />} />
              <Route path="/photo-capture" element={<PhotoCapture />} />
              <Route path="/rating" element={<Rating />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/thank-you" element={<ThankYou />} />
              <Route path="*" element={<NotFound />} />
              {/* Removed /auth route */}
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
