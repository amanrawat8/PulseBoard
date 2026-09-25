import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
