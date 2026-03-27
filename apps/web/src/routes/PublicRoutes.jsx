import React, { useState } from "react";
import HomePage from "../pages/HomePage";
import HealthCentersPage from "../pages/HealthCentersPage";
import LabDetailsPage from "../pages/LabDetailsPage";

function PublicRoutes() {
  const [route, setRoute] = useState({ name: "home", params: {} });

  const navigate = (name, params = {}) => setRoute({ name, params });

  // This is a very small internal router for the public site. Integrate with React Router later if needed.
  switch (route.name) {
    case "home":
      return <HomePage />;
    case "health-centers":
      return <HealthCentersPage />;
    case "lab":
      return <LabDetailsPage labId={route.params.labId} />;
    default:
      return <HomePage />;
  }
}

export default PublicRoutes;
