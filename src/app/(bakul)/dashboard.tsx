import { useState, useCallback, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Pressable
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../store/useAppStore";
import apiClient from "../../services/apiClient";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";

type NearbyEvent = {
  name: string;
  estimated_attendee_count: number;
  genre: string;
};

type PredictionData = {
  id: string;
  generated_for_date: string;
  weather_condition: string;
  nearby_events: NearbyEvent[];
  recommended_stock: Record<string, number>;
  ai_suggestion_text: string;
};

export default function BakulDashboardScreen() {
  const merchant_id = useAppStore(state => state.merchant_id);
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
  
  const [merchantData, setMerchantData] = useState<any>(null);
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [catalogCount, setCatalogCount] = useState<number>(0);
  const [promoCount, setPromoCount] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    setErrorMsg("");
    try {
      // 1. Fetch Merchant Info
      const merchantRes = await apiClient.get("/api/merchants/me");
      setMerchantData(merchantRes.data);
      
      // 2. Fetch Prediction if merchant_id is present
      if (merchant_id || merchantRes.data?.id) {
        const idToUse = merchant_id || merchantRes.data.id;
        try {
          const predRes = await apiClient.get(`/api/merchants/${idToUse}/inventory-recommendations/today`);
          setPrediction(predRes.data);
        } catch (predErr: any) {
          if (predErr.response?.status === 404) {
            setPrediction(null);
          } else {
            console.error("Gagal mengambil prediksi:", predErr);
          }
        }

        try {
          const [catalogRes, promoRes] = await Promise.all([
            apiClient.get(`/api/merchants/${idToUse}/catalog`),
            apiClient.get(`/api/merchants/${idToUse}/promos`)
          ]);
          setCatalogCount(catalogRes.data?.length || 0);
          setPromoCount(promoRes.data?.filter((p: any) => p.is_active)?.length || 0);
        } catch (e) {
          console.error("Gagal load metrics:", e);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Gagal memuat data dashboard.");
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData().finally(() => setIsLoading(false));
    }, [merchant_id])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#14335A"]} />}
      >
        {/* Background shape */}
        <View 
          className="absolute top-0 w-[150%] left-[-25%] h-48 overflow-hidden" 
          style={{ borderBottomLeftRadius: 300, borderBottomRightRadius: 300 }}
        >
          <LinearGradient
            colors={["#EA580C", "#9A3412"]} // Orange linear gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          />
        </View>

        {/* Header Hero Section */}
        <View 
          className="px-5 pb-2 mb-2"
          style={{ paddingTop: Math.max(insets.top, 50) }}
        >
          <View className="flex-row items-center justify-between mb-3">
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
        </View>
        <View className="px-5">

        <Alert message={errorMsg} type="error" />

        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#14335A" />
          </View>
        ) : (
          <View className="gap-6 mb-8">
            {/* Quick Metrics */}
            <View className="flex-row gap-4">
              <View className="flex-1 bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-sm flex-row items-center gap-3">
                <View>
                  <Ionicons name="fast-food-outline" size={32} color="#22548C" />
                </View>
                <View>
                  <Text className="font-sans-bold text-2xl text-navy-900">{catalogCount}</Text>
                  <Text className="font-sans text-[11px] text-slate-500">Menu Katalog</Text>
                </View>
              </View>

              <View className="flex-1 bg-white/95 rounded-3xl p-4 border border-slate-200 shadow-sm flex-row items-center gap-3">
                <View>
                  <Ionicons name="ticket-outline" size={32} color="#ea580c" />
                </View>
                <View>
                  <Text className="font-sans-bold text-2xl text-navy-900">{promoCount}</Text>
                  <Text className="font-sans text-[11px] text-slate-500">Promo Aktif</Text>
                </View>
              </View>
            </View>

            {/* Prediction Card */}
            <View className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card Header with Navy and Batik */}
              <View className="bg-navy-900">
                <ImageBackground
                  source={require("../../../assets/dashboard-batik-overlay.png")}
                  style={{ paddingHorizontal: 20, paddingVertical: 16 }}
                  imageStyle={{ opacity: 0.4 }}
                  resizeMode="cover"
                >
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="sparkles" size={20} color="white" />
                    <Text className="font-sans-bold text-white text-lg flex-1">
                      Saran Stok Hari Ini
                    </Text>
                    {prediction && (
                      <View className="bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                        <Text className="text-white text-xs font-sans-bold capitalize">
                          Cuaca: {prediction.weather_condition}
                        </Text>
                      </View>
                    )}
                  </View>
                </ImageBackground>
              </View>

              <View className="p-5">

              {prediction ? (
                <View className="gap-5">
                  {/* AI Text */}
                  <View className="bg-transparent p-1 relative mb-2">
                    <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ position: 'absolute', top: 2, left: 0 }} />
                    <Text className="font-sans text-navy-800 leading-relaxed text-[13px] pl-7">
                      {prediction.ai_suggestion_text.replace(/\*/g, '•')}
                    </Text>
                  </View>

                  {/* JSON Prediction Values */}
                  <View>
                    <Text className="font-sans-bold text-slate-700 mb-3 text-sm">
                      Target Persiapan Stok:
                    </Text>
                    <View className="flex-row flex-wrap justify-between gap-y-3">
                      {Object.entries(prediction.recommended_stock).map(([key, value]) => (
                        <View key={key} style={{ width: '48%' }} className="bg-white border border-slate-200 rounded-xl px-2 py-3 items-center justify-center shadow-sm">
                          <Text className="font-sans-semibold text-slate-500 text-[11px] uppercase mb-1 text-center" numberOfLines={1}>
                            {key.replace(/_/g, " ")}
                          </Text>
                          <Text className="font-sans-bold text-orange-600 text-2xl">
                            {value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Nearby Events */}
                  {prediction.nearby_events && prediction.nearby_events.length > 0 && (
                    <View className="mt-2">
                      <Text className="font-sans-bold text-slate-700 mb-2 text-sm">
                        Event di Sekitar Anda Hari Ini:
                      </Text>
                      {prediction.nearby_events.map((ev, idx) => (
                        <View key={idx} className="flex-row items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                          <View className="mr-2">
                            <Ionicons name="calendar" size={20} color="#22548C" />
                          </View>
                          <View className="flex-1">
                            <Text className="font-sans-bold text-slate-700 text-[14px]">{ev.name}</Text>
                            <Text className="font-sans text-slate-500 text-xs mt-0.5 capitalize">
                              {ev.estimated_attendee_count} Pengunjung • {ev.genre}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View className="items-center py-6 px-4">
                  <Ionicons name="analytics-outline" size={48} color="#cbd5e1" />
                  <Text className="font-sans-semibold text-slate-500 mt-4 text-center">
                    Belum ada rekomendasi stok untuk hari ini.
                  </Text>
                  <Text className="font-sans text-slate-400 text-sm mt-1 text-center leading-relaxed">
                    Sistem akan menghitung otomatis berdasarkan data baseline inventory, cuaca, dan keramaian.
                  </Text>
                </View>
              )}
            </View>
          </View>
          </View>
        )}
        </View>
      </Animated.ScrollView>
    </View>
  );
}
