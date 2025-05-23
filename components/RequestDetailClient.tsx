// components/RequestDetailClient.tsx
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { DEFAULT_ROW_DATA } from "@/app/constants";
import RequestsLayout from "@/app/request-tracker/RequestsLayout";
import { RequestBreadcrumb } from "./Requests/RequestBreadcrumb";
import { RequestTabs } from "@/app/request-tracker/RequestTabs";

export default function RequestDetailClient() {
  // if you prefer, accept `id` as a prop:
  // export default function RequestDetailClient({ id }: { id: string }) { … }
  const { id } = useParams();

  const request = DEFAULT_ROW_DATA.find((r) => r.id.toString() === id);

  if (!request) {
    return <p>Request not found.</p>;
  }

  return (
    <div className="p-4">
      <RequestsLayout
        title={`Request ID: ${id}`}
        pageComponents={[<RequestBreadcrumb key="1" />]}
      >
        <RequestTabs />
      </RequestsLayout>
    </div>
  );
}
