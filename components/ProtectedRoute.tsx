"use client";

import React, { ReactNode, useEffect } from "react";
import { useUser } from "@/app/context/UserContext"; // Ensure this path is correct
import PublicLanding from "@/app/pages/PublicLanding";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useUser();

  if (!user || !user.Roles.includes("CHS_PORTAL_ACCESS")) {
    return <PublicLanding />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
