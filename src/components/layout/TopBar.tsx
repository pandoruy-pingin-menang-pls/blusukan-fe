import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

export function TopBar() {
  const router = useRouter();
  const { mode, setMode, userName } = useAppStore();

  const initials = userName
    ? userName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "?";

  function handleSwitch(target: "dolan" | "bakul") {
    if (target === mode) return;
    setMode(target);
    router.replace(target === "dolan" ? "/(dolan)/home" : "/(bakul)/dashboard");
  }

  return (
    <View className="px-5 pt-4 pb-3.5 border-b border-line">
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

      <View className="flex-row bg-surface border border-line rounded-xl p-[3px] gap-0.5">
        <Pressable
          onPress={() => handleSwitch("dolan")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-[9px] ${
            mode === "dolan" ? "bg-navy-800" : ""
          }`}
        >
          <FontAwesome6
            name="map-location-dot"
            size={12}
            color={mode === "dolan" ? "#fff" : "#5B6572"}
          />
          <Text
            className={`text-[13px] font-sans-semibold ${
              mode === "dolan" ? "text-white" : "text-ink-soft"
            }`}
          >
            Dolan Mode
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleSwitch("bakul")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-[9px] ${
            mode === "bakul" ? "bg-navy-800" : ""
          }`}
        >
          <FontAwesome6
            name="store"
            size={12}
            color={mode === "bakul" ? "#fff" : "#5B6572"}
          />
          <Text
            className={`text-[13px] font-sans-semibold ${
              mode === "bakul" ? "text-white" : "text-ink-soft"
            }`}
          >
            Bakul Mode
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
