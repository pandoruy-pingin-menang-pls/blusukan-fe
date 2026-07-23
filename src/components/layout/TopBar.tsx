import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function TopBar() {
  const { user, logout } = useAppStore();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname !== "/(dolan)/home" && pathname !== "/(bakul)/dashboard" && pathname !== "/home" && pathname !== "/dashboard") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const name = user?.full_name?.split(" ")[0] || "";

  return (
    <View 
      className="absolute top-0 left-0 right-0 z-50 px-5 pb-3.5"
      style={{ paddingTop: Math.max(insets.top, 50) }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-col justify-center">
          <Text className="font-sans text-navy-900 text-sm">Sugeng rawuh,</Text>
          <Text className="font-playfair font-semibold text-navy-900 text-lg">{name}</Text>
        </View>
        <Pressable 
          onPress={handleLogout} 
          className="flex-row items-center justify-center w-10 h-10 bg-red-50/80 rounded-full"
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
        </Pressable>
      </View>
    </View>
  );
}
