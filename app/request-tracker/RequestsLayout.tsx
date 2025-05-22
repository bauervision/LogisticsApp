"use client";

import FrequentLinks from "@/components/Requests/FrequentLinks";
import {
  Card,
  CardContent,
    CardDescription,
    CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { ReactNode, useEffect, useState } from "react";
import { useUser } from "../context/UserContext";


type NewLayoutProps = {
  children: ReactNode;
  title: string;
  pageComponents?: ReactNode[];
};

const RequestsLayout: React.FC<NewLayoutProps> = ({
  children,
  title,
  pageComponents,
}) => {
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userAccess =
    user?.IsAdmin
      ? "You can VIEW, ADD, CHANGE, or DELETE Records here."
      : " You can only VIEW records here.";

  return (
    <div
      className=" w-full min-h-screen flex flex-col "
      style={{ backgroundColor: "rgba(84, 72, 213, 1)" }}
    >
      <FrequentLinks />
      <div className="mx-auto w-11/12 py-4">
        {!isMounted && (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center text-lg font-semibold">Loading...</div>
          </div>
        )}

        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <div className="flex flex-row space-x-6 justify-between">
              <div>
                <CardTitle className="text-2xl">{title}</CardTitle>

                <CardDescription>{userAccess}</CardDescription>
              </div>
              {pageComponents && pageComponents.length > 0 && (
                <div className="flex flex-row space-x-6 justify-between items-center">
                  {React.Children.map(pageComponents, (child, index) => (
                    <div key={index}>{child}</div>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex-grow">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestsLayout;
