import { View, ImageBackground } from "react-native";
import { Slot, Redirect } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAppStore } from "@/store/useAppStore";

export default function AdminLayout() {
  const user = useAppStore((state) => state.user);

  if (user?.role !== "admin") {
    return <Redirect href="/" />;
  }

  return (
    <ImageBackground
      source={require("../../../assets/batik-solo-overlay.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.2 }}
      resizeMode="repeat"
    >
      <View className="flex-1 bg-surface/60">
        <TopBar />
        <View className="flex-1">
          <Slot />
        </View>
        <BottomNav mode="admin" />
      </View>
    </ImageBackground>
  );
}
