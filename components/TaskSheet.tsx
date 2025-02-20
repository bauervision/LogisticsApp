"use client";

import React, { useState, useEffect } from "react";
import ReactJson from "react-json-view";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSchema } from "@/app/context/SchemaContext";
import { useUser } from "@/app/context/UserContext";
import { useWorkflow } from "@/app/context/WorkflowContext";

const TaskSheet: React.FC = () => {
  const { rowData, setRowData } = useSchema();
  const { user } = useUser();
  const { state: workflowState } = useWorkflow();

  const [tasks, setTasks] = useState<any[]>([]);
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Filter rowData for tasks where "Next Step Approver" equals the current user.
  useEffect(() => {
    if (rowData && user) {
      const filteredTasks = rowData.filter(
        (task: any) => task["Next Step Approver"] === user.name
      );
      setTasks(filteredTasks);
    }
  }, [rowData, user]);

  const handleTaskClick = (taskId: number) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // Approve will try to advance the request to the next step in the workflow.
  const handleApprove = (task: any) => {
    // Find the current workflow item by matching its name to the task's current step.
    const currentWorkflowItem = Object.values(workflowState.items).find(
      (item) => item.name === task.workflow.currentStep
    );

    if (!currentWorkflowItem) {
      alert("Workflow step not found.");
      return;
    }

    if (currentWorkflowItem.children.length > 0) {
      // Get the next step (assuming the first child is the next step)
      const nextItemId = currentWorkflowItem.children[0];
      const nextItem = workflowState.items[nextItemId];

      if (nextItem) {
        // Update the task with the new workflow step, nextApprover, and updated request status.
        const updatedTask = {
          ...task,
          workflow: {
            ...task.workflow,
            currentStep: nextItem.name,
          },
          "Next Step Approver": nextItem.nextApprover || "",
          "Request Status": nextItem.name, // Update the status to the name of this step set in the workflow
        };

        if (rowData) {
          const updatedRowData = rowData.map((r: any) =>
            r.id === task.id ? updatedTask : r
          );
          setRowData(updatedRowData);
          alert(
            `Request approved. Moved to step: ${nextItem.name}. Next Approver: ${nextItem.nextApprover}. Status updated to: ${nextItem.currentState}`
          );
        }
      } else {
        alert("Next workflow step not found.");
      }
    } else {
      alert("This request is already at the final step.");
    }
  };

  // For now, Reject will simply alert the user.
  const handleReject = (task: any) => {
    alert("Request has been rejected.");
    // Optionally, update task status or perform additional actions.
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
                {tasks.map((task) => (
                  <li key={task.id} className="border p-2 rounded">
                    <Button
                      variant="outline"
                      onClick={() => handleTaskClick(task.id)}
                    >
                      {task["Request Number"]
                        ? `Request ${task["Request Number"]}`
                        : task["Request Workflow"] || "Task"}
                    </Button>
                    {expandedTaskId === task.id && (
                      <div className="mt-2 p-2 border rounded">
                        <h3 className="text-lg font-bold">
                          {task["Request Workflow"] || "Task Details"}
                        </h3>
                        <ReactJson
                          src={task}
                          name={false}
                          collapsed={true}
                          enableClipboard={false}
                          displayDataTypes={false}
                        />
                        <div className="mt-2 flex space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleApprove(task)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleReject(task)}
                          >
                            Reject
                          </Button>
                        </div>
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
