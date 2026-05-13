import { View, Text, StyleSheet } from "react-native";
import { SustainabilityGrade, GRADE_COLORS, GRADE_LABELS } from "@/lib/mock-data";

interface SustainabilityBadgeProps {
  grade: SustainabilityGrade;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const SIZES = {
  small: { container: 32, fontSize: 16, labelSize: 10 },
  medium: { container: 48, fontSize: 24, labelSize: 12 },
  large: { container: 80, fontSize: 40, labelSize: 14 },
};

export function SustainabilityBadge({
  grade,
  size = "medium",
  showLabel = false,
}: SustainabilityBadgeProps) {
  const colors = GRADE_COLORS[grade];
  const dims = SIZES[size];

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badge,
          {
            width: dims.container,
            height: dims.container,
            borderRadius: dims.container / 2,
            backgroundColor: colors.bg,
          },
        ]}
        accessibilityLabel={`Sustainability grade ${grade}: ${GRADE_LABELS[grade]}`}
      >
        <Text
          style={[
            styles.gradeText,
            { fontSize: dims.fontSize, color: colors.text },
          ]}
        >
          {grade}
        </Text>
      </View>
      {showLabel && (
        <Text
          style={[styles.label, { fontSize: dims.labelSize }]}
          className="text-muted"
        >
          {GRADE_LABELS[grade]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 4,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
  },
  gradeText: {
    fontWeight: "800",
  },
  label: {
    fontWeight: "600",
  },
});
