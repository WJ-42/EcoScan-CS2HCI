import { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { StarRating } from "@/components/star-rating";
import { useColors } from "@/hooks/use-colors";
import { useScanHistory } from "@/lib/scan-history-context";
import { getProductById, Review } from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

type ReviewCategory = "Packaging" | "Sourcing" | "Carbon" | "Overall";

const CATEGORIES: ReviewCategory[] = ["Overall", "Packaging", "Sourcing", "Carbon"];

export default function WriteReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const { addReview } = useScanHistory();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState<ReviewCategory>("Overall");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmitted = useRef(false);

  const product = getProductById(id);
  if (!product) {
    return (
      <ScreenContainer className="p-6">
        <Text style={{ color: colors.foreground }}>Product not found</Text>
      </ScreenContainer>
    );
  }

  const handleSubmit = () => {
    if (hasSubmitted.current) return;
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a star rating before submitting.");
      return;
    }
    if (comment.trim().length === 0) {
      Alert.alert("Comment Required", "Please write a brief comment about your experience.");
      return;
    }
    hasSubmitted.current = true;
    setIsSubmitting(true);

    const review: Review = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      productId: product.id,
      userName: "You",
      userAvatar: "YO",
      rating,
      comment: comment.trim(),
      category,
      date: new Date().toISOString().split("T")[0],
    };

    addReview(review);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    router.replace(`/products/${product.id}/reviews?submitted=1` as any);
  };

  const canSubmit = rating > 0 && comment.trim().length > 0;

  return (
    <ScreenContainer edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            <MaterialIcons name="close" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Write Review
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Product info */}
          <View
            style={[
              styles.productInfo,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.productName, { color: colors.foreground }]}>
              {product.name}
            </Text>
            <Text style={[styles.productBrand, { color: colors.muted }]}>
              {product.brand}
            </Text>
          </View>

          {/* Star Rating */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
              Your Sustainability Rating
            </Text>
            <View style={styles.ratingContainer}>
              <StarRating
                rating={rating}
                size={40}
                interactive
                onRate={(r) => {
                  setRating(r);
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
              />
              {rating > 0 && (
                <Text style={[styles.ratingLabel, { color: colors.muted }]}>
                  {rating === 1
                    ? "Poor"
                    : rating === 2
                    ? "Below Average"
                    : rating === 3
                    ? "Average"
                    : rating === 4
                    ? "Good"
                    : "Excellent"}
                </Text>
              )}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
              Review Category
            </Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      backgroundColor:
                        category === cat ? colors.primary : colors.surface,
                      borderColor: category === cat ? colors.primary : colors.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  accessibilityLabel={`Category: ${cat}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: category === cat ? "#FFFFFF" : colors.foreground,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
              Your Review
            </Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Share your thoughts on this product's sustainability..."
              placeholderTextColor={colors.muted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.muted }]}>
              {comment.length}/500
            </Text>
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: canSubmit ? colors.primary : colors.border,
              },
              pressed && canSubmit && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
            accessibilityLabel="Submit review"
            accessibilityRole="button"
          >
            <MaterialIcons name="send" size={20} color="#FFFFFF" />
            <Text style={styles.submitText}>Submit Review</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  productInfo: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
    gap: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
  },
  productBrand: {
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: "center",
    gap: 8,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  commentInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 6,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
