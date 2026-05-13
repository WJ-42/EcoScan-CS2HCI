import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Product, formatPrice } from "@/lib/mock-data";
import { SustainabilityBadge } from "./sustainability-badge";
import { useColors } from "@/hooks/use-colors";
import { useAccessibility } from "@/hooks/use-accessibility";
import * as Haptics from "expo-haptics";

interface ProductCardProps {
  product: Product;
  variant?: "horizontal" | "compact";
  subtitle?: string;
}

export function ProductCard({ product, variant = "horizontal", subtitle }: ProductCardProps) {
  const router = useRouter();
  const colors = useColors();
  const { scaleFontSize, minTouchTarget } = useAccessibility();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/products/${product.id}` as any);
  };

  if (variant === "compact") {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            minHeight: minTouchTarget,
          },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityLabel={`${product.name} by ${product.brand}, grade ${product.grade}`}
        accessibilityRole="button"
      >
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.compactImage}
          contentFit="cover"
          transition={200}
        />
        <Text
          style={[styles.compactName, { color: colors.foreground, fontSize: scaleFontSize(13) }]}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text style={[styles.compactPrice, { color: colors.foreground, fontSize: scaleFontSize(12) }]}>
          {formatPrice(product.price)}
        </Text>
        <SustainabilityBadge grade={product.grade} size="small" />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.horizontalCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          minHeight: minTouchTarget,
        },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityLabel={`${product.name} by ${product.brand}, grade ${product.grade}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.horizontalImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.horizontalContent}>
        <Text
          style={[styles.productName, { color: colors.foreground, fontSize: scaleFontSize(15) }]}
          numberOfLines={1}
        >
          {product.name}
        </Text>
        <Text
          style={[styles.productBrand, { color: colors.muted, fontSize: scaleFontSize(13) }]}
          numberOfLines={1}
        >
          {product.brand}
          {subtitle ? ` · ${subtitle}` : ""}
        </Text>
        <Text style={[styles.productPrice, { color: colors.foreground, fontSize: scaleFontSize(14) }]}>
          {formatPrice(product.price)}
        </Text>
      </View>
      <SustainabilityBadge grade={product.grade} size="small" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    width: 130,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 8,
    marginRight: 12,
  },
  compactImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  compactName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  compactPrice: {
    fontSize: 12,
    fontWeight: "700",
  },
  horizontalCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  horizontalImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  horizontalContent: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
  },
  productBrand: {
    fontSize: 13,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
});
