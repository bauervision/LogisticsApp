// constants.ts
export const FIELD_TYPES = {
  TEXT: "text",
  NUMBER: "number",
  FLOAT: "float",
  CURRENCY: "currency",
  DATE: "date",
  BOOLEAN: "boolean",
};

export const PRESET_FIELDS = [
  {
    id: "requestCreated",
    type: FIELD_TYPES.DATE,
    parameter: "Request Created",
    format: "MM-DD-YYYY",
    isRequired: true,
  },
  {
    id: "requestNumber",
    type: FIELD_TYPES.NUMBER,
    parameter: "Request Number",
    isRequired: true,
  },
  {
    id: "contractNumber",
    type: FIELD_TYPES.NUMBER,
    parameter: "Contract Number",
    isRequired: true,
  },
  {
    id: "description",
    type: FIELD_TYPES.TEXT,
    parameter: "Description",
    isRequired: false,
  },
  {
    id: "requestedItems",
    type: FIELD_TYPES.TEXT,
    parameter: "Requested Items",
    isRequired: true,
  },
  {
    id: "requestedAwardDate",
    type: FIELD_TYPES.DATE,
    parameter: "Requested Award Date",
    format: "MM-DD-YYYY",
    isRequired: true,
  },
];

export const SHIPPING_FIELDS = [
  {
    id: "customerPOCName",
    parameter: "Customer POC Name",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
  },
  {
    id: "customerPOCEmail",
    parameter: "Customer POC Email",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
  },
  {
    id: "attentionTo",
    parameter: "Attention To ( If different )",
    type: FIELD_TYPES.TEXT,
    isRequired: false,
  },
  {
    id: "shippingAddress",
    parameter: "Shipping Address",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
  },
];
