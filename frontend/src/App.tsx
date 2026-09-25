import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth-context";
import { SocketProvider } from "@/context/socket-context";
import { useTheme, ThemeProvider } from "@/hooks/use-theme";
import { queryClient } from "@/lib/query-client";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { ProjectDetailPage } from "@/pages/project-detail-page";
import { ProjectsPage } from "@/pages/projects-page";
import { TasksPage } from "@/pages/tasks-page";
import { ProtectedRoute } from "@/routes/protected-route";

function ThemedToaster() {
  useTheme();
  return <Toaster />;
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/tasks" element={<TasksPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
            <ThemedToaster />
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
