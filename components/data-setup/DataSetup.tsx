"use client";

import React, { useEffect, useState } from "react";
import { ColDef } from "@/app/context/SchemaContext";

import { SchemaContent } from "./SchemaContent";
import { CSVParser } from "./CSVParser";
import { AGGrid } from "./AGGrid";
import { useSchema } from "@/app/context/SchemaContext";
import { FIELD_TYPES, PRESET_FIELDS, SHIPPING_FIELDS } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const DATE_FORMAT_OPTIONS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "MMM DD, YYYY",
];

const FIELD_TYPES_OPTIONS = [
  { value: FIELD_TYPES.TEXT, label: "Text" },
  { value: FIELD_TYPES.NUMBER, label: "Number" },
  { value: FIELD_TYPES.FLOAT, label: "Float" },
  { value: FIELD_TYPES.CURRENCY, label: "Currency" },
  { value: FIELD_TYPES.DATE, label: "Date" },
  { value: FIELD_TYPES.BOOLEAN, label: "Boolean" },
];

interface SchemaItem {
  id: number;
  type: string;
  parameter: string;
  format?: string;
}

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
  const [manualSchema, setManualSchema] = useState<SchemaItem[]>([]);

  // When saving a manual schema, merge in the preset and shipping fields.
  const handleSaveManualSchema = () => {
    // Create a complete schema that includes:
    // 1. PRESET_FIELDS
    // 2. SHIPPING_FIELDS
    // 3. The user-defined fields (manualSchema)
    const completeSchema = [
      ...PRESET_FIELDS,
      ...SHIPPING_FIELDS,
      ...manualSchema,
    ];
    setSchema(completeSchema);

    // Optionally, you can also update your AGGrid column definitions here.
    // For example:
    const completeColDefs = completeSchema.map((field): ColDef => {
      const parameter: string = (field.parameter || "") as string;
      return {
        headerName: parameter,
        field: parameter,
      };
    }) as unknown as ColDef[];

    setColDefs(completeColDefs);

    alert("Schema saved successfully!");
  };

  const handleAddField = () => {
    const newField: SchemaItem = {
      id: Date.now(),
      type: FIELD_TYPES.TEXT, // Default type
      parameter: "", // Default empty parameter
    };
    setManualSchema((prev) => [...prev, newField]);
  };

  const handleRemoveField = (id: number) => {
    setManualSchema((prev) => prev.filter((field) => field.id !== id));
  };

  const handleUpdateField = (
    id: number,
    key: keyof SchemaItem,
    value: string
  ) => {
    setManualSchema((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const handleModeChange = (newMode: "csv" | "manual") => {
    if (newMode === "csv") {
      // Clear the manual schema and reset inputs
      setManualSchema([]);
    }
    setMode(newMode);
  };

  useEffect(() => {
    console.log("Current Schema:", schema);
  }, [schema]);

  return (
    <div className="bg-gray-100 w-full flex flex-col h-full">
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
              <div className="space-y-4">
                {manualSchema.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-4 w-full"
                  >
                    {/* Parameter Name Input */}
                    <Input
                      className="flex-grow"
                      placeholder="Field Name"
                      value={field.parameter}
                      onChange={(e) =>
                        handleUpdateField(field.id, "parameter", e.target.value)
                      }
                    />

                    {/* Type Dropdown */}
                    <Select
                      onValueChange={(value) =>
                        handleUpdateField(field.id, "type", value)
                      }
                      value={field.type}
                    >
                      <SelectTrigger className="w-1/4">
                        <SelectValue placeholder="Select Type">
                          {FIELD_TYPES_OPTIONS.find(
                            (type) => type.value === field.type
                          )?.label || "Select Type"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES_OPTIONS.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Conditional Date Format Dropdown */}
                    {field.type === FIELD_TYPES.DATE && (
                      <div className="ml-3">
                        <select
                          className="form-select"
                          value={field.format || ""}
                          onChange={(e) =>
                            handleUpdateField(
                              field.id,
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

                    {/* Delete Button */}
                    <Button
                      variant="outline"
                      onClick={() => handleRemoveField(field.id)}
                      type="button"
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
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
                  // When CSV is used, you can merge the CSV-based schema with the preset fields.
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
