"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PlanType = "Standart" | "Pro" | "Pro Plus";

interface PlanContextType {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<PlanType>("Pro Plus");

  // Sayfa yüklendiğinde localStorage'dan mevcut planı al
  useEffect(() => {
    const saved = localStorage.getItem("opticut_plan") as PlanType;
    if (saved && ["Standart", "Pro", "Pro Plus"].includes(saved)) {
      setPlan(saved);
    }
  }, []);

  const updatePlan = (newPlan: PlanType) => {
    setPlan(newPlan);
    localStorage.setItem("opticut_plan", newPlan);
    // Diğer sekmelere de haber ver (opsiyonel)
    window.dispatchEvent(new Event("plan-changed"));
  };

  return (
    <PlanContext.Provider value={{ plan, setPlan: updatePlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}
