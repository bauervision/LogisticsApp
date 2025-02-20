"use client";

import React, { useState, useEffect } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSchema } from "@/app/context/SchemaContext";
import { useUser } from "@/app/context/UserContext";

const TaskSheet: React.FC = () => {
  // Pull rowData from your SchemaContext and user info from your UserContext.
  const { rowData } = useSchema();
  const { user } = useUser();

  // Use local state for tasks, which will be filtered from rowData.
  const [tasks, setTasks] = useState<{ [key: string]: any }[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Update tasks whenever rowData or user changes.
  useEffect(() => {
    if (rowData && user) {
      const filteredTasks = rowData.filter(
        (task: any) => task["Next Step Approver"] === user.name
      );
      setTasks(filteredTasks);
    }
  }, [rowData, user]);

  const handleTaskClick = (taskIndex: number) => {
    setExpandedTaskId((prev) => (prev === taskIndex ? null : taskIndex));
  };

  return (
    <div className="pb-2">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="bg-blue-950 text-white">
            You have {tasks.length} Pending Actions
          </Button>
        </SheetTrigger>

        <SheetContent>
          <div className="p-4">
            <h2 className="text-xl font-bold">Your Actions</h2>
            <div
              className="mt-4"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              <ul className="space-y-2">
                {tasks.map((task, index) => (
                  <li key={index} className="border p-2 rounded">
                    <Button
                      variant="outline"
                      onClick={() => handleTaskClick(index)}
                    >
                      {/* Display a title for the task. You can adjust this to show Request Number, Workflow name, etc. */}
                      {task["Request Number"]
                        ? `Request ${task["Request Number"]}`
                        : task["Request Workflow"] || "Task"}
                    </Button>
                    {expandedTaskId === index && (
                      <div className="mt-2 p-2 border rounded">
                        <h3 className="text-lg font-bold">
                          {task["Request Workflow"] || "Task"}
                        </h3>
                        <p>
                          {task.details || "No additional details provided."}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <SheetClose asChild>
              <Button className="mt-4">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TaskSheet;
