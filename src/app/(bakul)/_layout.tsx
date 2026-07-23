import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BakulLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isDashboard = pathname === "/(bakul)/dashboard" || pathname === "/dashboard";

  return (
    <View className="flex-1 bg-white">
      <TopBar />
      <View className="flex-1" style={{ paddingTop: isDashboard ? 0 : insets.top }}>
        <Slot />
      </View>
      <BottomNav mode="bakul" />
    </View>
  );
}
