import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/layout/DashboardLayout";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import SelectCategory from "./pages/SelectCategory";
import NotFound from "./pages/NotFound";

// Dashboard pages
import SchoolDashboard from "./pages/dashboard/school/SchoolDashboard";
import ChurchDashboard from "./pages/dashboard/church/ChurchDashboard";
import OrganizationDashboard from "./pages/dashboard/organization/OrganizationDashboard";
import MembersPage from "./pages/dashboard/MembersPage";
import FinancePage from "./pages/dashboard/FinancePage";

// School specific pages
import ClassesPage from "./pages/dashboard/ClassesPage";
import CoursesPage from "./pages/dashboard/CoursesPage";
import GradesPage from "./pages/dashboard/GradesPage";
import StaffPage from "./pages/dashboard/StaffPage";

// Church specific pages
import GroupsPage from "./pages/dashboard/GroupsPage";
import ServicesPage from "./pages/dashboard/ServicesPage";
import MediaPage from "./pages/dashboard/MediaPage";
import DiscipleshipPage from "./pages/dashboard/DiscipleshipPage";
import VisitorsPage from "./pages/dashboard/VisitorsPage";

// Organization specific pages
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import VolunteersPage from "./pages/dashboard/VolunteersPage";
import DocumentsPage from "./pages/dashboard/DocumentsPage";
import InventoryPage from "./pages/dashboard/InventoryPage";

// Shared pages
import AttendancePage from "./pages/dashboard/AttendancePage";
import EventsPage from "./pages/dashboard/EventsPage";
import CommunicationPage from "./pages/dashboard/CommunicationPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

// Create a stable QueryClient instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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

            <Route path="/dashboard/school" element={
              <ProtectedRoute><DashboardLayout category="school" /></ProtectedRoute>
            }>
              <Route index element={<SchoolDashboard />} />
              <Route path="students" element={<MembersPage category="school" />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="grades" element={<GradesPage />} />
              <Route path="finance" element={<FinancePage category="school" />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="events" element={<EventsPage category="school" />} />
              <Route path="settings" element={<SettingsPage category="school" />} />
            </Route>

            {/* Church Dashboard */}
            <Route path="/dashboard/church" element={
              <ProtectedRoute><DashboardLayout category="church" /></ProtectedRoute>
            }>
              <Route index element={<ChurchDashboard />} />
              <Route path="members" element={<MembersPage category="church" />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="media" element={<MediaPage />} />
              <Route path="finance" element={<FinancePage category="church" />} />
              <Route path="discipleship" element={<DiscipleshipPage />} />
              <Route path="visitors" element={<VisitorsPage />} />
              <Route path="events" element={<EventsPage category="church" />} />
              <Route path="communication" element={<CommunicationPage category="church" />} />
              <Route path="settings" element={<SettingsPage category="church" />} />
            </Route>

            {/* Organization Dashboard */}
            <Route path="/dashboard/organization" element={
              <ProtectedRoute><DashboardLayout category="organization" /></ProtectedRoute>
            }>
              <Route index element={<OrganizationDashboard />} />
              <Route path="members" element={<MembersPage category="organization" />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="volunteers" element={<VolunteersPage />} />
              <Route path="finance" element={<FinancePage category="organization" />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="communication" element={<CommunicationPage category="organization" />} />
              <Route path="events" element={<EventsPage category="organization" />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="settings" element={<SettingsPage category="organization" />} />
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
