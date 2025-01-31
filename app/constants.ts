// constants.ts
export const FIELD_TYPES = {
  TEXT: "string",
  NUMBER: "int",
  FLOAT: "float",
  DATE: "date",
  BOOLEAN: "boolean", // Example: Future type
  CURRENCY: "currency", // Example: Future type
};
export const PRESET_FIELDS = [
  { id: 1, type: "DATE", parameter: "Request Created", format: "MM-DD-YYYY" },
  { id: 2, type: "NUMBER", parameter: "Request Number" },
  { id: 3, type: "NUMBER", parameter: "Contract Number" },
  { id: 4, type: "TEXT", parameter: "Description" },
  { id: 5, type: "TEXT", parameter: "Requested Items" },
  {
    id: 6,
    type: "DATE",
    parameter: "Requested Award Date",
    format: "MM-DD-YYYY",
  },
];

export const SHIPPING_FIELDS = [
  { id: "customerPOCName", parameter: "Customer POC Name", type: "TEXT" },
  { id: "customerPOCEmail", parameter: "Customer POC Email", type: "TEXT" },
  {
    id: "attentionTo",
    parameter: "Attention To ( If different )",
    type: "TEXT",
  },
  { id: "shippingAddress", parameter: "Shipping Address", type: "TEXT" },
];
