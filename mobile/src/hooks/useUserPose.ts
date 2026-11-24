import { DeviceMotion } from "expo-sensors";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import type { UserPose } from "@ar-poi/shared";
import { DEMO_FALLBACK } from "../config";

type PoseState = {
  pose: UserPose | null;
  error: string | null;
  ready: boolean;
  isDemoFallback: boolean;
};

const FALLBACK_PARIS: UserPose = {
  latitude: 48.8584,
  longitude: 2.2945,
  heading: 0,
  pitch: 0,
};

export function useUserPose(allowFallback = DEMO_FALLBACK): PoseState {
  const [pose, setPose] = useState<UserPose | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isDemoFallback, setIsDemoFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let locSub: Location.LocationSubscription | null = null;
    let headSub: Location.LocationSubscription | null = null;
    let motionSub: { remove: () => void } | null = null;

    async function start() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          if (allowFallback) {
            setPose(FALLBACK_PARIS);
            setIsDemoFallback(true);
            setReady(true);
            setError("Localisation refusée — mode démo Paris (Tour Eiffel)");
            return;
          }
          setError("Permission localisation refusée");
          setReady(true);
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (cancelled) return;

        setPose({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          heading:
            typeof current.coords.heading === "number" &&
            current.coords.heading >= 0
              ? current.coords.heading
              : 0,
          pitch: 0,
        });
        setIsDemoFallback(false);
        setReady(true);

        locSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (update) => {
            setPose((prev) => ({
              latitude: update.coords.latitude,
              longitude: update.coords.longitude,
              heading: prev?.heading ?? 0,
              pitch: prev?.pitch ?? 0,
            }));
          },
        );
        if (cancelled) {
          locSub.remove();
          return;
        }

        headSub = await Location.watchHeadingAsync((heading) => {
          const value =
            typeof heading.trueHeading === "number" && heading.trueHeading >= 0
              ? heading.trueHeading
              : heading.magHeading;
          setPose((prev) => (prev ? { ...prev, heading: value } : prev));
        });
        if (cancelled) {
          headSub.remove();
          locSub.remove();
          return;
        }

        DeviceMotion.setUpdateInterval(100);
        motionSub = DeviceMotion.addListener((data) => {
          const beta = data.rotation?.beta;
          if (typeof beta !== "number" || Number.isNaN(beta)) return;
          const pitchDeg = (beta * 180) / Math.PI;
          setPose((prev) => (prev ? { ...prev, pitch: pitchDeg } : prev));
        });
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Erreur localisation";
        if (allowFallback) {
          setPose(FALLBACK_PARIS);
          setIsDemoFallback(true);
          setError(`${message} — mode démo Paris`);
        } else {
          setError(message);
        }
        setReady(true);
      }
    }

    void start();

    return () => {
      cancelled = true;
      locSub?.remove();
      headSub?.remove();
      motionSub?.remove();
    };
  }, [allowFallback]);

  return { pose, error, ready, isDemoFallback };
}
