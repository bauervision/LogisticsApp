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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse } from "date-fns";
import Link from "next/link";
import RequestToast, { showToast } from "./Requests/RequestToast";
import { useUser } from "@/app/context/UserContext";
import { FIELD_TYPES, USERS, SHIPPING_FIELDS, PRODUCTS } from "@/app/constants";

// Date formats mapping.
const DATE_FORMATS: { [key: string]: string } = {
  "MM/DD/YYYY": "MM/dd/yyyy",
  "DD/MM/YYYY": "dd/MM/yyyy",
  "YYYY-MM-DD": "yyyy-MM-dd",
  "MMM DD, YYYY": "MMM dd, yyyy",
  "MM-DD-YYYY": "MM-dd-yyyy",
};

// The RequestItem interface.
export interface RequestItem {
  product: string;
  price: number;
  amount: number;
}

const OrderRequestForm = () => {
  const { schema, rowData } = useSchema();
  const {
    state,
    dispatch,
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

  // Calculate the total cost of all request items.
  const totalCost = (formValues["Requested Items"] || []).reduce(
    (acc: number, item: RequestItem) =>
      acc + (item.price || 0) * (item.amount || 0),
    0
  );

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

  // ----------------------------
  // Request Items Handlers
  // ----------------------------
  const handleRequestItemChange = (
    index: number,
    key: keyof RequestItem,
    value: any
  ) => {
    const currentItems: RequestItem[] = formValues["Requested Items"] || [];
    const updatedItems = [...currentItems];
    updatedItems[index] = { ...updatedItems[index], [key]: value };
    setFormValues((prev) => ({ ...prev, "Requested Items": updatedItems }));
  };

  const handleAddRequestItem = () => {
    const currentItems: RequestItem[] = formValues["Requested Items"] || [];
    const updatedItems = [
      ...currentItems,
      { product: "", price: 0, amount: 0 },
    ];
    setFormValues((prev) => ({ ...prev, "Requested Items": updatedItems }));
  };

  const handleRemoveRequestItem = (index: number) => {
    const currentItems: RequestItem[] = formValues["Requested Items"] || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    setFormValues((prev) => ({ ...prev, "Requested Items": updatedItems }));
  };

  // ----------------------------
  // useEffect for default values
  // ----------------------------

  useEffect(() => {
    if (savedWorkflows && savedWorkflows.length === 1) {
      const defaultWorkflow = savedWorkflows[0];
      console.log(defaultWorkflow);
      // Only update if not already set
      if (currentWorkflowName !== defaultWorkflow) {
        setCurrentWorkflowName(defaultWorkflow);
        loadWorkflow(defaultWorkflow);
        setFormValues((prev) => ({
          ...prev,
          "Request Workflow": defaultWorkflow,
        }));
      }
    }
  }, [savedWorkflows]);

  useEffect(() => {
    if (workflowState.rootItem) {
      const firstStep = workflowState.items[workflowState.rootItem];
      console.log("First Step", firstStep);
      const currentStatus = firstStep?.name || "Draft";
      const nextApprover = firstStep?.nextApprover || "";
      setCurrentWorkflowName(workflowState.name);
      setFormValues((prev) => ({
        ...prev,
        "Request Creator": user.name,
        "Request Workflow": workflowState.name,
        "Request Status": currentStatus,
        "Next Step Approver": nextApprover,
        "Request Created": getFormattedTodayDate("MM-DD-YYYY"),
      }));
    }
  }, [workflowState]); // Now re-run when workflowState changes.

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
    if (!formValues["Request Workflow"]) {
      newErrors["Request Workflow"] = true;
    }

    [...(schema || [])].forEach((field) => {
      if (field.isRequired && field.parameter !== "Request Status") {
        if (
          field.type.toUpperCase() === FIELD_TYPES.ITEMS.toUpperCase() &&
          (!Array.isArray(formValues[field.parameter]) ||
            formValues[field.parameter].length === 0)
        ) {
          newErrors[field.parameter] = true;
        } else if (
          field.type.toUpperCase() !== FIELD_TYPES.ITEMS.toUpperCase() &&
          (!formValues[field.parameter] ||
            formValues[field.parameter].toString().trim() === "")
        ) {
          newErrors[field.parameter] = true;
        }
      }
    });
    setErrors(newErrors);
    console.log(newErrors);
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

  // ----------------------------
  // Rendering
  // ----------------------------
  return (
    <div className="p-6 bg-white shadow-md rounded-md">
      <RequestToast />
      <h2 className="text-lg font-bold mb-4">Create New Order Request</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
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
                // Render the "Request Workflow" field with dropdown functionality.
                if (field.parameter === "Request Workflow") {
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.parameter}
                        className="font-medium text-sm"
                      >
                        {field.parameter}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </Label>
                      <Select
                        value={currentWorkflowName || ""}
                        onValueChange={(value) => handleWorkflowChange(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Workflow" />
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
                  );
                }

                if (field.parameter === "Next Step Approver") {
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
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            Required
                          </span>
                        )}
                      </Label>
                      <Select
                        value={defaultNextApprover}
                        onValueChange={(value) => {
                          // Update local form state.
                          handleInputChange(field.parameter, value);
                          // Dispatch action to update the workflow state.
                          if (workflowState.rootItem) {
                            dispatch({
                              type: "updateItem",
                              itemId: workflowState.rootItem,
                              data: { nextApprover: value },
                            });
                          }
                        }}
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
                    </div>
                  );
                }

                // Handle the ITEMS field
                if (
                  field.type.toUpperCase() === FIELD_TYPES.ITEMS.toUpperCase()
                ) {
                  const items: RequestItem[] =
                    formValues[field.parameter] || [];
                  return (
                    <fieldset
                      key={field.id}
                      className="md:col-span-2 border p-4 rounded-md"
                    >
                      <legend className="px-2 font-semibold text-lg">
                        {field.parameter}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            * Required
                          </span>
                        )}
                      </legend>
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col md:flex-row gap-2 mb-2 items-center"
                        >
                          {/* Product Dropdown */}
                          <div className="flex-1">
                            <Label className="text-sm">Product</Label>
                            <Select
                              value={item.product ? item.product : undefined}
                              onValueChange={(value) => {
                                const selectedProduct = PRODUCTS.find(
                                  (prod) => prod.product === value
                                );
                                handleRequestItemChange(
                                  index,
                                  "product",
                                  value
                                );
                                if (selectedProduct) {
                                  // Auto-populate the Price when a product is selected.
                                  handleRequestItemChange(
                                    index,
                                    "price",
                                    selectedProduct.price
                                  );
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Product" />
                              </SelectTrigger>
                              <SelectContent>
                                {PRODUCTS.map((prod) => (
                                  <SelectItem
                                    key={prod.product}
                                    value={prod.product}
                                  >
                                    {prod.product}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Price Display (read-only and formatted as currency) */}
                          <div className="flex-1">
                            <Label className="text-sm">Price</Label>
                            <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format(item.price || 0)}
                            </div>
                          </div>
                          {/* Amount Input */}
                          <div className="flex-1">
                            <Label className="text-sm">Amount</Label>
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={item.amount}
                              onChange={(e) =>
                                handleRequestItemChange(
                                  index,
                                  "amount",
                                  parseInt(e.target.value, 10)
                                )
                              }
                            />
                          </div>
                          {/* Line Total Display */}
                          <div className="flex-1">
                            <Label className="text-sm">Line Total</Label>
                            <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "USD",
                              }).format((item.price || 0) * (item.amount || 0))}
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            type="button"
                            onClick={() => handleRemoveRequestItem(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        onClick={handleAddRequestItem}
                        className="mt-2"
                      >
                        Add Request Item
                      </Button>
                      {/* Total Amount Field */}
                      <div className="mt-4">
                        <Label className="text-sm">Total Amount</Label>
                        <div className="border rounded-md px-2 py-2 text-sm bg-gray-100">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "USD",
                          }).format(totalCost)}
                        </div>
                      </div>
                    </fieldset>
                  );
                }

                if (
                  field.type.toUpperCase() === FIELD_TYPES.DATE.toUpperCase()
                ) {
                  return (
                    <div key={field.id} className="space-y-2">
                      <Label
                        htmlFor={field.parameter}
                        className="font-medium text-sm"
                      >
                        {field.parameter}
                        {field.isRequired && (
                          <span className="text-blue-500 ml-1">*</span>
                        )}
                        {errors[field.parameter] && (
                          <span className="text-red-500 text-xs ml-2">
                            * Required
                          </span>
                        )}
                      </Label>
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
                    </div>
                  );
                }

                return (
                  <div key={field.id} className="space-y-2">
                    <Label
                      htmlFor={field.parameter}
                      className="font-medium text-sm"
                    >
                      {field.parameter}
                      {field.isRequired && (
                        <span className="text-blue-500 ml-1">*</span>
                      )}
                      {errors[field.parameter] && (
                        <span className="text-red-500 text-xs ml-2">
                          * Required
                        </span>
                      )}
                    </Label>
                    <Input
                      type="text"
                      readOnly={field.readOnly}
                      value={formValues[field.parameter] ?? ""}
                      onChange={(e) =>
                        handleInputChange(field.parameter, e.target.value)
                      }
                    />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Shipping Details Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-semibold mb-3">Shipping Details</h3>
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
                  {field.isRequired && (
                    <span className="text-blue-500 ml-1">*</span>
                  )}
                  {errors[field.parameter] && (
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
                    {field.isRequired && (
                      <span className="text-blue-500 ml-1">*</span>
                    )}
                    {errors[field.parameter] && (
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
