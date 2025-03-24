
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
import Tutorials from "@/pages/Tutorials";
import EcommerceIntegration from "@/pages/tutorials/EcommerceIntegration";
import Web3WalletLinking from "@/pages/tutorials/Web3WalletLinking";
import WebhookIntegration from "@/pages/tutorials/WebhookIntegration";
import ZkProofs from "@/pages/tutorials/ZkProofs";

// New pages
import Features from "@/pages/Features";
import Security from "@/pages/Security";
import Pricing from "@/pages/Pricing";
import Integrations from "@/pages/Integrations";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Careers from "@/pages/Careers";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Compliance from "@/pages/Compliance";
import Cookies from "@/pages/Cookies";

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
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorials/ecommerce-integration" element={<EcommerceIntegration />} />
          <Route path="/tutorials/web3-wallet-linking" element={<Web3WalletLinking />} />
          <Route path="/tutorials/webhook-integration" element={<WebhookIntegration />} />
          <Route path="/tutorials/zk-proofs" element={<ZkProofs />} />
          
          {/* New routes for footer links */}
          <Route path="/features" element={<Features />} />
          <Route path="/security" element={<Security />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/cookies" element={<Cookies />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
