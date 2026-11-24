import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Poi } from "@ar-poi/shared";
import { fetchPoiById } from "../api/pois";
import { AttributionFooter } from "../components/AttributionFooter";
import { useFilters } from "../filters/FiltersContext";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PoiDetail">;

export function PoiDetailScreen({ route }: Props) {
  const { poiId, poi: initial } = route.params;
  const { meta } = useFilters();
  const [poi, setPoi] = useState<Poi | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await fetchPoiById(poiId);
        if (!cancelled) {
          setPoi(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur détail");
          if (!initial) setPoi(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [poiId, initial]);

  if (loading && !poi) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#C4A35A" />
      </View>
    );
  }

  if (!poi) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error ?? "POI introuvable"}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {poi.imageUrl ? (
          <Image
            source={{ uri: poi.imageUrl }}
            style={styles.image}
            accessibilityLabel={poi.name}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>DATAtourisme</Text>
          </View>
        )}
        <Text style={styles.title}>{poi.name}</Text>
        <Text style={styles.types}>
          {poi.types.length ? poi.types.join(" · ") : "Point d'intérêt"}
        </Text>
        {poi.address ? <Text style={styles.address}>{poi.address}</Text> : null}
        <Text style={styles.coords}>
          {poi.latitude.toFixed(5)}, {poi.longitude.toFixed(5)}
        </Text>
        {poi.description ? (
          <Text style={styles.description}>{poi.description}</Text>
        ) : (
          <Text style={styles.description}>Pas de description disponible.</Text>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {loading ? (
          <ActivityIndicator color="#C4A35A" style={{ marginTop: 12 }} />
        ) : null}
      </ScrollView>
      <AttributionFooter source={meta?.source} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B1F17" },
  center: {
    flex: 1,
    backgroundColor: "#0B1F17",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: 16, paddingBottom: 40 },
  image: { width: "100%", height: 200, marginBottom: 16 },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    marginBottom: 16,
    backgroundColor: "#163528",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: { color: "#C4A35A", fontWeight: "600" },
  title: { color: "#F4F0E6", fontSize: 24, fontWeight: "700" },
  types: { color: "#C4A35A", marginTop: 8, fontSize: 13 },
  address: { color: "rgba(244,240,230,0.75)", marginTop: 10, fontSize: 14 },
  coords: { color: "rgba(244,240,230,0.45)", marginTop: 6, fontSize: 12 },
  description: {
    color: "#F4F0E6",
    marginTop: 18,
    fontSize: 15,
    lineHeight: 22,
  },
  error: { color: "#E0A060", marginTop: 12 },
});
