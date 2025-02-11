"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";
import { useUser } from "@/app/context/UserContext";
import { Button } from "./ui/button";
import { AccessRole, USERS } from "@/app/constants";

const RoleDropdown: React.FC = () => {
  const { user, setUser } = useUser();
  const users = USERS;

  const handleUserChange = (index: number) => {
    setUser(USERS[index]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="btn">{user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select User</DropdownMenuLabel>
        {users.map((newUser, i) => (
          <DropdownMenuItem
            key={newUser.name}
            onClick={() => handleUserChange(i)}
          >
            {newUser.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RoleDropdown;
