// constants.ts
export const FIELD_TYPES = {
  TEXT: "text",
  NUMBER: "number",
  FLOAT: "float",
  CURRENCY: "currency",
  DATE: "date",
  BOOLEAN: "boolean",
};

// Date format and field type options
export const DATE_FORMAT_OPTIONS = [
  "MM/DD/YYYY",
  "DD/MM/YYYY",
  "YYYY-MM-DD",
  "MMM DD, YYYY",
];

export const FIELD_TYPES_OPTIONS = [
  { value: FIELD_TYPES.TEXT, label: "Text" },
  { value: FIELD_TYPES.NUMBER, label: "Number" },
  { value: FIELD_TYPES.FLOAT, label: "Float" },
  { value: FIELD_TYPES.CURRENCY, label: "Currency" },
  { value: FIELD_TYPES.DATE, label: "Date" },
  { value: FIELD_TYPES.BOOLEAN, label: "Boolean" },
];

export const PRESET_FIELDS = [
  {
    id: "requestCreated",
    type: FIELD_TYPES.DATE,
    parameter: "Request Created",
    format: "MM-DD-YYYY",
    isRequired: true,
    readOnly: true,
    defaultField: true,
  },
  {
    id: "requestCreator",
    type: FIELD_TYPES.TEXT,
    parameter: "Request Creator",
    isRequired: true,
    readOnly: true,
    defaultField: true,
  },
  {
    id: "requestNextApprover",
    type: FIELD_TYPES.TEXT,
    parameter: "Next Step Approver",
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "requestNumber",
    type: FIELD_TYPES.NUMBER,
    parameter: "Request Number",
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "requestStatus",
    type: FIELD_TYPES.TEXT,
    parameter: "Request Status",
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "contractNumber",
    type: FIELD_TYPES.NUMBER,
    parameter: "Contract Number",
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "description",
    type: FIELD_TYPES.TEXT,
    parameter: "Description",
    isRequired: false,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "requestedItems",
    type: FIELD_TYPES.TEXT,
    parameter: "Requested Items",
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "requestedAwardDate",
    type: FIELD_TYPES.DATE,
    parameter: "Requested Award Date",
    format: "MM-DD-YYYY",
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
];

export const SHIPPING_FIELDS = [
  {
    id: "customerPOCName",
    parameter: "Customer POC Name",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "customerPOCEmail",
    parameter: "Customer POC Email",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "attentionTo",
    parameter: "Attention To ( If different )",
    type: FIELD_TYPES.TEXT,
    isRequired: false,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "shippingStreetAddress1",
    parameter: "Shipping Address: Street",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "shippingStreetAddress2",
    parameter: "Shipping Address: Street 2",
    type: FIELD_TYPES.TEXT,
    isRequired: false,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "shippingAddressCity",
    parameter: "Shipping Address: City",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "shippingAddressState",
    parameter: "Shipping Address: State",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
  {
    id: "shippingAddressZipcode",
    parameter: "Shipping Address: Zipcode",
    type: FIELD_TYPES.TEXT,
    isRequired: true,
    readOnly: false,
    defaultField: true,
  },
];

// USERS
export enum AccessRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  GUEST = "GUEST",
}

// interface for the Role type.
export interface User {
  name: string;
  role: AccessRole;
}

// USERS is now correctly typed as an array of User.
export const USERS: User[] = [
  { name: "Jane Super", role: AccessRole.SUPER_ADMIN },
  { name: "Kara Admin", role: AccessRole.ADMIN },
  { name: "Dan User", role: AccessRole.USER },
  { name: "John Guest", role: AccessRole.GUEST },
];
