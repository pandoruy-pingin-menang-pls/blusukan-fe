import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TopBar() {
  // Disabled as it overlaps with individual screen headers
  return null;
}
