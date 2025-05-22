"use client";

import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { User } from "../constants";

type UserContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  setCurrentTenant: (tenant: string) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  setCurrentTenant: () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);

  // Load from sessionStorage on client only
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem("user");
    if (saved) {
      try {
        setUserState(JSON.parse(saved));
      } catch {
        sessionStorage.removeItem("user");
      }
    }
  }, []);

  // Wrap setUser so we mirror state → sessionStorage
  const setUser = (u: User | null) => {
    if (typeof window !== "undefined") {
      if (u) sessionStorage.setItem("user", JSON.stringify(u));
      else sessionStorage.removeItem("user");
    }
    setUserState(u);
  };

  const setCurrentTenant = (tenant: string) => {
    // Remove the prefix "TENANT_" before storing
    const strippedTenant = tenant.replace(/^TENANT_/, "");
    if (!user) return; // guard if no user yet
    setUser({
      // pass a User, not a function
      ...user,
      CurrentTenant: strippedTenant,
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, setCurrentTenant }}>
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export { UserProvider, useUser };
