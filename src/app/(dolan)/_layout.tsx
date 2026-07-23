import { View } from "react-native";
import { Slot, usePathname } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DolanLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const isHome = pathname === "/(dolan)/home" || pathname === "/home";

  return (
    <View className="flex-1 bg-white">
      <TopBar />
      <View className="flex-1" style={{ paddingTop: isHome ? 0 : insets.top }}>
        <Slot />
      </View>
      <BottomNav mode="dolan" />
    </View>
  );
}
