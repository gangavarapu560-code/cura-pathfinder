import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PatientAuth from "./pages/PatientAuth";
import ResearcherAuth from "./pages/ResearcherAuth";
import PatientOnboarding from "./pages/PatientOnboarding";
import PatientDashboard from "./pages/PatientDashboard";
import ResearcherOnboarding from "./pages/ResearcherOnboarding";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import ResearcherProfile from "./pages/ResearcherProfile";
import ForumDiscussion from "./pages/ForumDiscussion";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/patient/auth" element={<PatientAuth />} />
          <Route path="/patient/onboarding" element={<PatientOnboarding />} />
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/researcher/auth" element={<ResearcherAuth />} />
          <Route path="/researcher/onboarding" element={<ResearcherOnboarding />} />
          <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
          <Route path="/researcher/:userId" element={<ResearcherProfile />} />
          <Route path="/forum/:questionId" element={<ForumDiscussion />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
