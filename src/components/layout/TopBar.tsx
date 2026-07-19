import { View, Text, Pressable } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TopBar() {
  const { user } = useAppStore();
  const insets = useSafeAreaInsets();

  const initials = user?.full_name
    ? user.full_name.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
    : "?";

  return (
    <View 
      className="px-5 pb-3.5 border-b border-line"
      style={{ paddingTop: Math.max(insets.top, 50) }}
    >
      <View className="flex-row items-center justify-between mb-3.5">
        <View className="flex-row items-center gap-2">
          <View className="w-[30px] h-[30px] rounded-lg bg-navy-800 items-center justify-center">
            <Text className="text-white font-display-extra text-sm">B</Text>
          </View>
          <Text className="font-display text-navy-900 text-base">Blusukan</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <FontAwesome6 name="bell" size={16} color="#5B6572" />
          <View className="w-[30px] h-[30px] rounded-full bg-navy-50 border border-line items-center justify-center">
            <Text className="text-navy-800 font-sans-bold text-xs">{initials}</Text>
          </View>
        </View>
      </View>

    </View>
  );
}
