import { View, Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 20,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const colors = useColors();

  return (
    <View style={styles.container} accessibilityLabel={`Rating: ${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        const starColor = filled ? "#EAB308" : colors.border;

        if (interactive) {
          return (
            <Pressable
              key={i}
              onPress={() => onRate?.(i + 1)}
              style={({ pressed }) => [
                styles.star,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityLabel={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
              accessibilityRole="button"
            >
              <IconSymbol
                name={filled ? "star.fill" : "star"}
                size={size}
                color={starColor}
              />
            </Pressable>
          );
        }

        return (
          <View key={i} style={styles.star}>
            <IconSymbol
              name={filled ? "star.fill" : "star"}
              size={size}
              color={starColor}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
});
