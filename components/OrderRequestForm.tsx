"use client";

import React, { useState, useEffect } from "react";
import { useSchema } from "@/app/context/SchemaContext";
import { useWorkflow } from "@/app/context/WorkflowContext";
import { useRequestContext } from "@/app/context/DataContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FIELD_TYPES, PRESET_FIELDS, SHIPPING_FIELDS } from "@/app/constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import Link from "next/link";
import RequestToast, { showToast } from "./Requests/RequestToast";
import { useFetchWithToast } from "@/hooks/fetchWithToast";

const DATE_FORMATS: { [key: string]: string } = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
  "MMM DD, YYYY": "MMM dd, yyyy",
  "MM-DD-YYYY": "MM-dd-yyyy",
};

const OrderRequestForm = () => {
  const { schema, rowData } = useSchema();
  const {
    state,
    savedWorkflows,
    currentWorkflowName,
    setCurrentWorkflowName,
    loadWorkflow,
  } = useWorkflow();
  const { addRow, data } = useRequestContext(); // Destructure "data" from RequestContext

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Handle workflow selection
  const handleWorkflowChange = (workflowName: string) => {
    setCurrentWorkflowName(workflowName);
    loadWorkflow(workflowName);

    if (state.rootItem) {
      const steps = extractWorkflowSteps(state.rootItem);
      setWorkflowSteps(steps);
    } else {
      setWorkflowSteps([]);
    }
  };

  // Extract workflow steps recursively
  const extractWorkflowSteps = (
    itemId: string,
    steps: string[] = []
  ): string[] => {
    const item = state.items[itemId];
    if (!item) return steps;

    steps.push(item.name);
    item.children.forEach((childId) => extractWorkflowSteps(childId, steps));
    return steps;
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    // Clear error if user has provided a value.
    setErrors((prev) => ({ ...prev, [field]: !value }));
  };

  // Handle Date Picker Changes
  const handleDateChange = (
    field: string,
    date: Date | null,
    formatStr: string
  ) => {
    if (!date) return;
    const formattedDate = format(date, formatStr);
    setFormValues((prev) => ({ ...prev, [field]: formattedDate }));
    setErrors((prev) => ({ ...prev, [field]: !formattedDate }));
  };

  // Get today's date in the correct format
  const getFormattedTodayDate = (formatStr: string) => {
    return format(new Date(), DATE_FORMATS[formatStr] || "yyyy-MM-dd");
  };

  // On form load, set default values (for example, Request Created)
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      "Request Created": getFormattedTodayDate("MM-DD-YYYY"),
    }));
  }, []);

  // Set the "Request Number" based on the saved orders.
  useEffect(() => {
    // If there are saved orders, take the last order's Request Number,
    // increment it, and pad with leading zeros to 7 digits.
    const newRequestNumber =
      data && data.length > 0
        ? (parseInt(data[data.length - 1]["Request Number"], 10) + 1)
            .toString()
            .padStart(7, "0")
        : "0000001";

    setFormValues((prev) => ({
      ...prev,
      "Request Number": newRequestNumber,
    }));
  }, [data]);

  // Validate required fields
  const validateForm = () => {
    console.log("Validating...");
    const newErrors: { [key: string]: boolean } = {};

    // Validate workflow selection
    if (!currentWorkflowName) {
      newErrors.workflow = true;
    }
    console.log("currentWorkflowName..." + currentWorkflowName);
    // Validate all required fields
    [...(schema || [])].forEach((field) => {
      if (
        !formValues[field.parameter] ||
        formValues[field.parameter].toString().trim() === ""
      ) {
        // validate field only if required
        if (field.isRequired && field.parameter != "Request Status")
          newErrors[field.parameter] = true;
      }
    });
    console.log("newErrors...", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Submitting...");
    if (!validateForm()) {
      console.log("Failed Validation!");
      return;
    }
    console.log("Passed Valdation...");
    // Determine the first step of the workflow.
    let firstStep = "";
    if (workflowSteps.length > 0) {
      firstStep = workflowSteps[0];
    } else if (state.rootItem && state.items[state.rootItem]) {
      firstStep = state.items[state.rootItem].name;
    }
    console.log("First Step = " + firstStep);
    // Create new request data including all field groups
    const newRow = {
      ...formValues,
      id: rowData ? rowData.length + 1 : 1,
      workflow: {
        name: currentWorkflowName,
        currentStep: firstStep,
      },
    };

    // Log the final request data for verification
    console.log("Final Request Data:", newRow);

    // Use the data context to store the new request
    addRow(newRow);

    // Reset the form and show submission confirmation temporarily
    setFormValues({});
    setFormSubmitted(true);

    setTimeout(() => setFormSubmitted(false), 3000);
    handleRequestSave();
  };

  const handleRequestSave = async () => {
    showToast("New Request Submitted successfully", "success");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <RequestToast />
      <h2 className="text-lg font-bold mb-4">Create New Order Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow Selector */}
        <div>
          <Label htmlFor="workflow" className="font-medium text-sm">
            Select Workflow
            {errors.workflow && (
              <span className="text-red-500 text-xs ml-2">* Required</span>
            )}
          </Label>

          {savedWorkflows.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-red-500 text-xs">No workflows available.</p>
              <Link href="/request-tracker/workflow" passHref>
                <Button className="bg-blue-800 text-white">
                  Create Workflow
                </Button>
              </Link>
            </div>
          ) : (
            <Select
              onValueChange={handleWorkflowChange}
              value={currentWorkflowName || undefined}
            >
              <SelectTrigger
                className={`w-full ${
                  errors.workflow ? "border-red-500" : "border-gray-300"
                }`}
              >
                <SelectValue placeholder="Select a workflow" />
              </SelectTrigger>
              <SelectContent>
                {savedWorkflows.map((workflowName) => (
                  <SelectItem key={workflowName} value={workflowName}>
                    {workflowName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* (Schema Fields) */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Customer Specific Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            {schema
              ?.filter((field) => field.parameter !== "Request Status")
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.parameter}
                    className="font-medium text-sm"
                  >
                    {field.parameter}
                    {errors[field.parameter] && field.isRequired && (
                      <span className="text-red-500 text-xs ml-2">
                        * Required
                      </span>
                    )}
                  </Label>
                  {field.parameter === "Request Created" ? (
                    <Input
                      type="text"
                      value={formValues[field.parameter] ?? ""}
                      readOnly
                      className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100 cursor-not-allowed"
                    />
                  ) : field.type.toUpperCase() ===
                    FIELD_TYPES.DATE.toUpperCase() ? (
                    <div className="relative">
                      <DatePicker
                        selected={
                          formValues[field.parameter]
                            ? parse(
                                formValues[field.parameter],
                                DATE_FORMATS[field.format ?? "YYYY-MM-DD"],
                                new Date()
                              )
                            : null
                        }
                        onChange={(date) =>
                          handleDateChange(
                            field.parameter,
                            date,
                            DATE_FORMATS[field.format ?? "YYYY-MM-DD"]
                          )
                        }
                        dateFormat={DATE_FORMATS[field.format ?? "YYYY-MM-DD"]}
                        className="w-full border rounded-md px-2 py-2 text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={formValues[field.parameter] ?? ""}
                      onChange={(e) =>
                        handleInputChange(field.parameter, e.target.value)
                      }
                    />
                  )}
                </div>
              ))}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default OrderRequestForm;
