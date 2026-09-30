import { Alert, Platform } from "react-native";

/**
 * Cross-platform alert dialog that works on both native iOS/Android and web.
 */
export function showAlert(
  title: string,
  message?: string,
  onOk?: () => void
): void {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.alert) {
    window.alert(message ? `${title}\n\n${message}` : title);
    onOk?.();
    return;
  }

  Alert.alert(title, message, [{ text: "OK", onPress: onOk }]);
}

/**
 * Cross-platform confirmation dialog that handles async callbacks correctly on native.
 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText = "Confirm",
  cancelText = "Cancel"
): void {
  if (Platform.OS === "web" && typeof window !== "undefined" && window.confirm) {
    const ok = window.confirm(`${title ? title + "\n\n" : ""}${message}`);
    if (ok) {
      onConfirm();
    } else {
      onCancel?.();
    }
    return;
  }

  Alert.alert(title || "Confirmation", message, [
    { text: cancelText, style: "cancel", onPress: onCancel },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}
