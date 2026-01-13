import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import '@/i18n';

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import SelectCategory from "./pages/SelectCategory";
import NotFound from "./pages/NotFound";

// Dashboard pages
import SchoolDashboard from "./pages/dashboard/school/SchoolDashboard";
import ChurchDashboard from "./pages/dashboard/church/ChurchDashboard";
import OrganizationDashboard from "./pages/dashboard/organization/OrganizationDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected onboarding routes */}
            <Route path="/welcome" element={
              <ProtectedRoute><Welcome /></ProtectedRoute>
            } />
            <Route path="/select-category" element={
              <ProtectedRoute><SelectCategory /></ProtectedRoute>
            } />

            {/* School Dashboard */}
            <Route path="/dashboard/school" element={
              <ProtectedRoute><DashboardLayout category="school" /></ProtectedRoute>
            }>
              <Route index element={<SchoolDashboard />} />
              <Route path="students" element={<div className="p-4">Students Page - Coming Soon</div>} />
              <Route path="classes" element={<div className="p-4">Classes Page - Coming Soon</div>} />
              <Route path="courses" element={<div className="p-4">Courses Page - Coming Soon</div>} />
              <Route path="grades" element={<div className="p-4">Grades Page - Coming Soon</div>} />
              <Route path="finance" element={<div className="p-4">Finance Page - Coming Soon</div>} />
              <Route path="staff" element={<div className="p-4">Staff Page - Coming Soon</div>} />
              <Route path="attendance" element={<div className="p-4">Attendance Page - Coming Soon</div>} />
              <Route path="events" element={<div className="p-4">Events Page - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-4">Settings Page - Coming Soon</div>} />
            </Route>

            {/* Church Dashboard */}
            <Route path="/dashboard/church" element={
              <ProtectedRoute><DashboardLayout category="church" /></ProtectedRoute>
            }>
              <Route index element={<ChurchDashboard />} />
              <Route path="members" element={<div className="p-4">Members Page - Coming Soon</div>} />
              <Route path="groups" element={<div className="p-4">Groups Page - Coming Soon</div>} />
              <Route path="services" element={<div className="p-4">Services Page - Coming Soon</div>} />
              <Route path="media" element={<div className="p-4">Media Page - Coming Soon</div>} />
              <Route path="finance" element={<div className="p-4">Finance Page - Coming Soon</div>} />
              <Route path="discipleship" element={<div className="p-4">Discipleship Page - Coming Soon</div>} />
              <Route path="visitors" element={<div className="p-4">Visitors Page - Coming Soon</div>} />
              <Route path="events" element={<div className="p-4">Events Page - Coming Soon</div>} />
              <Route path="communication" element={<div className="p-4">Communication Page - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-4">Settings Page - Coming Soon</div>} />
            </Route>

            {/* Organization Dashboard */}
            <Route path="/dashboard/organization" element={
              <ProtectedRoute><DashboardLayout category="organization" /></ProtectedRoute>
            }>
              <Route index element={<OrganizationDashboard />} />
              <Route path="members" element={<div className="p-4">Members Page - Coming Soon</div>} />
              <Route path="projects" element={<div className="p-4">Projects Page - Coming Soon</div>} />
              <Route path="volunteers" element={<div className="p-4">Volunteers Page - Coming Soon</div>} />
              <Route path="finance" element={<div className="p-4">Finance Page - Coming Soon</div>} />
              <Route path="documents" element={<div className="p-4">Documents Page - Coming Soon</div>} />
              <Route path="communication" element={<div className="p-4">Communication Page - Coming Soon</div>} />
              <Route path="events" element={<div className="p-4">Events Page - Coming Soon</div>} />
              <Route path="inventory" element={<div className="p-4">Inventory Page - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-4">Settings Page - Coming Soon</div>} />
            </Route>

            {/* Fallback routes */}
            <Route path="/dashboard" element={<Navigate to="/select-category" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
