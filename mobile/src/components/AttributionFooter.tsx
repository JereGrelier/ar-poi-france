import { StyleSheet, Text, View } from "react-native";

type Props = {
  source: string | null | undefined;
};

export function AttributionFooter({ source }: Props) {
  if (source !== "datatourisme") return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        Données © DATAtourisme / ADN Tourisme — Licence Ouverte 2.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(244,240,230,0.15)",
  },
  text: {
    color: "rgba(244,240,230,0.45)",
    fontSize: 10,
    textAlign: "center",
  },
});
