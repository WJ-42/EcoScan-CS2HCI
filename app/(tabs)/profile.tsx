import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAccessibility } from "@/hooks/use-accessibility";
import {
  useThemeContext,
  type AccessibilityPreset,
} from "@/lib/theme-provider";
import { useScanHistory } from "@/lib/scan-history-context";
import { getProductById } from "@/lib/mock-data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { IconSymbol } from "@/components/ui/icon-symbol";

const PRESET_OPTIONS: { key: AccessibilityPreset; label: string }[] = [
  { key: "vision", label: "Vision needs" },
  { key: "motor", label: "Motor needs" },
  { key: "cognitive", label: "Cognitive needs" },
];

function matchesPreset(
  preset: AccessibilityPreset,
  state: { highContrast: boolean; largerText: boolean; largerTouchTargets: boolean; simpleNavigation: boolean }
): boolean {
  const presets: Record<AccessibilityPreset, typeof state> = {
    vision: { highContrast: true, largerText: true, largerTouchTargets: false, simpleNavigation: false },
    motor: { highContrast: false, largerText: false, largerTouchTargets: true, simpleNavigation: true },
    cognitive: { highContrast: false, largerText: true, largerTouchTargets: false, simpleNavigation: true },
  };
  const p = presets[preset];
  return (
    state.highContrast === p.highContrast &&
    state.largerText === p.largerText &&
    state.largerTouchTargets === p.largerTouchTargets &&
    state.simpleNavigation === p.simpleNavigation
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { scaleFontSize, minTouchTarget } = useAccessibility();
  const {
    colorScheme,
    highContrast,
    largerText,
    largerTouchTargets,
    simpleNavigation,
    setColorScheme,
    setHighContrast,
    setLargerText,
    setLargerTouchTargets,
    setSimpleNavigation,
    applyPreset,
    resetAccessibility,
  } = useThemeContext();

  const toggleTheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };
  const { scans, userReviews } = useScanHistory();

  const totalScans = scans.length;
  const ecoChoices = scans.filter((s) => {
    const p = getProductById(s.productId);
    return p && (p.grade === "A" || p.grade === "B");
  }).length;
  const favorites = scans.filter((s) => s.isFavorite).length;
  const reviewsWritten = userReviews.length;

  const ecoPercentage =
    totalScans > 0 ? Math.round((ecoChoices / totalScans) * 100) : 0;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground, fontSize: scaleFontSize(28) }]}>
            Profile
          </Text>
        </View>

        {/* User Card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.primary },
          ]}
        >
          <View style={styles.avatarLarge}>
            <IconSymbol name="leaf.fill" size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Eco Shopper</Text>
            <Text style={styles.userSubtitle}>
              Making sustainable choices
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons name="qr-code-scanner" size={24} color={colors.primary} />
            <Text style={[styles.statNumber, { color: colors.foreground, fontSize: scaleFontSize(24) }]}>
              {totalScans}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
              Total Scans
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons name="eco" size={24} color={colors.success} />
            <Text style={[styles.statNumber, { color: colors.foreground, fontSize: scaleFontSize(24) }]}>
              {ecoChoices}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
              Eco Choices
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons name="favorite" size={24} color={colors.error} />
            <Text style={[styles.statNumber, { color: colors.foreground, fontSize: scaleFontSize(24) }]}>
              {favorites}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
              Favorites
            </Text>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MaterialIcons name="rate-review" size={24} color={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.foreground, fontSize: scaleFontSize(24) }]}>
              {reviewsWritten}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
              Reviews
            </Text>
          </View>
        </View>

        {/* Eco Score */}
        {totalScans > 0 && (
          <View
            style={[
              styles.ecoScoreCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.ecoScoreHeader}>
              <Text style={[styles.ecoScoreTitle, { color: colors.foreground }]}>
                Your Eco Score
              </Text>
              <Text style={[styles.ecoScorePercent, { color: colors.primary }]}>
                {ecoPercentage}%
              </Text>
            </View>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${ecoPercentage}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.ecoScoreDesc, { color: colors.muted }]}>
              {ecoPercentage >= 70
                ? "Excellent! You consistently choose sustainable products."
                : ecoPercentage >= 40
                ? "Good progress! Keep choosing greener alternatives."
                : "Getting started! Try scanning more products to find eco-friendly options."}
            </Text>
          </View>
        )}

        {/* Settings Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: scaleFontSize(16) }]}>
          Settings
        </Text>

        <View
          style={[
            styles.settingsGroup,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.settingItem, { minHeight: minTouchTarget }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <MaterialIcons name="notifications" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={false}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              { minHeight: minTouchTarget },
              pressed && { opacity: 0.7 },
            ]}
            onPress={toggleTheme}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: "#8B5CF6" + "15" }]}>
                <MaterialIcons name="dark-mode" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                  Appearance
                </Text>
                <Text style={[styles.settingDesc, { color: colors.muted, fontSize: scaleFontSize(12) }]}>
                  {colorScheme === "dark" ? "Dark mode" : "Light mode"}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Accessibility Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: scaleFontSize(16) }]}>
          Accessibility
        </Text>

        <View
          style={[
            styles.settingsGroup,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.presetSection}>
            <Text style={[styles.accessibilitySubsection, { color: colors.muted }]}>
              Presets
            </Text>
            <View style={styles.presetChips}>
            {PRESET_OPTIONS.map(({ key, label }) => {
              const active = matchesPreset(key, {
                highContrast,
                largerText,
                largerTouchTargets,
                simpleNavigation,
              });
              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [
                    styles.presetChip,
                    {
                      backgroundColor: active ? colors.primary : colors.background,
                      borderColor: active ? colors.primary : colors.border,
                      minHeight: minTouchTarget,
                      flex:
                        key === "cognitive" ? 1.45 : key === "motor" ? 1.15 : 1.1,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={() => applyPreset(key)}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.5}
                    style={[
                      styles.presetChipText,
                      { color: active ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <Text style={[styles.accessibilitySubsection, { color: colors.muted }]}>
            Options
          </Text>

          <View style={[styles.settingItem, { minHeight: minTouchTarget }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <MaterialIcons name="text-fields" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                Larger text size
              </Text>
            </View>
            <Switch
              value={largerText}
              onValueChange={setLargerText}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <View style={[styles.settingItem, { minHeight: minTouchTarget }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <MaterialIcons name="contrast" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                High contrast mode
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <View style={[styles.settingItem, { minHeight: minTouchTarget }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <MaterialIcons name="touch-app" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                Larger touch targets
              </Text>
            </View>
            <Switch
              value={largerTouchTargets}
              onValueChange={setLargerTouchTargets}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <View style={[styles.settingItem, { minHeight: minTouchTarget }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "15" }]}>
                <MaterialIcons name="menu" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                Simple navigation mode
              </Text>
            </View>
            <Switch
              value={simpleNavigation}
              onValueChange={setSimpleNavigation}
              trackColor={{ false: colors.border, true: colors.primary + "60" }}
              thumbColor={colors.primary}
            />
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              { minHeight: minTouchTarget },
              pressed && { opacity: 0.7 },
            ]}
            onPress={resetAccessibility}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.muted + "20" }]}>
                <MaterialIcons name="restore" size={20} color={colors.muted} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground, fontSize: scaleFontSize(15) }]}>
                Reset to default
              </Text>
            </View>
          </Pressable>
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: scaleFontSize(16) }]}>
          About
        </Text>

        <View
          style={[
            styles.settingsGroup,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + "15" }]}>
                <MaterialIcons name="info" size={20} color={colors.success} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                About EcoScan
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.warning + "15" }]}>
                <MaterialIcons name="help" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                Help & Support
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </Pressable>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && { opacity: 0.7 },
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.error + "15" }]}>
                <MaterialIcons name="privacy-tip" size={20} color={colors.error} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                Privacy Policy
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        </View>

        {/* Version */}
        <Text style={[styles.versionText, { color: colors.muted }]}>
          EcoScan v1.0.0
        </Text>
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
    paddingTop: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  userSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  ecoScoreCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 28,
    gap: 12,
  },
  ecoScoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ecoScoreTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  ecoScorePercent: {
    fontSize: 24,
    fontWeight: "800",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  ecoScoreDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  settingsGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  settingDivider: {
    height: 1,
    marginLeft: 62,
  },
  accessibilitySubsection: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  presetSection: {
    paddingRight: 24,
  },
  presetChips: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: 5,
    paddingLeft: 16,
    paddingRight: 10,
    paddingBottom: 12,
  },
  presetChip: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 11,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
