
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Connect from "./pages/Connect";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Permissions from "./pages/Permissions";
import NotFound from "./pages/NotFound";
import DeveloperDocs from "./pages/DeveloperDocs";
import DeveloperPortal from "./pages/DeveloperPortal";
import AuthorizePage from "./pages/AuthorizePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/developer-docs" element={<DeveloperDocs />} />
            <Route path="/developer" element={<DeveloperPortal />} />
            <Route path="/authorize" element={<AuthorizePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
