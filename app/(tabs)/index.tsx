import { ScrollView, Text, View, Pressable, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { ProductCard } from "@/components/product-card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useAccessibility } from "@/hooks/use-accessibility";
import { useScanHistory } from "@/lib/scan-history-context";
import { PRODUCTS, ECO_TIPS, getProductById } from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { scaleFontSize, minTouchTarget } = useAccessibility();
  const { scans } = useScanHistory();

  const recentProducts = scans
    .slice(0, 6)
    .map((s) => getProductById(s.productId))
    .filter(Boolean);

  const ecoChoicesCount = scans.filter((s) => {
    const p = getProductById(s.productId);
    return p && (p.grade === "A" || p.grade === "B");
  }).length;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.foreground, fontSize: scaleFontSize(28) }]}>
              EcoScan
            </Text>
          </View>
          <View
            style={[styles.logoContainer, { backgroundColor: colors.primary + "15" }]}
          >
            <IconSymbol name="leaf.fill" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Scan CTA */}
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            router.push("/(tabs)/scan" as any);
          }}
          style={({ pressed }) => [
            styles.scanCta,
            { backgroundColor: colors.primary, minHeight: minTouchTarget },
            pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
          ]}
          accessibilityLabel="Scan a product barcode"
          accessibilityRole="button"
        >
          <View style={styles.scanCtaContent}>
            <View style={styles.scanCtaLeft}>
              <MaterialIcons name="qr-code-scanner" size={36} color="#FFFFFF" />
              <View>
                <Text style={[styles.scanCtaTitle, { fontSize: scaleFontSize(18) }]}>
                  Scan a Product
                </Text>
                <Text style={[styles.scanCtaSubtitle, { fontSize: scaleFontSize(13) }]}>
                  Check sustainability instantly
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.statNumber, { color: colors.primary, fontSize: scaleFontSize(28) }]}>
              {scans.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
              Products Scanned
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.statNumber, { color: colors.success, fontSize: scaleFontSize(28) }]}>
              {ecoChoicesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
              Eco Choices
            </Text>
          </View>
        </View>

        {/* Recently Scanned */}
        {recentProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: scaleFontSize(18) }]}>
              Recently Scanned
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {recentProducts.map((product) =>
                product ? (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="compact"
                  />
                ) : null
              )}
            </ScrollView>
          </View>
        )}

        {/* Featured Products (when no scan history) */}
        {recentProducts.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: scaleFontSize(18) }]}>
              Featured Products
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {PRODUCTS.slice(0, 5).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Eco Tips */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: scaleFontSize(18) }]}>
              Eco Tips
            </Text>
          <View style={styles.tipsGrid}>
            {ECO_TIPS.map((tip) => (
              <View
                key={tip.id}
                style={[
                  styles.tipCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.tipIconContainer,
                    { backgroundColor: colors.primary + "15" },
                  ]}
                >
                  <IconSymbol
                    name={tip.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text
                  style={[styles.tipTitle, { color: colors.foreground, fontSize: scaleFontSize(14) }]}
                  numberOfLines={1}
                >
                  {tip.title}
                </Text>
                <Text
                  style={[styles.tipDescription, { color: colors.muted, fontSize: scaleFontSize(12) }]}
                  numberOfLines={2}
                >
                  {tip.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    marginBottom: 24,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  scanCta: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  scanCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scanCtaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  scanCtaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scanCtaSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },
  recentScroll: {
    paddingRight: 20,
  },
  tipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  tipCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  tipDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
});
