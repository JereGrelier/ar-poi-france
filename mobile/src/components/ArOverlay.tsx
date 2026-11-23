import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { CAMERA_HALF_FOV_DEG } from "../config";
import { projectToScreen } from "../geo/math";
import type { Poi, UserPose } from "../types";

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

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {pois.map((poi) => {
        const projection = projectToScreen({
          userLat: pose.latitude,
          userLon: pose.longitude,
          heading: pose.heading,
          poiLat: poi.latitude,
          poiLon: poi.longitude,
          screenWidth: width,
          screenHeight: height,
          halfFovDeg: CAMERA_HALF_FOV_DEG,
        });
        if (!projection.visible) return null;

        return (
          <Pressable
            key={poi.id}
            onPress={() => onSelect(poi)}
            style={[
              styles.label,
              {
                left: projection.x - 70,
                top: projection.y,
                transform: [{ scale: projection.scale }],
              },
            ]}
          >
            <Text style={styles.name} numberOfLines={2}>
              {poi.name}
            </Text>
            <Text style={styles.meta}>{formatDistance(projection.distanceM)}</Text>
          </Pressable>
        );
      })}
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
