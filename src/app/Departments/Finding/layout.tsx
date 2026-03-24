"use client";

import React from "react";
import Sidebar from "@/components/layouts/sidebar/DashBoardSidebar";
import Header from "@/components/layouts/header/DashboardHeader";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-[260px] flex-shrink-0">
        <Sidebar />
      </div>

      {/* Right Section */}
      <div className="flex flex-col flex-1">

        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 p-6 bg-gray-100 mt-20 w-full">
          {children}
        </main>

      </div>

    </div>
  );
};

export default Layout;