// app/Providers.tsx
"use client";

import React from "react";
import { UserManagementProvider } from "./context/UserManagementContext";
import { UserProvider } from "./context/UserContext";
import { UserGroupProvider } from "./context/UserGroupContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/navbar/Navbar";
import { ToastContextProvider } from "./context/DataContext";
import { WorkflowProvider } from "./context/WorkflowContext";
import { SchemaProvider } from "./context/SchemaContext";
import { RequestProvider } from "./context/DataContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SideBar } from "@/components/SideBar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserManagementProvider>
      <UserProvider>
        <UserGroupProvider>
          <ProtectedRoute>
            <Navbar />
            <ToastContextProvider>
              <SidebarProvider>
                <SideBar />
                <SidebarTrigger />
                <WorkflowProvider>
                  <SchemaProvider>
                    <RequestProvider>{children}</RequestProvider>
                  </SchemaProvider>
                </WorkflowProvider>
              </SidebarProvider>
            </ToastContextProvider>
          </ProtectedRoute>
        </UserGroupProvider>
      </UserProvider>
    </UserManagementProvider>
  );
}
