import { createContext, useContext, type ReactNode } from "react";
import type { UserPose } from "@ar-poi/shared";
import { DEMO_FALLBACK } from "../config";
import { useUserPose } from "../hooks/useUserPose";

type PoseContextValue = {
  pose: UserPose | null;
  error: string | null;
  ready: boolean;
  isDemoFallback: boolean;
};

const PoseContext = createContext<PoseContextValue | null>(null);

export function PoseProvider({ children }: { children: ReactNode }) {
  const value = useUserPose(DEMO_FALLBACK);
  return <PoseContext.Provider value={value}>{children}</PoseContext.Provider>;
}

export function usePose(): PoseContextValue {
  const ctx = useContext(PoseContext);
  if (!ctx) {
    throw new Error("usePose must be used within PoseProvider");
  }
  return ctx;
}
