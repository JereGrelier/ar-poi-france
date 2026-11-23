import { createContext, useContext, type ReactNode } from "react";
import { useUserPose } from "../hooks/useUserPose";
import type { UserPose } from "../types";

type PoseContextValue = {
  pose: UserPose | null;
  error: string | null;
  ready: boolean;
};

const PoseContext = createContext<PoseContextValue | null>(null);

export function PoseProvider({ children }: { children: ReactNode }) {
  const value = useUserPose(true);
  return <PoseContext.Provider value={value}>{children}</PoseContext.Provider>;
}

export function usePose(): PoseContextValue {
  const ctx = useContext(PoseContext);
  if (!ctx) {
    throw new Error("usePose must be used within PoseProvider");
  }
  return ctx;
}
