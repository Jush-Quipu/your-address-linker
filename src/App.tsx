
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Verify from "@/pages/Verify";
import Connect from "@/pages/Connect";
import Dashboard from "@/pages/Dashboard";
import DeveloperDocs from "@/pages/DeveloperDocs";
import DeveloperPortal from "@/pages/DeveloperPortal";
import Permissions from "@/pages/Permissions";
import AuthorizePage from "@/pages/AuthorizePage";
import BlindShipping from "@/pages/BlindShipping";
import MyShipments from "@/pages/MyShipments";
import CreateShipment from "@/pages/CreateShipment";
import NotFound from "@/pages/NotFound";
import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs" element={<DeveloperDocs />} />
          <Route path="/developer" element={<DeveloperPortal />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/authorize" element={<AuthorizePage />} />
          <Route path="/blind-shipping" element={<BlindShipping />} />
          <Route path="/my-shipments" element={<MyShipments />} />
          <Route path="/create-shipment" element={<CreateShipment />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
