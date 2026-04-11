import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { fetchLabs } from "../api/labApi";
import { getSafeErrorMessage } from "../utils/errorHandler";

const CENTRE_KEY = "medilab.staffCenterId";
const CENTRE_NAME_KEY = "medilab.staffCenterName";

const LabCentreContext = createContext(null);

export function LabCentreProvider({ children }) {
  const [labs, setLabs] = useState([]);
  const [labsLoading, setLabsLoading] = useState(false);
  const [selectedCentreId, setSelectedCentreIdState] = useState(() => {
    try {
      return localStorage.getItem(CENTRE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [selectedCentreName, setSelectedCentreNameState] = useState(() => {
    try {
      return localStorage.getItem(CENTRE_NAME_KEY) || "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    let cancelled = false;
    setLabsLoading(true);
    fetchLabs()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : data?.labs || [];
          setLabs(list);
        }
      })
      .catch((err) => {
        if (!cancelled) toast.error(getSafeErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLabsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCentreSelect = (id, name) => {
    setSelectedCentreIdState(id);
    setSelectedCentreNameState(name);
    try {
      localStorage.setItem(CENTRE_KEY, id);
      localStorage.setItem(CENTRE_NAME_KEY, name);
    } catch {
      /* ignore */
    }
  };

  const handleCentreReset = () => {
    setSelectedCentreIdState("");
    setSelectedCentreNameState("");
    try {
      localStorage.removeItem(CENTRE_KEY);
      localStorage.removeItem(CENTRE_NAME_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <LabCentreContext.Provider
      value={{
        labs,
        labsLoading,
        selectedCentreId,
        selectedCentreName,
        handleCentreSelect,
        handleCentreReset,
      }}
    >
      {children}
    </LabCentreContext.Provider>
  );
}

export function useLabCentre() {
  const ctx = useContext(LabCentreContext);
  if (!ctx)
    throw new Error("useLabCentre must be used within LabCentreProvider");
  return ctx;
}

export default LabCentreContext;
