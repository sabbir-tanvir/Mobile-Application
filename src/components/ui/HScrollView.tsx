import React, { useContext } from "react";
import { ScrollView, ScrollViewProps, StyleSheet, ViewStyle } from "react-native";

// Import navigation contexts that get lost across Android's native horizontal scroll boundary
const {
  NavigationContext,
  NavigationContainerRefContext,
  NavigationRouteContext,
  NavigationHelpersContext,
} = require("@react-navigation/core");

/**
 * HScrollView — A horizontal ScrollView that bridges React Navigation context
 * across Android's native AndroidHorizontalScrollContentView boundary.
 *
 * NativeWind v4's CssInterop wrappers break React context propagation through
 * Android's horizontal scroll native views. This component captures all critical
 * navigation contexts before the native boundary and re-provides them inside.
 *
 * Usage: Drop-in replacement for <ScrollView horizontal ...>
 */
export interface HScrollViewProps extends Omit<ScrollViewProps, "horizontal"> {
  /** Gap between children (applied via contentContainerStyle) */
  gap?: number;
  /** Additional content container style */
  contentContainerStyle?: ViewStyle;
  /** Additional outer style */
  style?: ViewStyle;
  /** Additional outer className (NativeWind) - only for non-layout props like mb-3 */
  className?: string;
}

export const HScrollView: React.FC<HScrollViewProps> = ({
  children,
  gap = 8,
  contentContainerStyle,
  style,
  className,
  ...props
}) => {
  // Capture all navigation contexts BEFORE the native scroll boundary
  const navContext = useContext(NavigationContext);
  const navContainerRefContext = useContext(NavigationContainerRefContext);
  const navRouteContext = useContext(NavigationRouteContext);
  const navHelpersContext = useContext(NavigationHelpersContext);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      style={style}
      contentContainerStyle={[
        styles.contentContainer,
        { gap },
        contentContainerStyle,
      ]}
      {...props}
    >
      {/* Re-provide all navigation contexts inside the scroll content */}
      <NavigationContainerRefContext.Provider value={navContainerRefContext}>
        <NavigationContext.Provider value={navContext}>
          <NavigationRouteContext.Provider value={navRouteContext}>
            <NavigationHelpersContext.Provider value={navHelpersContext}>
              {children}
            </NavigationHelpersContext.Provider>
          </NavigationRouteContext.Provider>
        </NavigationContext.Provider>
      </NavigationContainerRefContext.Provider>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
