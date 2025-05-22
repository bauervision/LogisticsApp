import React from "react";
import RequestsLayout from "../RequestsLayout";
import OrderRequestForm from "@/components/OrderRequestForm";

function NewRequestPage() {
  return (
    <RequestsLayout title="Logistics Planet Administration: New Order Request">
      <OrderRequestForm />
    </RequestsLayout>
  );
}

export default NewRequestPage;
