import { useIsFocused } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchNearbyPois } from "../api/pois";
import { ArOverlay } from "../components/ArOverlay";
import { FilterBar } from "../components/FilterBar";
import { DEFAULT_RADIUS_M } from "../config";
import type { RootStackParamList } from "../navigation/types";
import { usePose } from "../pose/PoseContext";
import type { Poi } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Ar">;

export function ArScreen({ navigation }: Props) {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const { pose, error: poseError, ready } = usePose();
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_M);
  const [typeFilter, setTypeFilter] = useState("");
  const [pois, setPois] = useState<Poi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lat = pose?.latitude;
  const lon = pose?.longitude;

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (lat == null || lon == null) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchNearbyPois({
          latitude: lat,
          longitude: lon,
          radiusMeters,
          type: typeFilter || undefined,
          signal,
        });
        if (signal?.aborted) return;
        setPois(response.data);
      } catch (e) {
        if (signal?.aborted) return;
        setError(e instanceof Error ? e.message : "Erreur POI");
        setPois([]);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [lat, lon, radiusMeters, typeFilter],
  );

  useEffect(() => {
    if (!ready || lat == null || lon == null) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [ready, lat, lon, load]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#C4A35A" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.message}>Accès caméra requis pour la vue RA.</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => void requestPermission()}
        >
          <Text style={styles.buttonText}>Autoriser la caméra</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {isFocused ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.cameraOff]} />
      )}
      {pose && (
        <ArOverlay
          pois={pois}
          pose={pose}
          onSelect={(poi) =>
            navigation.navigate("PoiDetail", { poiId: poi.id, poi })
          }
        />
      )}

      <SafeAreaView style={styles.hud} pointerEvents="box-none">
        <FilterBar
          radiusMeters={radiusMeters}
          typeFilter={typeFilter}
          onRadiusChange={setRadiusMeters}
          onTypeChange={setTypeFilter}
        />
        <View style={styles.topRow}>
          <Pressable
            accessibilityRole="button"
            style={styles.back}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Liste</Text>
          </Pressable>
          <Text style={styles.hudMeta}>
            {loading ? "…" : `${pois.length} POI`}
            {pose ? ` · cap ${Math.round(pose.heading)}°` : ""}
          </Text>
        </View>
        {(poseError || error) && (
          <Text style={styles.warn}>{poseError ?? error}</Text>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  cameraOff: { backgroundColor: "#000" },
  center: {
    flex: 1,
    backgroundColor: "#0B1F17",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  message: { color: "#F4F0E6", textAlign: "center", marginBottom: 16 },
  button: {
    backgroundColor: "#C4A35A",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: { color: "#0B1F17", fontWeight: "700" },
  hud: { ...StyleSheet.absoluteFill },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  back: {
    backgroundColor: "rgba(11,31,23,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: { color: "#F4F0E6", fontWeight: "600" },
  hudMeta: {
    color: "#F4F0E6",
    backgroundColor: "rgba(11,31,23,0.7)",
    padding: 6,
  },
  warn: {
    color: "#E0A060",
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: "rgba(11,31,23,0.8)",
    padding: 8,
  },
});
