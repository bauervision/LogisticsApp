"use client";

import PublicFooter from "@/components/PublicFooter";
import React from "react";

import ScrollingSections from "@/components/ScrollingSection";
import BackToTop from "@/components/BackToTop";
import LoginDialog from "@/components/LoginDialog";

const PublicLanding: React.FC = () => {
  return (
    <>
      <main className="  bg-violet-900">
        <h1 className="text-5xl font-bold text-center p-4 text-white">
          Welcome to Logistics Planet
        </h1>
        <LoginDialog />
        <ScrollingSections />
      </main>

      <PublicFooter />
      <BackToTop />
    </>
  );
};

export default PublicLanding;
