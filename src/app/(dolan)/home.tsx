import { useRef } from "react";
import { View, Text, Animated, Pressable, ScrollView } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function DolanHome() {
  const { user, logout } = useAppStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const name = user?.full_name?.split(" ")[0] || "";

  const headerOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 bg-slate-50">
      {/* Sticky Top Bar (Fades in) */}
      <Animated.View 
        className="absolute top-0 left-0 right-0 z-50 px-5 pb-3.5 bg-white border-b border-line shadow-sm"
        style={{ 
          paddingTop: Math.max(insets.top, 50),
          opacity: headerOpacity 
        }}
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
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Background shape */}
        <View 
          className="absolute top-0 w-[150%] left-[-25%] h-64 overflow-hidden" 
          style={{ borderBottomLeftRadius: 300, borderBottomRightRadius: 300 }}
        >
          <LinearGradient
            colors={["#0A192F", "#14335A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          />
        </View>

        {/* Header Hero Section */}
        <View 
          className="px-5 pb-6"
          style={{ paddingTop: Math.max(insets.top, 50) }}
        >
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-col justify-center">
              <Text className="font-sans text-white text-sm">Sugeng rawuh,</Text>
              <Text className="font-playfair font-semibold text-white text-2xl">{name}</Text>
            </View>
            <Pressable 
              onPress={handleLogout} 
              className="flex-row items-center justify-center w-10 h-10 bg-white/20 rounded-full"
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
            </Pressable>
          </View>

          {/* Placeholder content for scrolling */}
          <View className="bg-white p-6 rounded-2xl border border-line shadow-sm mb-6 h-64 items-center justify-center">
            <Text className="font-playfair text-navy-900 text-lg">Dashboard Dolan</Text>
            <Text className="font-sans text-slate-500 text-center mt-2">
              (Nanti isinya Widget Stempel, Rekomendasi Rute, Promo, dll)
            </Text>
          </View>

          {/* Spacer so we can actually scroll */}
          {[1, 2, 3].map((item) => (
            <View key={item} className="bg-white p-6 rounded-2xl border border-line mb-4 h-48 justify-center items-center">
              <Text className="font-sans text-slate-400">Placeholder Konten {item}</Text>
            </View>
          ))}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
