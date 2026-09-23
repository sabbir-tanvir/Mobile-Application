import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Safely triggers haptic feedback on supported native devices (iOS/Android)
 * and safely no-ops on Web or environments without native haptics.
 */
export const triggerHaptic = (
  style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light
) => {
  if (Platform.OS !== "web") {
    try {
      Haptics.impactAsync(style).catch(() => {});
    } catch {
      // Safe no-op
    }
  }
};
