import * as Location from "expo-location";
import { useEffect, useState } from "react";
import type { UserPose } from "../types";

type PoseState = {
  pose: UserPose | null;
  error: string | null;
  ready: boolean;
};

const FALLBACK_PARIS: UserPose = {
  latitude: 48.8584,
  longitude: 2.2945,
  heading: 0,
};

export function useUserPose(useFallback = false): PoseState {
  const [pose, setPose] = useState<UserPose | null>(
    useFallback ? FALLBACK_PARIS : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(useFallback);

  useEffect(() => {
    let cancelled = false;
    let locSub: Location.LocationSubscription | null = null;
    let headSub: Location.LocationSubscription | null = null;

    async function start() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== "granted") {
          if (useFallback) {
            setPose(FALLBACK_PARIS);
            setReady(true);
            setError("Localisation refusée — fallback Paris (Tour Eiffel)");
            return;
          }
          setError("Permission localisation refusée");
          setReady(true);
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
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
        });
        setReady(true);

        locSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 5,
            timeInterval: 2000,
          },
          (update) => {
            setPose((prev) => ({
              latitude: update.coords.latitude,
              longitude: update.coords.longitude,
              heading: prev?.heading ?? 0,
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
        }
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : "Erreur localisation";
        if (useFallback) {
          setPose(FALLBACK_PARIS);
          setError(`${message} — fallback Paris`);
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
    };
  }, [useFallback]);

  return { pose, error, ready };
}
