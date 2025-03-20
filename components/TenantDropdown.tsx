"use client";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { useUser } from "@/app/context/UserContext";

const TenantDropdown: React.FC = () => {
  const { user, setCurrentTenant } = useUser();

  const handleTenantChange = (index: number) => {
    if (user && user.Tenants && user.Tenants.length > index) {
      setCurrentTenant(user.Tenants[index]);
    }
  };

  // Helper function to remove "TENANT_" prefix
  const stripPrefix = (tenant: string) => tenant.replace(/^TENANT_/, "");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <h3 className="btn cursor-pointer select-none text-white font-bold">
          {user?.CurrentTenant ? user?.CurrentTenant : "Select Tenant"}
        </h3>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 bg-violet-800 text-white">
        <DropdownMenuLabel>Select Tenant</DropdownMenuLabel>
        {user?.Tenants.map((tenant, i) => (
          <DropdownMenuItem key={tenant} onClick={() => handleTenantChange(i)}>
            {stripPrefix(tenant)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TenantDropdown;
