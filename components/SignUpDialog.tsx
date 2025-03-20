"use client";

import { useState } from "react";
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

export default function SignUpDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    // For now, simply log the form data.
    showToast(
      "Information Recieved! A Catēna Representative will be in touch soon! ",
      "success"
    );
    // Later, you can add code here to send an email or handle the form submission.
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            className="bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition"
          >
            Sign Up Now
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up</DialogTitle>
            <DialogDescription>
              Please fill out the form below and we'll get in touch with you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Your Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              className="w-full rounded border p-2"
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-violet-600 text-white shadow-lg hover:bg-violet-500 transition"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <RequestToast />
    </>
  );
}
