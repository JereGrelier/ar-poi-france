import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchNearbyPois } from "../api/pois";
import { FilterBar } from "../components/FilterBar";
import { DEFAULT_RADIUS_M } from "../config";
import { haversineMeters } from "../geo/math";
import type { RootStackParamList } from "../navigation/types";
import { usePose } from "../pose/PoseContext";
import type { Poi } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "List">;

export function ListScreen({ navigation }: Props) {
  const { pose, error: poseError, ready } = usePose();
  const [radiusMeters, setRadiusMeters] = useState(DEFAULT_RADIUS_M);
  const [typeFilter, setTypeFilter] = useState("");
  const [pois, setPois] = useState<Poi[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = pose?.latitude;
  const lon = pose?.longitude;

  const load = useCallback(async (signal?: AbortSignal) => {
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
      setSource(response.meta.source);
    } catch (e) {
      if (signal?.aborted) return;
      setError(e instanceof Error ? e.message : "Erreur chargement POI");
      setPois([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [lat, lon, radiusMeters, typeFilter]);

  useEffect(() => {
    if (!ready || lat == null || lon == null) return;
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [ready, lat, lon, load]);
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.brand}>AR POI France</Text>
        <Text style={styles.sub}>
          DATAtourisme · {source || "…"}
          {pose
            ? ` · ${pose.latitude.toFixed(4)}, ${pose.longitude.toFixed(4)}`
            : ""}
        </Text>
        {(poseError || error) && (
          <Text style={styles.warn}>{poseError ?? error}</Text>
        )}
      </View>

      <FilterBar
        radiusMeters={radiusMeters}
        typeFilter={typeFilter}
        onRadiusChange={setRadiusMeters}
        onTypeChange={setTypeFilter}
      />

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={styles.primary}
          onPress={() => navigation.navigate("Ar")}
        >
          <Text style={styles.primaryText}>Vue RA</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          style={styles.secondary}
          onPress={() => void load()}
        >
          <Text style={styles.secondaryText}>Rafraîchir</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#C4A35A" style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={pois}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Aucun POI dans ce rayon.</Text>
          }
          renderItem={({ item }) => {
            const distance = pose
              ? haversineMeters(
                  pose.latitude,
                  pose.longitude,
                  item.latitude,
                  item.longitude,
                )
              : null;
            return (
              <Pressable
                style={styles.row}
                onPress={() =>
                  navigation.navigate("PoiDetail", { poiId: item.id, poi: item })
                }
              >
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowMeta}>
                  {item.types.slice(0, 2).join(" · ") || "POI"}
                  {distance != null ? ` · ${Math.round(distance)} m` : ""}
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1F17" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  brand: {
    color: "#F4F0E6",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sub: { color: "rgba(244,240,230,0.65)", marginTop: 4, fontSize: 12 },
  warn: { color: "#E0A060", marginTop: 6, fontSize: 12 },
  actions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primary: {
    flex: 1,
    backgroundColor: "#C4A35A",
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: { color: "#0B1F17", fontWeight: "700" },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(244,240,230,0.3)",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#F4F0E6" },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  empty: { color: "rgba(244,240,230,0.5)", textAlign: "center", marginTop: 40 },
  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(244,240,230,0.15)",
  },
  rowTitle: { color: "#F4F0E6", fontSize: 16, fontWeight: "600" },
  rowMeta: { color: "rgba(244,240,230,0.55)", marginTop: 4, fontSize: 12 },
});
