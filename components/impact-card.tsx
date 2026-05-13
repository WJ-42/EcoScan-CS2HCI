import { View, Text, StyleSheet } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

interface ImpactCardProps {
  icon: "eco" | "recycling" | "public";
  label: string;
  value: string;
  detail: string;
  color?: string;
}

export function ImpactCard({ icon, label, value, detail, color }: ImpactCardProps) {
  const colors = useColors();
  const iconColor = color || colors.primary;

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityLabel={`${label}: ${value}, ${detail}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + "18" }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.detail, { color: colors.muted }]} numberOfLines={1}>
        {detail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
  },
  detail: {
    fontSize: 11,
  },
});
