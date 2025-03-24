// dataManager.ts

import { ColDef, Schema } from "@/app/context/SchemaContext";
import { showToast } from "@/components/Requests/RequestToast";

// Toggle between API and localStorage
const USE_API = false;

// Utility keys for local storage
const SCHEMA_STORAGE_KEY = "schema_data";
const ROW_DATA_STORAGE_KEY = "row_data";
const COL_DEFS_STORAGE_KEY = "col_defs";

const SCHEMA_DATA_URL = "/api/schema";
const REQUEST_DATA_URL = "/api/rowData";
const COL_DEFS_DATA_URL = "/api/colDefs";
const CLEAR_DATA_URL = "/api/colDefs";

// Schema functions
export const getSchemaData = async (): Promise<Schema | null> => {
  if (USE_API) {
    try {
      const res = await fetch(SCHEMA_DATA_URL);
      if (!res.ok) throw new Error("Failed to fetch schema from API");
      const schema: Schema = await res.json();
      showToast("Schema loaded successfully", "success");
      return schema;
    } catch (error) {
      console.error(error);
      showToast("Error loading schema", "error");
      return null;
    }
  } else {
    const stored = localStorage.getItem(SCHEMA_STORAGE_KEY);

    return stored ? JSON.parse(stored) : null;
  }
};

export const saveSchemaData = async (schema: Schema | null): Promise<void> => {
  if (USE_API) {
    try {
      const res = await fetch("/api/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
      });
      if (!res.ok) throw new Error("Failed to save schema to API");
      showToast("Schema saved successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Error saving schema", "error");
    }
  } else {
    if (schema) {
      localStorage.setItem(SCHEMA_STORAGE_KEY, JSON.stringify(schema));
    } else {
      localStorage.removeItem(SCHEMA_STORAGE_KEY);
    }
  }
};

// Row Data functions
export const getRowData = async (): Promise<any[] | null> => {
  if (USE_API) {
    try {
      const res = await fetch(REQUEST_DATA_URL);
      if (!res.ok) throw new Error("Failed to fetch row data from API");
      const data = await res.json();
      showToast("Row data loaded successfully", "success");
      return data;
    } catch (error) {
      console.error(error);
      showToast("Error loading row data", "error");
      return null;
    }
  } else {
    const stored = localStorage.getItem(ROW_DATA_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};

export const saveRowData = async (data: any[] | null): Promise<void> => {
  if (USE_API) {
    try {
      const res = await fetch("/api/rowData", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save row data to API");
      showToast("Row data saved successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Error saving row data", "error");
    }
  } else {
    if (data) localStorage.setItem(ROW_DATA_STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(ROW_DATA_STORAGE_KEY);
  }
};

export const getColDefsData = async (): Promise<ColDef[] | null> => {
  if (USE_API) {
    try {
      const res = await fetch(COL_DEFS_DATA_URL);
      if (!res.ok)
        throw new Error("Failed to fetch column definitions from API");
      const defs = await res.json();
      showToast("Column definitions loaded successfully", "success");
      return defs;
    } catch (error) {
      console.error(error);
      showToast("Error loading column definitions", "error");
      return null;
    }
  } else {
    const stored = localStorage.getItem(COL_DEFS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }
};

export const saveColDefsData = async (defs: ColDef[] | null): Promise<void> => {
  if (USE_API) {
    try {
      const res = await fetch("/api/colDefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defs),
      });
      if (!res.ok) throw new Error("Failed to save column definitions to API");
      showToast("Column definitions saved successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Error saving column definitions", "error");
    }
  } else {
    if (defs) localStorage.setItem(COL_DEFS_STORAGE_KEY, JSON.stringify(defs));
    else localStorage.removeItem(COL_DEFS_STORAGE_KEY);
  }
};

// Clear all data
export const clearSavedLocalData = async (): Promise<void> => {
  if (USE_API) {
    try {
      const res = await fetch("/api/clearData", { method: "POST" });
      if (!res.ok) throw new Error("Failed to clear data from API");
      showToast("Data cleared successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Error clearing data", "error");
    }
  } else {
    localStorage.removeItem(SCHEMA_STORAGE_KEY);
    localStorage.removeItem(ROW_DATA_STORAGE_KEY);
    localStorage.removeItem(COL_DEFS_STORAGE_KEY);
    showToast("Local data cleared", "info");
  }
};
