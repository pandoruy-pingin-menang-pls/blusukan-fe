import { View } from "react-native";
import { Slot } from "expo-router";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function BakulLayout() {
  return (
    <View className="flex-1 bg-white">
      <TopBar />
      <View className="flex-1">
        <Slot />
      </View>
      <BottomNav mode="bakul" />
    </View>
  );
}
