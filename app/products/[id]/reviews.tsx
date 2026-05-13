import { useState, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { StarRating } from "@/components/star-rating";
import { useColors } from "@/hooks/use-colors";
import { useScanHistory } from "@/lib/scan-history-context";
import { getProductById, getReviewsForProduct, Review } from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

type FilterOption = "All" | "Most Recent" | "Highest Rated";

export default function ReviewsScreen() {
  const { id, submitted } = useLocalSearchParams<{ id: string; submitted?: string }>();
  const router = useRouter();
  const colors = useColors();
  const { userReviews, removeReview } = useScanHistory();
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [reviewToRemove, setReviewToRemove] = useState<Review | null>(null);
  const showSubmittedMessage = submitted === "1";

  const product = getProductById(id);
  if (!product) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Product not found</Text>
      </ScreenContainer>
    );
  }

  const mockReviews = getReviewsForProduct(product.id);
  const userProductReviews = userReviews.filter((r) => r.productId === product.id);
  const allReviews = [...userProductReviews, ...mockReviews];

  const filteredReviews = useMemo(() => {
    let reviews = [...allReviews];
    switch (activeFilter) {
      case "Most Recent":
        reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "Highest Rated":
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return reviews;
  }, [allReviews, activeFilter]);

  const avgRating =
    allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;

  const ratingDistribution = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    allReviews.forEach((r) => {
      dist[r.rating - 1]++;
    });
    return dist;
  }, [allReviews]);

  const filters: FilterOption[] = ["All", "Most Recent", "Highest Rated"];
  const ourReviewIds = useMemo(
    () => new Set(userProductReviews.map((r) => r.id)),
    [userProductReviews]
  );

  const handleRemoveReview = (review: Review) => {
    setReviewToRemove(review);
  };

  const confirmRemove = () => {
    if (!reviewToRemove) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    removeReview(reviewToRemove.id);
    setReviewToRemove(null);
  };

  const cancelRemove = () => {
    setReviewToRemove(null);
  };

  const renderReview = ({ item: review }: { item: Review }) => {
    const isOurs = ourReviewIds.has(review.id);
    return (
      <View
        style={[
          styles.reviewCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.reviewHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {review.userAvatar}
            </Text>
          </View>
          <View style={styles.reviewMeta}>
            <Text style={[styles.reviewerName, { color: colors.foreground }]}>
              {review.userName}
            </Text>
            <View style={styles.reviewMetaRow}>
              <StarRating rating={review.rating} size={14} />
              <Text style={[styles.reviewDate, { color: colors.muted }]}>
                {new Date(review.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
          <View style={styles.reviewHeaderRight}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primary + "12" }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>
                {review.category}
              </Text>
            </View>
            {isOurs && (
              <Pressable
                onPress={() => handleRemoveReview(review)}
                style={({ pressed }) => [
                  styles.deleteButton,
                  { backgroundColor: colors.error + "20" },
                  pressed && { opacity: 0.7 },
                ]}
                accessibilityLabel="Remove your review"
                accessibilityRole="button"
              >
                <MaterialIcons name="delete-outline" size={20} color={colors.error} />
              </Pressable>
            )}
          </View>
        </View>
        <Text style={[styles.reviewComment, { color: colors.foreground }]}>
          {review.comment}
        </Text>
      </View>
    );
  };

  const ListHeader = () => (
    <View>
      {showSubmittedMessage && (
        <View
          style={[
            styles.submittedBanner,
            { backgroundColor: colors.success + "20", borderColor: colors.success + "40" },
          ]}
        >
          <MaterialIcons name="check-circle" size={20} color={colors.success} />
          <Text style={[styles.submittedText, { color: colors.success }]}>
            Your review has been submitted.
          </Text>
        </View>
      )}
      {/* Rating Summary */}
      <View
        style={[
          styles.ratingSummary,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.ratingSummaryLeft}>
          <Text style={[styles.ratingBig, { color: colors.foreground }]}>
            {avgRating.toFixed(1)}
          </Text>
          <StarRating rating={avgRating} size={20} />
          <Text style={[styles.ratingCount, { color: colors.muted }]}>
            {allReviews.length} reviews
          </Text>
        </View>
        <View style={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star - 1];
            const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
            return (
              <View key={star} style={styles.ratingBarRow}>
                <Text style={[styles.ratingBarLabel, { color: colors.muted }]}>
                  {star}
                </Text>
                <View style={[styles.ratingBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.ratingBarFill,
                      {
                        backgroundColor: "#EAB308",
                        width: `${pct}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {filters.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor:
                  activeFilter === filter ? colors.primary : colors.surface,
                borderColor: activeFilter === filter ? colors.primary : colors.border,
              },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel={`Filter: ${filter}`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: activeFilter === filter ? "#FFFFFF" : colors.foreground,
                },
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

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
            Reviews
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]} numberOfLines={1}>
            {product.name}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={filteredReviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="rate-review" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No reviews yet. Be the first to share your sustainability experience!
            </Text>
          </View>
        }
      />

      {/* Remove Review Confirmation Modal */}
      <Modal
        visible={!!reviewToRemove}
        transparent
        animationType="fade"
        onRequestClose={cancelRemove}
      >
        <Pressable
          style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={cancelRemove}
        >
          <Pressable
            style={[
              styles.confirmDialog,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
              Remove Review
            </Text>
            <Text style={[styles.confirmMessage, { color: colors.muted }]}>
              Are you sure you want to remove your review?
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                onPress={cancelRemove}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonCancel,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.confirmButtonText, { color: colors.foreground }]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={confirmRemove}
                style={({ pressed }) => [
                  styles.confirmButton,
                  styles.confirmButtonRemove,
                  { backgroundColor: colors.error },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.confirmButtonTextRemove}>Remove</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Floating Write Review Button */}
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          router.push(`/products/${product.id}/write-review` as any);
        }}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary },
          pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 },
        ]}
        accessibilityLabel="Write a review"
        accessibilityRole="button"
      >
        <MaterialIcons name="edit" size={22} color="#FFFFFF" />
        <Text style={styles.fabText}>Write Review</Text>
      </Pressable>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  submittedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  submittedText: {
    fontSize: 15,
    fontWeight: "600",
  },
  ratingSummary: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 20,
    marginBottom: 16,
  },
  ratingSummaryLeft: {
    alignItems: "center",
    gap: 6,
  },
  ratingBig: {
    fontSize: 36,
    fontWeight: "800",
  },
  ratingCount: {
    fontSize: 12,
  },
  ratingBars: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ratingBarLabel: {
    fontSize: 12,
    fontWeight: "600",
    width: 12,
    textAlign: "center",
  },
  ratingBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  ratingBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewMeta: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "600",
  },
  reviewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  confirmDialog: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  confirmMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 4,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmButtonCancel: {
    borderWidth: 1,
  },
  confirmButtonRemove: {},
  confirmButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButtonTextRemove: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
