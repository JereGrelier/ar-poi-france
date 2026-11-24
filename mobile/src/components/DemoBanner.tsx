import { StyleSheet, Text, View } from "react-native";

type Props = {
  visible: boolean;
  message?: string;
};

export function DemoBanner({
  visible,
  message = "Mode démo — position Paris (Tour Eiffel)",
}: Props) {
  if (!visible) return null;
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#C4A35A",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    color: "#0B1F17",
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
});
