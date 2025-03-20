"use client";

import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import { User } from "../constants";

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setCurrentTenant: (tenant: string) => void;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  setCurrentTenant: () => {},
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    sessionStorage.setItem("user", JSON.stringify(user)), [user];
    console.log("USer Context", user);
  });
  const userMemod = useMemo(() => ({ user, setUser }), [user, setUser]);

  const setCurrentTenant = (tenant: string) => {
    // Remove the prefix "TENANT_" before storing
    const strippedTenant = tenant.replace(/^TENANT_/, "");
    setUser((prevUser) =>
      prevUser ? { ...prevUser, CurrentTenant: strippedTenant } : prevUser
    );
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
