import React from "react";
import { Outlet } from "react-router-dom";
import LabTechnicianSidebar from "./LabTechnicianSidebar.jsx";
import TopBar from "./TopBar.jsx";
import { LabCentreProvider } from "../context/LabCentreContext.jsx";

function LabTechnicianLayout() {
  return (
    <LabCentreProvider>
      <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
        <LabTechnicianSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar showNotificationBell={false} />
          <main className="flex-1 overflow-y-auto px-10 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </LabCentreProvider>
  );
}

export default LabTechnicianLayout;
