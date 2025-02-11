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
import { FIELD_TYPES, USERS, SHIPPING_FIELDS } from "@/app/constants";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import Link from "next/link";
import RequestToast, { showToast } from "./Requests/RequestToast";
import { useUser } from "@/app/context/UserContext";

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
  const { addRow, data } = useRequestContext();
  const { user } = useUser();
  const { state: workflowState } = useWorkflow();

  const [formValues, setFormValues] = useState<{ [key: string]: any }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // ----------------------------
  // Workflow Handling
  // ----------------------------
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

  // ----------------------------
  // Input Handlers
  // ----------------------------
  const handleInputChange = (field: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: !value }));
  };

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

  const getFormattedTodayDate = (formatStr: string) => {
    return format(new Date(), DATE_FORMATS[formatStr] || "yyyy-MM-dd");
  };

  // Set default "Request Created" on mount.
  useEffect(() => {
    // Initialize nextApprover with an empty string by default
    let nextApprover = "";
    let currentStatus = "";

    // If the workflow is loaded and there's a root item, get the first step.
    if (workflowState.rootItem) {
      const firstStep = workflowState.items[workflowState.rootItem];
      if (firstStep) {
        currentStatus = firstStep.currentState;
        if (firstStep.nextApprover) nextApprover = firstStep.nextApprover;
      }
    }

    setFormValues((prev) => ({
      ...prev,
      "Request Creator": user.name,
      "Request Status": currentStatus,
      "Next Step Approver": nextApprover,
      "Request Created": getFormattedTodayDate("MM-DD-YYYY"),
    }));
  }, []);

  // Set the "Request Number" based on saved orders.
  useEffect(() => {
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

  // ----------------------------
  // Validation
  // ----------------------------
  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};

    // Validate workflow selection.
    if (!currentWorkflowName) {
      newErrors.workflow = true;
    }

    // Validate all required fields.
    // (Assumes that fields in schema have an "isRequired" property.)
    [...(schema || [])].forEach((field) => {
      if (
        !formValues[field.parameter] ||
        formValues[field.parameter].toString().trim() === ""
      ) {
        if (field.isRequired && field.parameter !== "Request Status")
          newErrors[field.parameter] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------
  // Submission
  // ----------------------------
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      console.log("Failed Validation!");
      return;
    }

    let firstStep = "";
    if (workflowSteps.length > 0) {
      firstStep = workflowSteps[0];
    } else if (state.rootItem && state.items[state.rootItem]) {
      firstStep = state.items[state.rootItem].name;
    }

    const newRow = {
      ...formValues,
      id: rowData ? rowData.length + 1 : 1,
      workflow: {
        name: currentWorkflowName,
        currentStep: firstStep,
      },
    };

    addRow(newRow);
    setFormValues({});
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
    showToast("New Request Submitted successfully", "success");
  };

  useEffect(() => {
    // Check that a workflow is selected and the workflow has been loaded.
    if (currentWorkflowName && workflowState.rootItem) {
      // Retrieve the nextApprover value from the first step of the workflow.
      const nextApprover =
        workflowState.items[workflowState.rootItem]?.nextApprover || "";
      // Update the form values with the retrieved Next Step Approver.
      setFormValues((prev) => ({
        ...prev,
        "Next Step Approver": nextApprover,
      }));
    }
  }, [currentWorkflowName, workflowState, setFormValues]);

  // ----------------------------
  // Rendering
  // ----------------------------
  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <RequestToast />
      <h2 className="text-lg font-bold mb-4">Create New Order Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workflow Selector */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="workflow" className="font-medium text-sm">
              Select Workflow
              {errors.workflow && (
                <span className="text-red-500 text-xs ml-2">* Required</span>
              )}
            </Label>

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
          </div>

          <Link href="/request-tracker/workflow" passHref>
            <Button className="bg-blue-800 text-white">
              Create A New Workflow
            </Button>
          </Link>
        </div>

        {/* Customer Specific Details Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Customer Specific Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
            {schema
              ?.filter(
                (field) =>
                  field.parameter !== "Request Status" &&
                  ![
                    "Customer POC Name",
                    "Customer POC Email",
                    "Attention To ( If different )",
                  ].includes(field.parameter) &&
                  !field.parameter.startsWith("Shipping Address:")
              )
              .map((field) => {
                // For the Next Step Approver field, compute its default value.
                const defaultNextApprover =
                  formValues["Next Step Approver"] ||
                  (workflowState.rootItem &&
                    workflowState.items[workflowState.rootItem]
                      ?.nextApprover) ||
                  "";

                return (
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

                    {field.parameter === "Next Step Approver" ? (
                      // Render a dropdown for Next Step Approver with default value.
                      <Select
                        value={defaultNextApprover}
                        onValueChange={(value) =>
                          handleInputChange(field.parameter, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Next Step Approver" />
                        </SelectTrigger>
                        <SelectContent>
                          {USERS.map((userObj) => (
                            <SelectItem key={userObj.name} value={userObj.name}>
                              {userObj.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type.toUpperCase() ===
                      FIELD_TYPES.DATE.toUpperCase() ? (
                      // Render a DatePicker for date fields.
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
                          dateFormat={
                            DATE_FORMATS[field.format ?? "YYYY-MM-DD"]
                          }
                          className="w-full border rounded-md px-2 py-2 text-sm"
                          readOnly={field.readOnly}
                        />
                      </div>
                    ) : (
                      // Render a standard text input for all other fields.
                      <Input
                        type="text"
                        readOnly={field.readOnly}
                        value={formValues[field.parameter] ?? ""}
                        onChange={(e) =>
                          handleInputChange(field.parameter, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Shipping Details Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Shipping Details</h3>
          {/* POC Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SHIPPING_FIELDS.filter((field) =>
              [
                "Customer POC Name",
                "Customer POC Email",
                "Attention To ( If different )",
              ].includes(field.parameter)
            ).map((field) => (
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
                <Input
                  type="text"
                  value={formValues[field.parameter] ?? ""}
                  onChange={(e) =>
                    handleInputChange(field.parameter, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          {/* Shipping Address Sub-Section */}
          <fieldset className="mt-4 border p-4 rounded-md">
            <legend className="px-2 font-semibold">Shipping Address</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SHIPPING_FIELDS.filter((field) =>
                field.parameter.startsWith("Shipping Address:")
              ).map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label
                    htmlFor={field.parameter}
                    className="font-medium text-sm"
                  >
                    {field.parameter.replace("Shipping Address: ", "")}
                    {errors[field.parameter] && field.isRequired && (
                      <span className="text-red-500 text-xs ml-2">
                        * Required
                      </span>
                    )}
                  </Label>
                  <Input
                    type="text"
                    value={formValues[field.parameter] ?? ""}
                    onChange={(e) =>
                      handleInputChange(field.parameter, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default OrderRequestForm;
