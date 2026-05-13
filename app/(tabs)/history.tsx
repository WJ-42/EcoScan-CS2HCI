import { useState, useMemo } from "react";
import { View, Text, Pressable, TextInput, FlatList, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { SustainabilityBadge } from "@/components/sustainability-badge";
import { useColors } from "@/hooks/use-colors";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useScanHistory } from "@/lib/scan-history-context";
import { getProductById, formatPrice, Product } from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

type FilterMode = "all" | "favorites";

interface HistoryItem {
  product: Product;
  scannedAt: string;
  isFavorite: boolean;
}

export default function HistoryScreen() {
  const router = useRouter();
  const colors = useColors();
  const { scaleFontSize, minTouchTarget } = useAccessibility();
  const { scans, toggleFavorite } = useScanHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const historyItems: HistoryItem[] = useMemo(() => {
    return scans
      .map((scan) => {
        const product = getProductById(scan.productId);
        if (!product) return null;
        return {
          product,
          scannedAt: scan.scannedAt,
          isFavorite: scan.isFavorite,
        };
      })
      .filter((item): item is HistoryItem => item !== null);
  }, [scans]);

  const filteredItems = useMemo(() => {
    let items = historyItems;
    if (filterMode === "favorites") {
      items = items.filter((item) => item.isFavorite);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.product.name.toLowerCase().includes(query) ||
          item.product.brand.toLowerCase().includes(query) ||
          item.product.category.toLowerCase().includes(query)
      );
    }
    return items;
  }, [historyItems, filterMode, searchQuery]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <Pressable
      onPress={() => router.push(`/products/${item.product.id}` as any)}
      style={({ pressed }) => [
        styles.historyCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          minHeight: minTouchTarget,
        },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityLabel={`${item.product.name}, grade ${item.product.grade}, scanned ${formatDate(item.scannedAt)}`}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: item.product.imageUrl }}
        style={styles.productImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.cardContent}>
        <Text
          style={[styles.productName, { color: colors.foreground, fontSize: scaleFontSize(15) }]}
          numberOfLines={1}
        >
          {item.product.name}
        </Text>
        <Text
          style={[styles.productBrand, { color: colors.muted, fontSize: scaleFontSize(13) }]}
          numberOfLines={1}
        >
          {item.product.brand} · {item.product.category}
        </Text>
        <Text style={[styles.productPrice, { color: colors.foreground, fontSize: scaleFontSize(14) }]}>
          {formatPrice(item.product.price)}
        </Text>
        <Text style={[styles.scanDate, { color: colors.muted }]}>
          {formatDate(item.scannedAt)}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <SustainabilityBadge grade={item.product.grade} size="small" />
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            toggleFavorite(item.product.id);
          }}
          style={({ pressed }) => [
            styles.favButton,
            pressed && { opacity: 0.6 },
          ]}
          accessibilityLabel={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
          accessibilityRole="button"
        >
          <MaterialIcons
            name={item.isFavorite ? "favorite" : "favorite-border"}
            size={20}
            color={item.isFavorite ? colors.error : colors.muted}
          />
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground, fontSize: scaleFontSize(28) }]}>
          History
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted, fontSize: scaleFontSize(14) }]}>
          {historyItems.length} product{historyItems.length !== 1 ? "s" : ""} scanned
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <MaterialIcons name="search" size={20} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search products..."
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="done"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <MaterialIcons name="close" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          onPress={() => setFilterMode("all")}
          style={({ pressed }) => [
            styles.filterTab,
            {
              backgroundColor: filterMode === "all" ? colors.primary : "transparent",
              borderColor: filterMode === "all" ? colors.primary : colors.border,
              minHeight: minTouchTarget,
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              {
                color: filterMode === "all" ? "#FFFFFF" : colors.foreground,
                fontSize: scaleFontSize(15),
              },
            ]}
          >
            All
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterMode("favorites")}
          style={({ pressed }) => [
            styles.filterTab,
            {
              backgroundColor: filterMode === "favorites" ? colors.primary : "transparent",
              borderColor: filterMode === "favorites" ? colors.primary : colors.border,
              minHeight: minTouchTarget,
            },
            pressed && { opacity: 0.8 },
          ]}
        >
          <MaterialIcons
            name="favorite"
            size={14}
            color={filterMode === "favorites" ? "#FFFFFF" : colors.foreground}
          />
          <Text
            style={[
              styles.filterTabText,
              {
                color: filterMode === "favorites" ? "#FFFFFF" : colors.foreground,
                fontSize: scaleFontSize(15),
              },
            ]}
          >
            Favorites
          </Text>
        </Pressable>
      </View>

      {/* List */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name={filterMode === "favorites" ? "favorite-border" : "history"}
              size={48}
              color={colors.muted}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {filterMode === "favorites" ? "No Favorites Yet" : "No Scans Yet"}
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {filterMode === "favorites"
                ? "Tap the heart icon on products to save them as favorites."
                : "Scan your first product to start tracking your sustainability choices!"}
            </Text>
            {filterMode === "all" && (
              <Pressable
                onPress={() => router.push("/(tabs)/scan" as any)}
                style={({ pressed }) => [
                  styles.scanButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <MaterialIcons name="qr-code-scanner" size={20} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan a Product</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 12,
  },
  productImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: "600",
  },
  productBrand: {
    fontSize: 12,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  scanDate: {
    fontSize: 11,
    marginTop: 2,
  },
  cardRight: {
    alignItems: "center",
    gap: 8,
  },
  favButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  scanButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
