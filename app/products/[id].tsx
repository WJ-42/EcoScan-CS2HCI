import { ScrollView, View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { SustainabilityBadge } from "@/components/sustainability-badge";
import { ImpactCard } from "@/components/impact-card";
import { StarRating } from "@/components/star-rating";
import { ProductCard } from "@/components/product-card";
import { Collapsible } from "@/components/ui/collapsible";
import { useColors } from "@/hooks/use-colors";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useScanHistory } from "@/lib/scan-history-context";
import {
  getProductById,
  getAlternatives,
  getReviewsForProduct,
  formatPrice,
  GRADE_COLORS,
  GRADE_LABELS,
} from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { scaleFontSize, minTouchTarget } = useAccessibility();
  const { isFavorite, toggleFavorite, userReviews } = useScanHistory();

  const product = getProductById(id);
  if (!product) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Product not found</Text>
      </ScreenContainer>
    );
  }

  const alternatives = getAlternatives(product);
  const mockReviews = getReviewsForProduct(product.id);
  const userProductReviews = userReviews.filter((r) => r.productId === product.id);
  const allReviews = [...userProductReviews, ...mockReviews];
  const favorite = isFavorite(product.id);
  const gradeColors = GRADE_COLORS[product.grade];

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: colors.surface, minHeight: minTouchTarget, minWidth: minTouchTarget },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialIcons name="chevron-left" size={28} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              styles.favoriteButton,
              { backgroundColor: colors.surface, minHeight: minTouchTarget, minWidth: minTouchTarget },
              pressed && { opacity: 0.7 },
            ]}
            accessibilityLabel={favorite ? "Remove from favorites" : "Add to favorites"}
            accessibilityRole="button"
          >
            <MaterialIcons
              name={favorite ? "favorite" : "favorite-border"}
              size={24}
              color={favorite ? colors.error : colors.muted}
            />
          </Pressable>
        </View>

        {/* Product Hero */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroInfo}>
            <Text
              style={[styles.productCategory, { color: colors.muted, fontSize: scaleFontSize(12) }]}
            >
              {product.category}
            </Text>
            <Text
              style={[styles.productName, { color: colors.foreground, fontSize: scaleFontSize(22) }]}
            >
              {product.name}
            </Text>
            <Text
              style={[styles.productBrand, { color: colors.muted, fontSize: scaleFontSize(14) }]}
            >
              {product.brand}
            </Text>
            <Text
              style={[styles.productPrice, { color: colors.foreground, fontSize: scaleFontSize(18) }]}
            >
              {formatPrice(product.price)}
            </Text>
          </View>
        </View>

        {/* Sustainability Score */}
        <View
          style={[
            styles.scoreCard,
            { backgroundColor: gradeColors.bg + "12", borderColor: gradeColors.bg + "30" },
          ]}
        >
          <SustainabilityBadge grade={product.grade} size="large" />
          <View style={styles.scoreInfo}>
            <Text style={[styles.scoreTitle, { color: colors.foreground }]}>
              Sustainability Score
            </Text>
            <Text style={[styles.scoreValue, { color: gradeColors.bg }]}>
              {product.score}/100
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.muted }]}>
              {GRADE_LABELS[product.grade]}
            </Text>
          </View>
        </View>

        {/* What this score means */}
        <View style={styles.scoreExplanation}>
          <Collapsible title="What this score means">
            <Text style={[styles.scoreExplanationText, { color: colors.muted }]}>
              <Text style={{ fontWeight: "bold" }}>Rates carbon footprint, packaging, and sourcing:{"\n"}</Text>
              A (80–100) excellent, B (60–79) good, C (40–59) moderate, D (20–39) poor, E (0–19)
              very poor.
            </Text>
          </Collapsible>
        </View>

        {/* Certifications */}
        {product.certifications.length > 0 && (
          <View style={styles.certRow}>
            {product.certifications.map((cert) => (
              <View
                key={cert}
                style={[styles.certBadge, { backgroundColor: colors.primary + "15" }]}
              >
                <MaterialIcons name="check-circle" size={14} color={colors.primary} />
                <Text style={[styles.certText, { color: colors.primary }]}>{cert}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Impact Cards */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Environmental Impact
        </Text>
        <View style={styles.impactRow}>
          <ImpactCard
            icon="eco"
            label="Carbon"
            value={`${product.carbonFootprint}`}
            detail="kg CO2e"
            color={product.carbonFootprint < 1 ? colors.success : product.carbonFootprint < 2 ? colors.warning : colors.error}
          />
          <ImpactCard
            icon="recycling"
            label="Packaging"
            value={`${product.packagingRecyclability}%`}
            detail="Recyclable"
            color={product.packagingRecyclability >= 70 ? colors.success : product.packagingRecyclability >= 40 ? colors.warning : colors.error}
          />
          <ImpactCard
            icon="public"
            label="Sourcing"
            value={product.sourcing}
            detail={product.sourcing === "Local" ? "Low transport" : product.sourcing === "Imported" ? "High transport" : "Medium"}
            color={product.sourcing === "Local" ? colors.success : product.sourcing === "Imported" ? colors.error : colors.warning}
          />
        </View>

        {/* Greener Alternative */}
        {alternatives.length > 0 && (
          <>
            <Pressable
          onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push(`/products/${product.id}/alternatives` as any);
            }}
            style={({ pressed }) => [pressed && { opacity: 0.8 }]}
            >
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Greener Alternatives
                </Text>
                <View style={styles.seeAllRow}>
                  <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
                  <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
                </View>
              </View>
            </Pressable>
            <View style={styles.alternativePreview}>
              {alternatives.slice(0, 2).map((alt) => (
                <ProductCard
                  key={alt.id}
                  product={alt}
                  subtitle={`Score: ${alt.score}/100`}
                />
              ))}
            </View>
          </>
        )}

        {/* Reviews Summary */}
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push(`/products/${product.id}/reviews` as any);
          }}
          style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Community Reviews
            </Text>
            <View style={styles.seeAllRow}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                {allReviews.length} Reviews
              </Text>
              <MaterialIcons name="chevron-right" size={18} color={colors.primary} />
            </View>
          </View>
        </Pressable>
        <View
          style={[
            styles.reviewSummary,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.reviewSummaryLeft}>
            <Text style={[styles.reviewAvg, { color: colors.foreground }]}>
              {product.averageRating.toFixed(1)}
            </Text>
            <StarRating rating={product.averageRating} size={18} />
            <Text style={[styles.reviewCount, { color: colors.muted }]}>
              {allReviews.length} reviews
            </Text>
          </View>
          <Pressable
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push(`/products/${product.id}/write-review` as any);
            }}
            style={({ pressed }) => [
              styles.writeReviewButton,
              { backgroundColor: colors.primary },
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
            accessibilityLabel="Write a review"
            accessibilityRole="button"
          >
            <MaterialIcons name="edit" size={18} color="#FFFFFF" />
            <Text style={styles.writeReviewText}>Write Review</Text>
          </Pressable>
        </View>

        {/* Preview of latest reviews */}
        {allReviews.slice(0, 2).map((review) => (
          <View
            key={review.id}
            style={[
              styles.reviewPreview,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.reviewPreviewHeader}>
              <View
                style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}
              >
                <Text style={[styles.avatarText, { color: colors.primary }]}>
                  {review.userAvatar}
                </Text>
              </View>
              <View style={styles.reviewPreviewMeta}>
                <Text style={[styles.reviewerName, { color: colors.foreground }]}>
                  {review.userName}
                </Text>
                <StarRating rating={review.rating} size={14} />
              </View>
            </View>
            <Text
              style={[styles.reviewPreviewText, { color: colors.muted }]}
              numberOfLines={2}
            >
              {review.comment}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  favoriteButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  productCategory: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  productBrand: {
    fontSize: 14,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "800",
  },
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  scoreInfo: {
    flex: 1,
    gap: 4,
  },
  scoreTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  scoreExplanation: {
    marginBottom: 20,
  },
  scoreExplanationText: {
    fontSize: 13,
    lineHeight: 20,
  },
  certRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  certBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  certText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  impactRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  alternativePreview: {
    gap: 10,
    marginBottom: 28,
  },
  reviewSummary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reviewSummaryLeft: {
    gap: 4,
  },
  reviewAvg: {
    fontSize: 28,
    fontWeight: "800",
  },
  reviewCount: {
    fontSize: 12,
  },
  writeReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  writeReviewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  reviewPreview: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  reviewPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "700",
  },
  reviewPreviewMeta: {
    gap: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
  },
  reviewPreviewText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
