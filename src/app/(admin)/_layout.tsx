import { View } from "react-native";
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
    <View className="flex-1 bg-surface">
      <TopBar />
      <View className="flex-1">
        <Slot />
      </View>
      <BottomNav mode="admin" />
    </View>
  );
}
