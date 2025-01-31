"use client";

import React, { useState, useEffect } from "react";
import { useSchema } from "@/app/context/SchemaContext";
import { useWorkflow } from "@/app/context/WorkflowContext";
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
import Link from "next/link";
import { handleLinkClick } from "@/app/utils/trackLinkClicks";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";

const DATE_FORMATS: { [key: string]: string } = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
  "MMM DD, YYYY": "MMM dd, yyyy",
  "MM-DD-YYYY": "MM-dd-yyyy",
};

const OrderRequestForm = () => {
  const { schema, rowData, setRowData } = useSchema();
  const {
    state,
    savedWorkflows,
    currentWorkflowName,
    setCurrentWorkflowName,
    loadWorkflow,
  } = useWorkflow();

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // 🔴 Store validation messages

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

    // Clear error message when the user enters data
    setErrors((prev) => ({
      ...prev,
      [field]: value ? "" : "This field is required.",
    }));
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

    // Clear error message when a date is selected
    setErrors((prev) => ({
      ...prev,
      [field]: formattedDate ? "" : "This field is required.",
    }));
  };

  // Get today's date in the correct format
  const getFormattedTodayDate = (formatStr: string) => {
    return format(new Date(), DATE_FORMATS[formatStr] || "yyyy-MM-dd");
  };

  // On form load, set default values
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      "Request Created": getFormattedTodayDate("MM-DD-YYYY"),
    }));
  }, []);

  // 🔹 **Validation function**
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    PRESET_FIELDS.forEach((field) => {
      if (
        !formValues[field.parameter] ||
        formValues[field.parameter].trim() === ""
      ) {
        newErrors[field.parameter] = "This field is required.";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // ✅ Return true if no errors
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!schema) {
      console.error("No schema found.");
      return;
    }
    if (!currentWorkflowName) {
      console.error("No workflow selected.");
      return;
    }

    // **Run validation**
    if (!validateForm()) {
      return; // 🛑 Stop form submission if validation fails
    }

    const newRow = {
      ...formValues,
      id: rowData ? rowData.length + 1 : 1,
      workflow: currentWorkflowName,
    };

    if (setRowData) {
      setRowData([...(rowData || []), newRow]);
    }

    setFormValues({});
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-bold mb-4">Create New Order Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow Selector */}
        <div>
          <Label htmlFor="workflow" className="font-medium text-sm">
            Select Workflow
          </Label>
          <Select
            onValueChange={handleWorkflowChange}
            value={currentWorkflowName || undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a workflow" />
            </SelectTrigger>
            <SelectContent>
              {savedWorkflows.length === 0 ? (
                <SelectItem disabled value="no-workflows">
                  No workflows available
                </SelectItem>
              ) : (
                savedWorkflows.map((workflowName) => (
                  <SelectItem key={workflowName} value={workflowName}>
                    {workflowName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Request Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
          {PRESET_FIELDS.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.parameter} className="font-medium text-sm">
                {field.parameter}
              </Label>
              {field.parameter === "Request Created" ? (
                <Input
                  type="text"
                  value={formValues[field.parameter]}
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
                  value={formValues[field.parameter] || ""}
                  onChange={(e) =>
                    handleInputChange(field.parameter, e.target.value)
                  }
                />
              )}
              {errors[field.parameter] && (
                <p className="text-red-500 text-xs">
                  {errors[field.parameter]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Shipping Details */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Shipping Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHIPPING_FIELDS.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label
                  htmlFor={field.parameter}
                  className="font-medium text-sm"
                >
                  {field.parameter}
                </Label>
                <Input
                  type="text"
                  value={formValues[field.parameter] || ""}
                  onChange={(e) =>
                    handleInputChange(field.parameter, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* User-Generated Fields */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Customer Specific Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            {schema
              ?.filter((field) => field.parameter !== "Request Status") // Hide internal field
              .map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.parameter}
                    className="font-medium text-sm"
                  >
                    {field.parameter}
                  </Label>

                  {/* ✅ Wrap DatePicker in a div to position it properly below the label */}
                  {field.type === FIELD_TYPES.DATE ? (
                    <div className="relative">
                      <DatePicker
                        selected={
                          formValues[field.parameter] &&
                          typeof formValues[field.parameter] === "string"
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
                      id={field.parameter}
                      value={formValues[field.parameter] || ""}
                      onChange={(e) =>
                        handleInputChange(field.parameter, e.target.value)
                      }
                      placeholder={`Enter ${field.parameter}`}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={Object.keys(errors).length > 0}
        >
          Submit
        </Button>
      </form>
    </div>
  );
};

export default OrderRequestForm;
