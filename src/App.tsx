import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
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
import TasksPage from "./pages/dashboard/TasksPage";
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

            {/* School Dashboard */}
            <Route path="/dashboard/school" element={
              <ProtectedRoute><DashboardLayout category="school" /></ProtectedRoute>
            }>
              <Route index element={<SchoolDashboard />} />
              {/* Élèves */}
              <Route path="students" element={<MembersPage category="school" />} />
              <Route path="students/new" element={<MembersPage category="school" />} />
              <Route path="students/attendance" element={<AttendancePage />} />
              {/* Classes & Cours */}
              <Route path="classes" element={<ClassesPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="grades" element={<GradesPage />} />
              {/* Personnel */}
              <Route path="staff" element={<StaffPage />} />
              <Route path="staff/teachers" element={<StaffPage />} />
              <Route path="staff/schedule" element={<StaffPage />} />
              {/* Finance */}
              <Route path="finance" element={<FinancePage category="school" />} />
              <Route path="finance/tuition" element={<FinancePage category="school" />} />
              <Route path="finance/payments" element={<FinancePage category="school" />} />
              <Route path="finance/reports" element={<FinancePage category="school" />} />
              {/* Autres */}
              <Route path="tasks" element={<TasksPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="events" element={<EventsPage category="school" />} />
              <Route path="communication" element={<CommunicationPage category="school" />} />
              <Route path="settings" element={<SettingsPage category="school" />} />
            </Route>

            {/* Church Dashboard */}
            <Route path="/dashboard/church" element={
              <ProtectedRoute><DashboardLayout category="church" /></ProtectedRoute>
            }>
              <Route index element={<ChurchDashboard />} />
              {/* Membres */}
              <Route path="members" element={<MembersPage category="church" />} />
              <Route path="members/new" element={<MembersPage category="church" />} />
              <Route path="visitors" element={<VisitorsPage />} />
              {/* Groupes & Départements */}
              <Route path="groups" element={<GroupsPage />} />
              <Route path="groups/departments" element={<GroupsPage />} />
              <Route path="groups/ministries" element={<GroupsPage />} />
              {/* Services & Cultes */}
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/teams" element={<ServicesPage />} />
              <Route path="services/attendance" element={<AttendancePage />} />
              {/* Dons & Finances */}
              <Route path="finance" element={<FinancePage category="church" />} />
              <Route path="finance/donations" element={<FinancePage category="church" />} />
              <Route path="finance/tithes" element={<FinancePage category="church" />} />
              <Route path="finance/expenses" element={<FinancePage category="church" />} />
              <Route path="finance/reports" element={<FinancePage category="church" />} />
              {/* Média & Streaming */}
              <Route path="media" element={<MediaPage />} />
              <Route path="media/sermons" element={<MediaPage />} />
              <Route path="media/worship" element={<MediaPage />} />
              <Route path="media/gallery" element={<MediaPage />} />
              <Route path="media/livestream" element={<MediaPage />} />
              {/* Autres */}
              <Route path="discipleship" element={<DiscipleshipPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="events" element={<EventsPage category="church" />} />
              <Route path="communication" element={<CommunicationPage category="church" />} />
              <Route path="settings" element={<SettingsPage category="church" />} />
            </Route>

            {/* Organization Dashboard */}
            <Route path="/dashboard/organization" element={
              <ProtectedRoute><DashboardLayout category="organization" /></ProtectedRoute>
            }>
              <Route index element={<OrganizationDashboard />} />
              {/* Membres */}
              <Route path="members" element={<MembersPage category="organization" />} />
              <Route path="members/new" element={<MembersPage category="organization" />} />
              <Route path="volunteers" element={<VolunteersPage />} />
              {/* Projets */}
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/new" element={<ProjectsPage />} />
              <Route path="projects/active" element={<ProjectsPage />} />
              {/* Finance */}
              <Route path="finance" element={<FinancePage category="organization" />} />
              <Route path="finance/income" element={<FinancePage category="organization" />} />
              <Route path="finance/expenses" element={<FinancePage category="organization" />} />
              <Route path="finance/reports" element={<FinancePage category="organization" />} />
              {/* Documents */}
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="documents/templates" element={<DocumentsPage />} />
              {/* Autres */}
              <Route path="tasks" element={<TasksPage />} />
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
