import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RADIUS_OPTIONS_M, TYPE_FILTERS } from "../config";

type Props = {
  radiusMeters: number;
  typeFilter: string;
  onRadiusChange: (radius: number) => void;
  onTypeChange: (type: string) => void;
};

export function FilterBar({
  radiusMeters,
  typeFilter,
  onRadiusChange,
  onTypeChange,
}: Props) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {RADIUS_OPTIONS_M.map((radius) => {
          const active = radius === radiusMeters;
          return (
            <Pressable
              key={radius}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onRadiusChange(radius)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {radius >= 1000 ? `${radius / 1000} km` : `${radius} m`}
              </Text>
            </Pressable>
          );
        })}
        <View style={styles.sep} />
        {TYPE_FILTERS.map((filter) => {
          const active = filter.value === typeFilter;
          return (
            <Pressable
              key={filter.label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onTypeChange(filter.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "rgba(11, 31, 23, 0.88)",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(244, 240, 230, 0.25)",
  },
  chipActive: {
    backgroundColor: "#C4A35A",
    borderColor: "#C4A35A",
  },
  chipText: {
    color: "#F4F0E6",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#0B1F17",
    fontWeight: "700",
  },
  sep: {
    width: 1,
    marginHorizontal: 6,
    backgroundColor: "rgba(244, 240, 230, 0.2)",
  },
});
