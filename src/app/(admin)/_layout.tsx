import { View, ImageBackground } from "react-native";
import { Slot, Redirect, usePathname } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAppStore } from "@/store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AdminLayout() {
  const user = useAppStore((state) => state.user);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const isDashboard = pathname === "/dashboard" || pathname === "/(admin)/dashboard";
  const isMonitoring = pathname === "/monitoring" || pathname === "/(admin)/monitoring";
  const isFullScreen = isDashboard || isMonitoring;

  if (user?.role !== "admin") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ImageBackground
      source={require("../../../assets/batik-solo-overlay.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.2 }}
      resizeMode="repeat"
    >
      <View className="flex-1 bg-surface/60">
        {!isFullScreen && <TopBar />}
        <View className="flex-1" style={{ paddingTop: isFullScreen ? 0 : insets.top }}>
          <Slot />
        </View>
        <BottomNav mode="admin" />
      </View>
    </ImageBackground>
  );
}
