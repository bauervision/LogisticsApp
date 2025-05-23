import { RequestBreadcrumb } from "@/components/Requests/RequestBreadcrumb";
import React from "react";

import { RequestTabs } from "../RequestTabs";
import RequestsLayout from "../RequestsLayout";
import { DEFAULT_ROW_DATA } from "@/app/constants";

interface Params {
  id: string;
}

export function generateStaticParams(): Params[] {
  return DEFAULT_ROW_DATA.map((r) => ({
    id: r.id.toString(),
  }));
}

function SingleRequest({ params }: { params: { id: string } }) {
  return (
    <RequestsLayout
      title={`Request ID: ${params.id}`}
      pageComponents={[<RequestBreadcrumb key="1" />]}
    >
      <RequestTabs />
    </RequestsLayout>
  );
}

export default SingleRequest;
