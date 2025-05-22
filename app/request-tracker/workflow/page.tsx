"use client";

import RequestsLayout from "@/app/request-tracker/RequestsLayout";
import React from "react";
import WorkflowComponent from "@/components/Workflows/WorkflowComponent";
import WorkflowDropdown from "@/components/Workflows/SavedWorkflowsDropdown";

function Workflows() {
  return (
    <RequestsLayout
      title="Logistics Planet Workflow Management"
      // eslint-disable-next-line react/jsx-key
      pageComponents={[<WorkflowDropdown />]}
    >
      <WorkflowComponent />
    </RequestsLayout>
  );
}

export default Workflows;
