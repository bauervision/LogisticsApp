"use client";

import React, { useEffect, useState } from "react";
import { ColDef, SchemaItem } from "@/app/context/SchemaContext";

import { SchemaContent } from "./SchemaContent";
import { CSVParser } from "./CSVParser";
import { AGGrid } from "./AGGrid";
import { useSchema } from "@/app/context/SchemaContext";
import {
  DATE_FORMAT_OPTIONS,
  FIELD_TYPES,
  FIELD_TYPES_OPTIONS,
  PRESET_FIELDS,
  SHIPPING_FIELDS,
} from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import RequestToast, { showToast } from "../Requests/RequestToast";

const DataSetup: React.FC = () => {
  const {
    schema,
    setSchema,
    rowData,
    setRowData,
    colDefs,
    setColDefs,
    clearLocalData,
  } = useSchema();

  const [mode, setMode] = useState<"csv" | "manual">("csv");

  // Prepopulate manual schema with built‑in fields
  const [manualSchema, setManualSchema] = useState<SchemaItem[]>([
    ...PRESET_FIELDS,
    ...SHIPPING_FIELDS,
  ]);

  // When saving in manual mode, simply use the manual schema
  const handleSaveManualSchema = () => {
    setSchema(manualSchema);

    // Update AGGrid column definitions using the manual schema.
    const completeColDefs = manualSchema.map((field): ColDef => {
      const parameter: string = field.parameter || "";
      return {
        headerName: parameter,
        field: parameter,
      };
    });
    setColDefs(completeColDefs);

    setTimeout(() => null, 1000);
    showToast("Schema Saved successfully", "success");
  };

  const handleAddField = () => {
    const newField: SchemaItem = {
      id: Date.now(),
      type: FIELD_TYPES.TEXT, // Default type for new fields
      parameter: "", // Default empty parameter
      defaultField: false,
      isRequired: false,
      readOnly: false,
    };
    setManualSchema((prev) => [...prev, newField]);
  };

  const handleRemoveField = (id: string) => {
    setManualSchema((prev) =>
      prev.filter((field) => field.id.toString() !== id)
    );
  };

  const handleUpdateField = (
    id: string,
    key: keyof SchemaItem,
    value: string
  ) => {
    setManualSchema((prev) =>
      prev.map((field) =>
        field.id.toString() === id ? { ...field, [key]: value } : field
      )
    );
  };

  // When switching modes, we preserve manual schema so built‑in fields remain.
  const handleModeChange = (newMode: "csv" | "manual") => {
    setMode(newMode);
  };

  useEffect(() => {
    console.log("Current Schema:", schema);
  }, [schema]);

  // Separate built‑in fields from additional (user-added) fields.
  const builtInFields = manualSchema.filter((field) => field.defaultField);
  const additionalFields = manualSchema.filter((field) => !field.defaultField);

  return (
    <div className="bg-gray-100 w-full flex flex-col h-full">
      <RequestToast />
      <header className="bg-white shadow p-6">
        <h2 className="text-2xl font-semibold text-center">
          Catēna Data Configuration
        </h2>

        {/* Toggle Mode */}
        <div className="flex justify-center mt-4 gap-4">
          <Button
            className={
              mode === "csv" ? "bg-blue-600 text-white" : "bg-gray-200"
            }
            onClick={() => handleModeChange("csv")}
          >
            Upload CSV
          </Button>
          <Button
            className={
              mode === "manual" ? "bg-blue-600 text-white" : "bg-gray-200"
            }
            onClick={() => handleModeChange("manual")}
          >
            Create Schema from Scratch
          </Button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto p-6 flex flex-col w-full">
        {mode === "manual" ? (
          <>
            <section className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Define Schema</h3>
              <h4 className="text-sm  mb-4">
                These are default Catena Request fields and cannot be altered.
                They are presented here for your awareness. Feel free to add any
                custom fields in the Additional Details section.
              </h4>

              {/* Fieldset for built‑in (read-only) fields */}
              <fieldset className="mb-4 border p-4">
                <legend className="px-2 font-semibold">Built-in Fields</legend>
                {builtInFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 w-full mb-2"
                  >
                    {/* Parameter Name Input (read-only) */}
                    <Input
                      className="flex-grow"
                      placeholder="Field Name"
                      value={field.parameter}
                      readOnly
                      disabled
                    />

                    {/* Type Dropdown (disabled) */}
                    <Select disabled value={field.type}>
                      <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Select Type">
                          {FIELD_TYPES_OPTIONS.find(
                            (option) => option.value === field.type
                          )?.label || "Select Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Conditional Date Format Dropdown (disabled) */}
                    {field.type === FIELD_TYPES.DATE && (
                      <div className="ml-3">
                        <select
                          className="form-select"
                          value={field.format || ""}
                          disabled
                        >
                          <option value="" disabled>
                            Select Date Format
                          </option>
                          {DATE_FORMAT_OPTIONS.map((format) => (
                            <option key={format} value={format}>
                              {format}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </fieldset>

              {/* Fieldset for additional fields */}
              <fieldset className="mb-4 border p-4">
                <legend className="px-2 font-semibold">
                  Additional Fields
                </legend>
                {additionalFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 w-full mb-2"
                  >
                    {/* Parameter Name Input (editable) */}
                    <Input
                      className="flex-grow"
                      placeholder="Field Name"
                      value={field.parameter}
                      onChange={(e) =>
                        handleUpdateField(
                          field.id.toString(),
                          "parameter",
                          e.target.value
                        )
                      }
                    />

                    {/* Type Dropdown (editable) */}
                    <Select
                      onValueChange={(value) =>
                        handleUpdateField(field.id.toString(), "type", value)
                      }
                      value={field.type}
                    >
                      <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Select Type">
                          {FIELD_TYPES_OPTIONS.find(
                            (option) => option.value === field.type
                          )?.label || "Select Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Conditional Date Format Dropdown (editable) */}
                    {field.type === FIELD_TYPES.DATE && (
                      <div className="ml-3">
                        <select
                          className="form-select"
                          value={field.format || ""}
                          onChange={(e) =>
                            handleUpdateField(
                              field.id.toString(),
                              "format",
                              e.target.value
                            )
                          }
                        >
                          <option value="" disabled>
                            Select Date Format
                          </option>
                          {DATE_FORMAT_OPTIONS.map((format) => (
                            <option key={format} value={format}>
                              {format}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Delete Button for additional fields */}
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveField(field.id.toString())}
                      type="button"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </fieldset>

              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleAddField}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add Field
                </Button>
                <Button
                  onClick={handleSaveManualSchema}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save Schema
                </Button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="bg-white p-6 shadow rounded-lg">
              <CSVParser
                saveParsedData={(rows, data) => setRowData(data)}
                setHeaders={(rows, schemaArray) => {
                  // When CSV is used, merge CSV-based schema with preset fields.
                  const completeSchema = [
                    ...PRESET_FIELDS,
                    ...SHIPPING_FIELDS,
                    ...schemaArray,
                  ];
                  setSchema(completeSchema);
                }}
                handleDataCreation={setRowData}
                setSchema={setSchema}
              />
            </section>

            {/* Schema and Data Table */}
            {schema && schema.length > 0 && (
              <>
                <section className="bg-white p-6 shadow rounded-lg mt-8">
                  <SchemaContent
                    currentHeaders={colDefs || undefined}
                    list={
                      schema.filter(
                        (item) => item.parameter !== "Request Status"
                      ) || []
                    }
                    handleDelete={(id) =>
                      setSchema(schema.filter((item) => item.id !== id))
                    }
                    handleSavingDataset={() => alert("Schema saved!")}
                    handleHeaderUpdateType={() => {}}
                    handleHeaderUpdateParameter={() => {}}
                  />
                </section>
              </>
            )}

            {rowData && colDefs && (
              <section className="bg-white mt-8 p-6 shadow rounded-lg flex-grow w-full">
                <AGGrid
                  rows={rowData}
                  columns={colDefs}
                  setHeight="600px"
                  paginate={true}
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default DataSetup;
