// components/LoginDialog.tsx
import { useState } from "react";
import { USERS } from "@/app/constants"; // adjust the path to your constants.ts file
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RequestToast, { showToast } from "./Requests/RequestToast";
import { useUser } from "@/app/context/UserContext";

export default function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleLogin = () => {
    // Look for a user whose Name matches the entered username.
    const foundUser = USERS.find((user) => user.Name === username);
    if (foundUser) {
      setUser(foundUser);
      showToast("Successful Login!", "success");
      setError("");
      setOpen(false);
    } else {
      setError("User not found. Please try again.");
    }
  };

  const handlePKICACLogin = () => {
    // Force login as "Jane Super"
    const jane = USERS.find((user) => user.Name === "Jane Super");
    if (jane) {
      setUser(jane);
      showToast("Successful Login with PKI / CAC!", "success");
      setError("");
    } else {
      setError("Error: Jane Super not found.");
    }
    setOpen(false);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <RequestToast />
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          // Reset error when opening/closing the dialog
          setError("");
          setOpen(isOpen);
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition"
          >
            Login
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Enter your credentials to login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <DialogFooter className="flex flex-col space-y-2">
            <Button
              onClick={handleLogin}
              className="bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition"
            >
              Login
            </Button>
            <Button variant="secondary" onClick={handlePKICACLogin}>
              Login in with PKI / CAC
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
