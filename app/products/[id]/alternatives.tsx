import { View, Text, Pressable, FlatList, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { SustainabilityBadge } from "@/components/sustainability-badge";
import { useColors } from "@/hooks/use-colors";
import { useScanHistory } from "@/lib/scan-history-context";
import { getProductById, getAlternatives, formatPrice, Product, GRADE_COLORS } from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

function ImprovementTag({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.improvementTag, { backgroundColor: color + "15" }]}>
      <MaterialIcons name="trending-up" size={12} color={color} />
      <Text style={[styles.improvementText, { color }]}>{text}</Text>
    </View>
  );
}

export default function AlternativesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { addScan } = useScanHistory();

  const product = getProductById(id);
  if (!product) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Product not found</Text>
      </ScreenContainer>
    );
  }

  const alternatives = getAlternatives(product);

  const getImprovements = (alt: Product): string[] => {
    const improvements: string[] = [];
    if (alt.carbonFootprint < product.carbonFootprint) {
      const reduction = Math.round(
        ((product.carbonFootprint - alt.carbonFootprint) / product.carbonFootprint) * 100
      );
      improvements.push(`${reduction}% less CO2`);
    }
    if (alt.packagingRecyclability > product.packagingRecyclability) {
      improvements.push(`${alt.packagingRecyclability}% recyclable`);
    }
    if (
      (alt.sourcing === "Local" && product.sourcing !== "Local") ||
      (alt.sourcing === "Regional" && product.sourcing === "Imported")
    ) {
      improvements.push("More local sourcing");
    }
    if (alt.score > product.score) {
      improvements.push(`Score: ${alt.score} vs ${product.score}`);
    }
    return improvements;
  };

  const renderAlternative = ({ item: alt }: { item: Product }) => {
    const improvements = getImprovements(alt);
    const gradeColors = GRADE_COLORS[alt.grade];

    return (
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          addScan(alt.id);
          router.push(`/products/${alt.id}` as any);
        }}
        style={({ pressed }) => [
          styles.altCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityLabel={`Alternative: ${alt.name} by ${alt.brand}, grade ${alt.grade}`}
        accessibilityRole="button"
      >
        <View style={styles.altCardTop}>
          <Image
            source={{ uri: alt.imageUrl }}
            style={styles.altImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.altInfo}>
            <Text style={[styles.altName, { color: colors.foreground }]} numberOfLines={1}>
              {alt.name}
            </Text>
            <Text style={[styles.altBrand, { color: colors.muted }]}>
              {alt.brand} · {alt.category}
            </Text>
            <Text style={[styles.altPrice, { color: colors.foreground }]}>
              {formatPrice(alt.price)}
            </Text>
            <View style={styles.altScoreRow}>
              <SustainabilityBadge grade={alt.grade} size="small" />
              <Text style={[styles.altScoreText, { color: gradeColors.bg }]}>
                {alt.score}/100
              </Text>
            </View>
          </View>
        </View>
        {improvements.length > 0 && (
          <View style={styles.improvementsRow}>
            {improvements.slice(0, 3).map((imp, i) => (
              <ImprovementTag key={i} text={imp} color={colors.success} />
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { backgroundColor: colors.surface },
            pressed && { opacity: 0.7 },
          ]}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialIcons name="chevron-left" size={28} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Greener Alternatives
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]} numberOfLines={1}>
            for {product.name}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Current product comparison bar */}
      <View
        style={[
          styles.currentBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.currentLabel, { color: colors.muted }]}>Current:</Text>
        <Text style={[styles.currentName, { color: colors.foreground }]} numberOfLines={1}>
          {product.name}
        </Text>
        <SustainabilityBadge grade={product.grade} size="small" />
      </View>

      {alternatives.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="eco" size={48} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Great Choice!
          </Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            This product already has a top sustainability rating. No greener alternatives needed!
          </Text>
        </View>
      ) : (
        <FlatList
          data={alternatives}
          renderItem={renderAlternative}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
  },
  currentBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  currentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  altCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  altCardTop: {
    flexDirection: "row",
    gap: 12,
  },
  altImage: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  altInfo: {
    flex: 1,
    gap: 4,
  },
  altName: {
    fontSize: 16,
    fontWeight: "700",
  },
  altBrand: {
    fontSize: 13,
  },
  altPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  altScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  altScoreText: {
    fontSize: 14,
    fontWeight: "700",
  },
  improvementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  improvementTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  improvementText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
