import React from "react";
import { AlertProvider } from "@/contexts/AlertContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}
