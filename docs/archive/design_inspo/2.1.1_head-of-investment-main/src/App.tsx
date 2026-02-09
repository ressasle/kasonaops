import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import TeamOnboarding from "./pages/TeamOnboarding";
import TeamCustomerList from "./pages/TeamCustomerList";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Intelligence from "./pages/Intelligence";
import ExecutiveIntelligence from "./pages/ExecutiveIntelligence";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Team Routes - Admin Only */}
            <Route path="/team" element={<AdminRoute><TeamCustomerList /></AdminRoute>} />
            <Route path="/team/onboarding" element={<AdminRoute><TeamOnboarding /></AdminRoute>} />
            <Route path="/team/onboarding/:customerId" element={<AdminRoute><TeamOnboarding /></AdminRoute>} />
            
            {/* Protected App Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Navigate to="/app/chat" replace />
              </ProtectedRoute>
            } />
            <Route path="/app/chat" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/app/chat/:conversationId" element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            } />
            <Route path="/app/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/app/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/app/intelligence" element={
              <ProtectedRoute>
                <Intelligence />
              </ProtectedRoute>
            } />
            <Route path="/app/executive" element={
              <ProtectedRoute>
                <ExecutiveIntelligence />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
