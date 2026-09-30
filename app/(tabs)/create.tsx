import React from "react";
import { View } from "react-native";

// This is a dummy screen. The tab button is intercepted by a custom component
// in _layout.tsx which routes to the actual /booking/create modal.
export default function DummyCreateTab() {
  return <View />;
}
