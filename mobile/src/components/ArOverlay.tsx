import { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { Poi, UserPose } from "@ar-poi/shared";
import { CAMERA_HALF_FOV_H_DEG, CAMERA_HALF_FOV_V_DEG } from "../config";
import { projectToScreen, resolveLabelCollisions } from "../geo/math";

type Props = {
  pois: Poi[];
  pose: UserPose;
  onSelect: (poi: Poi) => void;
};

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function ArOverlay({ pois, pose, onSelect }: Props) {
  const { width, height } = useWindowDimensions();

  const labels = useMemo(() => {
    const candidates = [];
    const byId = new Map<string, Poi>();
    for (const poi of pois) {
      byId.set(poi.id, poi);
      const projection = projectToScreen({
        userLat: pose.latitude,
        userLon: pose.longitude,
        heading: pose.heading,
        pitch: pose.pitch,
        poiLat: poi.latitude,
        poiLon: poi.longitude,
        screenWidth: width,
        screenHeight: height,
        halfFovHDeg: CAMERA_HALF_FOV_H_DEG,
        halfFovVDeg: CAMERA_HALF_FOV_V_DEG,
      });
      if (!projection.visible) continue;
      candidates.push({
        id: poi.id,
        x: projection.x,
        y: projection.y,
        scale: projection.scale,
        distanceM: projection.distanceM,
      });
    }
    return resolveLabelCollisions(candidates).map((placed) => ({
      ...placed,
      poi: byId.get(placed.id)!,
    }));
  }, [pois, pose, width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {labels.map((label) => (
        <Pressable
          key={label.id}
          onPress={() => onSelect(label.poi)}
          style={[
            styles.label,
            {
              left: label.x - 70,
              top: label.y,
              transform: [{ scale: label.scale }],
            },
          ]}
        >
          <Text style={styles.name} numberOfLines={2}>
            {label.poi.name}
          </Text>
          <Text style={styles.meta}>{formatDistance(label.distanceM)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    position: "absolute",
    width: 140,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(11, 31, 23, 0.82)",
    borderLeftWidth: 3,
    borderLeftColor: "#C4A35A",
  },
  name: {
    color: "#F4F0E6",
    fontSize: 13,
    fontWeight: "600",
  },
  meta: {
    color: "#C4A35A",
    fontSize: 11,
    marginTop: 2,
  },
});
