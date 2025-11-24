import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AlertContextType {
  alertsEnabled: boolean;
  setAlertsEnabled: (enabled: boolean) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const ALERTS_KEY = "caffeine_alerts_enabled";
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(ALERTS_KEY);
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, alertsEnabled.toString());
  }, [alertsEnabled]);

  return (
    <AlertContext.Provider value={{ alertsEnabled, setAlertsEnabled }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlertSetting() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlertSetting must be used within AlertProvider");
  return ctx;
}
