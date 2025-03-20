"use client";

import { useUser } from "@/app/context/UserContext";
import { Button } from "@/components/ui/button";
import TenantDropdown from "../TenantDropdown";
import { useRouter } from "next/compat/router";
import { LogOut } from "lucide-react"; // Import a logout icon

function Navbar() {
  const { user, setUser } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    setUser(null); // Clear the user on logout
    router?.push("/"); // Redirect to the public landing page
  };

  if (!user) return null;

  return (
    <div className="absolute top-4 right-4 flex items-center space-x-4 z-50 text-white">
      {user.Tenants.length > 0 && <TenantDropdown />}
      <span className="text-sm font-medium">{user.Name}</span>
      <Button
        variant="ghost"
        onClick={handleLogout}
        className="p-2"
        title="Logout" // additional tooltip support
      >
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Logout</span>
      </Button>
    </div>
  );
}

export default Navbar;
