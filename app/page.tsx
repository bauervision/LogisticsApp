"use client";

import Image from "next/image";
import Background from "/assets/branding/visionary.png";
import { clearLinkClicks, getFrequentLinks } from "./utils/trackLinkClicks";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "./context/UserContext";
import { useSchema } from "./context/SchemaContext";
import FrequentLinks from "@/components/Requests/FrequentLinks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RequestsLayout from "./request-tracker/RequestsLayout";
import TaskSheet from "@/components/TaskSheet";

export default function Home() {
  const { user, setUser } = useUser();

  const { clearLocalData } = useSchema();
  const [links, setLinks] = useState<string[]>([]);

  // useEffect(() => {
  //   clearLinkClicks(); // Clear the link clicks when the component mounts
  //   setLinks(getFrequentLinks());
  //   localStorage.clear();
  //   clearLocalData();
  // }, []);

  return (
    <RequestsLayout title="Catēna Home Page" pageComponents={[<TaskSheet />]}>
      <div className="flex h-screen items-start justify-center">
        <div className="text-center text-lg font-semibold">
          Welcome to Catēna!
        </div>
      </div>
    </RequestsLayout>
  );
}
