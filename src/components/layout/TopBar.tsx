import { View, Text, Pressable } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TopBar() {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useAppStore();
  const insets = useSafeAreaInsets();

  const currentMode = segments[0] === "(bakul)" ? "bakul" : "dolan";

  const initials = user?.full_name
    ? user.full_name.trim().split(/\s+/).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
    : "?";

  function handleSwitch(target: "dolan" | "bakul") {
    if (target === currentMode) return;
    router.replace(target === "dolan" ? "/(dolan)/home" : "/(bakul)/home");
  }

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

      {user?.role === "wisatawan" && (
        <View className="flex-row bg-surface border border-line rounded-xl p-[3px] gap-0.5">
          <Pressable
            onPress={() => handleSwitch("dolan")}
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-[9px] ${
              currentMode === "dolan" ? "bg-navy-800" : ""
            }`}
          >
            <FontAwesome6
              name="map-location-dot"
              size={12}
              color={currentMode === "dolan" ? "#fff" : "#5B6572"}
            />
            <Text
              className={`text-[13px] font-sans-semibold ${
                currentMode === "dolan" ? "text-white" : "text-ink-soft"
              }`}
            >
              Dolan Mode
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleSwitch("bakul")}
            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-[9px] ${
              currentMode === "bakul" ? "bg-navy-800" : ""
            }`}
          >
            <FontAwesome6
              name="store"
              size={12}
              color={currentMode === "bakul" ? "#fff" : "#5B6572"}
            />
            <Text
              className={`text-[13px] font-sans-semibold ${
                currentMode === "bakul" ? "text-white" : "text-ink-soft"
              }`}
            >
              Bakul Mode
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
