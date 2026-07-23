import { useRef, useState, useCallback, useEffect } from "react";
import { View, Text, Animated, Pressable, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet, ImageBackground } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { router, useFocusEffect } from "expo-router";
import axios from "axios";
import { getToken } from "../../utils/secureStore";
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
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const sliderScrollX = useRef(new Animated.Value(0)).current;
  const slider2ScrollX = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const [totalStamps, setTotalStamps] = useState(0);
  const [availablePromos, setAvailablePromos] = useState(0);
  const [itinerariesCount, setItinerariesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = await getToken("access_token");
      if (!token) return;

      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";
      const headers = { Authorization: `Bearer ${token}` };

      const [stampsRes, promosRes, itinerariesRes] = await Promise.all([
        axios.get(`${baseUrl}/api/users/me/stamps`, { headers }).catch(() => ({ data: { total_stamps: 0 } })),
        axios.get(`${baseUrl}/api/promos/available`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${baseUrl}/api/itineraries/me`, { headers }).catch(() => ({ data: [] }))
      ]);

      setTotalStamps(stampsRes.data?.total_stamps || 0);
      setAvailablePromos(Array.isArray(promosRes.data) ? promosRes.data.length : 0);
      setItinerariesCount(Array.isArray(itinerariesRes.data) ? itinerariesRes.data.length : 0);
    } catch (err) {
      console.error("Failed to fetch home data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <ImageBackground 
      source={require("../../../assets/batik-solo-overlay.png")} 
      style={{ flex: 1, backgroundColor: '#f8fafc' }} 
      imageStyle={{ opacity: 0.4 }} 
      resizeMode="repeat"
    >
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

          {/* Content Loading State */}
          <View className="mt-[-20px] pb-6">
              {/* Quick Action: Cari Event */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(dolan)/itinerary", params: { search: "Aku lagi mencari event seru dekat sini nih!" } })}
                activeOpacity={0.8}
                className="bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden"
              >
                <View className="h-24 bg-[#D6EAF8] relative justify-center overflow-hidden">
                  <Image 
                    source={require("../../../assets/dashboard-batik-overlay.png")} 
                    style={{ position: 'absolute', width: '150%', height: '150%', opacity: 0.4 }} 
                    resizeMode="cover" 
                  />
                </View>
                <View className="p-5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                      <Ionicons name="calendar-outline" size={24} color="#22548C" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-playfair font-semibold text-navy-900 text-xl">Cari event seru</Text>
                      <Text className="font-sans text-slate-500 text-sm mt-1">Temukan acara menarik di sekitarmu</Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>

              {/* Stamp Box */}
              <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="font-playfair font-semibold text-navy-900 text-lg">Koleksi Stempelmu</Text>
                  <TouchableOpacity onPress={() => router.push("/(dolan)/stamps")}>
                    <Text className="font-sans-semibold text-orange-600 text-sm">Lihat Semua</Text>
                  </TouchableOpacity>
                </View>
                
                <View className="flex-row flex-wrap justify-between gap-y-3">
                  {isLoading ? (
                    [...Array(10)].map((_, index) => (
                      <View key={index} className="w-[18%] aspect-square rounded-full border border-slate-100 items-center justify-center bg-slate-50 overflow-hidden">
                        <PulseView style={{ width: '80%', height: '80%', borderRadius: 9999, backgroundColor: '#cbd5e1' }} />
                      </View>
                    ))
                  ) : (
                    [...Array(10)].map((_, index) => {
                      const randomStampImages = [
                        require("../../../assets/stamp-batik.png"),
                        require("../../../assets/stamp-liwet.png"),
                        require("../../../assets/stamp-sate.png"),
                        require("../../../assets/stamp-serabi.png")
                      ];
                      
                      if (index === 9) {
                        const extraCount = Math.max(0, totalStamps - 9);
                        return (
                          <View key={index} className="w-[18%] aspect-square rounded-full border-2 border-slate-200 border-dashed items-center justify-center bg-slate-50">
                            {totalStamps > 9 ? (
                              <Text className="font-sans-bold text-slate-500 text-xs">+{extraCount}</Text>
                            ) : (
                              <Ionicons name="add" size={16} color="#cbd5e1" />
                            )}
                          </View>
                        );
                      }

                      const hasStamp = index < Math.min(totalStamps, 9);
                      const randomImg = randomStampImages[index % randomStampImages.length];

                      return (
                        <View key={index} className="w-[18%] aspect-square rounded-full border-2 border-slate-100 items-center justify-center bg-slate-50 overflow-hidden">
                          {hasStamp ? (
                            <Image source={randomImg} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
                          ) : (
                            <View className="w-2 h-2 rounded-full bg-slate-200" />
                          )}
                        </View>
                      );
                    })
                  )}
                </View>
              </View>

              {/* Slider Iklan */}
              <View className="mb-6 -mx-5">
                <Animated.ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  pagingEnabled
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: sliderScrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                >
                  {[
                    require("../../../assets/ads/1.png"), 
                    require("../../../assets/ads/2.png"), 
                    require("../../../assets/ads/3.png")
                  ].map((img, index) => (
                    <View key={index} style={{ width: SCREEN_WIDTH }} className="px-5">
                      <View className="w-full h-44 rounded-2xl bg-slate-200 overflow-hidden relative border border-slate-100 shadow-sm">
                        <Image 
                          source={img} 
                          style={{ width: '100%', height: '100%' }} 
                          resizeMode="cover" 
                        />
                        {/* Dongker (Navy) Overlay 20% */}
                        <View className="absolute inset-0 bg-[#0A192F] opacity-20 pointer-events-none" />
                      </View>
                    </View>
                  ))}
                </Animated.ScrollView>
                
                {/* Pagination Dots */}
                <View className="flex-row justify-center mt-4 gap-1.5">
                  {[1, 2, 3].map((_, i) => {
                    const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
                    const dotWidth = sliderScrollX.interpolate({
                      inputRange,
                      outputRange: [6, 20, 6],
                      extrapolate: "clamp"
                    });
                    const opacity = sliderScrollX.interpolate({
                      inputRange,
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: "clamp"
                    });
                    return (
                      <Animated.View 
                        key={i} 
                        style={{ width: dotWidth, opacity, height: 6, borderRadius: 3, backgroundColor: '#EA580C' }} 
                      />
                    );
                  })}
                </View>
              </View>

              {/* Promo Available */}
              <TouchableOpacity
                onPress={() => router.push("/(dolan)/stamps")}
                activeOpacity={0.8}
                className="bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden"
              >
                <View className="h-24 relative justify-center overflow-hidden">
                  <LinearGradient
                    colors={["#FB923C", "#FED7AA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Image 
                    source={require("../../../assets/dashboard-batik-overlay.png")} 
                    style={{ position: 'absolute', width: '150%', height: '150%', opacity: 0.4 }} 
                    resizeMode="cover" 
                  />
                </View>
                <View className="p-5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mr-4">
                      <Ionicons name="gift-outline" size={24} color="#EA580C" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-playfair font-semibold text-navy-900 text-xl">Promo Menunggu</Text>
                      {isLoading ? (
                        <View className="flex-row items-center gap-1.5 mt-1">
                          <Text className="font-sans text-slate-400 text-sm">Ada</Text>
                          <PulseView style={{ width: 22, height: 16, backgroundColor: '#cbd5e1', borderRadius: 4 }} />
                          <Text className="font-sans text-slate-400 text-sm">promo menarik buatmu</Text>
                        </View>
                      ) : (
                        <Text className="font-sans text-slate-500 text-sm mt-1">Ada <Text className="font-sans-bold text-orange-600">{availablePromos}</Text> promo menarik buatmu</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>

              {/* Itinerary Stats Card */}
              <TouchableOpacity
                onPress={() => router.push("/(dolan)/itinerary")}
                activeOpacity={0.8}
                className="bg-white rounded-[24px] shadow-sm border border-slate-100 mb-6 overflow-hidden"
              >
                <View className="h-24 relative justify-center overflow-hidden">
                  <LinearGradient
                    colors={["#FB923C", "#FED7AA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Image 
                    source={require("../../../assets/dashboard-batik-overlay.png")} 
                    style={{ position: 'absolute', width: '150%', height: '150%', opacity: 0.4 }} 
                    resizeMode="cover" 
                  />
                </View>
                <View className="p-5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mr-4">
                      <Ionicons name="map-outline" size={24} color="#EA580C" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-playfair font-semibold text-navy-900 text-xl">Riwayat Perjalanan</Text>
                      {isLoading ? (
                        <View className="flex-row items-center gap-1.5 mt-1">
                          <Text className="font-sans text-slate-400 text-sm">Ada</Text>
                          <PulseView style={{ width: 22, height: 16, backgroundColor: '#cbd5e1', borderRadius: 4 }} />
                          <Text className="font-sans text-slate-400 text-sm">riwayat petualangan serumu</Text>
                        </View>
                      ) : (
                        <Text className="font-sans text-slate-500 text-sm mt-1">Ada <Text className="font-sans-bold text-orange-600">{itinerariesCount}</Text> riwayat petualangan serumu</Text>
                      )}
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>

              {/* Slider Kedua (Navy) */}
              <View className="mb-6 -mx-5">
                <Animated.ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  pagingEnabled
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: slider2ScrollX } } }],
                    { useNativeDriver: false }
                  )}
                  scrollEventThrottle={16}
                >
                  {[
                    require("../../../assets/ads/4.png"), 
                    require("../../../assets/ads/5.png"), 
                    require("../../../assets/ads/6.png")
                  ].map((img, index) => (
                    <View key={index} style={{ width: SCREEN_WIDTH }} className="px-5">
                      <View className="w-full h-44 rounded-2xl bg-slate-200 overflow-hidden relative border border-slate-100 shadow-sm">
                        <Image 
                          source={img} 
                          style={{ width: '100%', height: '100%' }} 
                          resizeMode="cover" 
                        />
                        {/* Dongker (Navy) Overlay 20% */}
                        <View className="absolute inset-0 bg-[#0A192F] opacity-20 pointer-events-none" />
                      </View>
                    </View>
                  ))}
                </Animated.ScrollView>
                
                {/* Pagination Dots (Navy) */}
                <View className="flex-row justify-center mt-4 gap-1.5">
                  {[1, 2, 3].map((_, i) => {
                    const inputRange = [(i - 1) * SCREEN_WIDTH, i * SCREEN_WIDTH, (i + 1) * SCREEN_WIDTH];
                    const dotWidth = slider2ScrollX.interpolate({
                      inputRange,
                      outputRange: [6, 20, 6],
                      extrapolate: "clamp"
                    });
                    const opacity = slider2ScrollX.interpolate({
                      inputRange,
                      outputRange: [0.3, 1, 0.3],
                      extrapolate: "clamp"
                    });
                    return (
                      <Animated.View 
                        key={i} 
                        style={{ width: dotWidth, opacity, height: 6, borderRadius: 3, backgroundColor: '#14335A' }} 
                      />
                    );
                  })}
                </View>
              </View>

              {/* Quick Action: Cari Makanan */}
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/(dolan)/itinerary", params: { search: "Aku lapar, kasih saran makanan enak dekat sii dong!" } })}
                activeOpacity={0.8}
                className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden"
              >
                <View className="h-24 bg-[#D6EAF8] relative justify-center overflow-hidden">
                  <Image 
                    source={require("../../../assets/dashboard-batik-overlay.png")} 
                    style={{ position: 'absolute', width: '150%', height: '150%', opacity: 0.4 }} 
                    resizeMode="cover" 
                  />
                </View>
                <View className="p-5 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mr-4">
                      <Ionicons name="restaurant-outline" size={24} color="#dc2626" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-playfair font-semibold text-navy-900 text-xl">Cari makanan enak</Text>
                      <Text className="font-sans text-slate-500 text-sm mt-1">Rekomendasi kuliner legendaris</Text>
                    </View>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
      </Animated.ScrollView>
    </ImageBackground>
  );
}

function PulseView({ style }: { style?: any }) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return <Animated.View style={[style, { opacity: pulseAnim }]} />;
}
