import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView, RefreshControl, ImageBackground, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { adminService, AdminEvent } from "@/services/admin";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";
import 'dayjs/locale/id';
dayjs.locale('id');

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAppStore();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const name = user?.full_name?.split(" ")[0] || "";

  const [recalculating, setRecalculating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const data = await adminService.getEvents();
      // Urutkan dari yang terbaru
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await logout();
    // Layout akan otomatis mendeteksi state user = null dan melakukan redirect
  };

  const handleRecalculate = () => {
    Alert.alert(
      "Konfirmasi",
      "Hitung ulang semua rekomendasi inventori pedagang? Proses ini mungkin memakan waktu beberapa saat di background.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Hitung",
          style: "default",
          onPress: async () => {
            setRecalculating(true);
            try {
              const res = await adminService.recalculateInventory();
              Alert.alert("Berhasil", res.message || "Tugas perhitungan stok telah dikirim ke Celery.");
            } catch (error) {
              Alert.alert("Error", "Gagal memicu perhitungan stok.");
            } finally {
              setRecalculating(false);
            }
          }
        }
      ]
    );
  };

  const pendingEvents = events.filter(e => e.status === 'pending_review').length;
  const approvedEvents = events.filter(e => e.status === 'approved').length;
  const totalEvents = events.length;
  const recentEvents = events.slice(0, 3);

  const headerOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 bg-surface">
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0F2A4A"]} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Background shape */}
        <View
          className="absolute top-0 w-[150%] left-[-25%] h-64 overflow-hidden border-b-[3px] border-navy-900"
          style={{ borderBottomLeftRadius: 300, borderBottomRightRadius: 300 }}
        >
          <ImageBackground
            source={require("../../../../assets/promo-batik-overlay.png")}
            style={{ width: '100%', height: '100%' }}
            imageStyle={{ opacity: 0.15 }}
            resizeMode="cover"
          />
        </View>

        {/* Header Hero Section */}
        <View
          className="px-5 pb-6 mb-2"
          style={{ paddingTop: Math.max(insets.top, 50) }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-col justify-center">
              <Text className="font-sans text-navy-900 text-sm">Sugeng rawuh,</Text>
              <Text className="font-playfair font-semibold text-navy-900 text-2xl">{name}</Text>
            </View>
            <Pressable
              onPress={handleLogout}
              className="flex-row items-center justify-center w-10 h-10 bg-red-50/80 rounded-full"
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </Pressable>
          </View>
        </View>

        {/* Ringkasan Data (Statistik) */}
        <View className="px-4 mb-6">
          <View className="bg-white rounded-2xl border border-line shadow-sm overflow-hidden">
            <View className="bg-navy-900 py-3 px-4">
              <Text className="text-white font-playfair font-semibold tracking-wide text-lg">Pantau Event</Text>
            </View>
            <View className="flex-row p-4 gap-3 bg-white">
              <View className="flex-1 items-center">
                <View className="items-center justify-center mb-2">
                  <FontAwesome6 name="clock" size={14} color="#A9722F" />
                </View>
                <Text className="text-ink-soft font-sans-medium text-xs mb-1 text-center">Menunggu</Text>
                <Text className="text-navy-900 font-display-bold text-xl">{loading ? '-' : pendingEvents}</Text>
              </View>
              <View className="w-[1px] bg-line" />
              <View className="flex-1 items-center">
                <View className="items-center justify-center mb-2">
                  <FontAwesome6 name="check" size={14} color="#0369a1" />
                </View>
                <Text className="text-ink-soft font-sans-medium text-xs mb-1 text-center">Disetujui</Text>
                <Text className="text-navy-900 font-display-bold text-xl">{loading ? '-' : approvedEvents}</Text>
              </View>
              <View className="w-[1px] bg-line" />
              <View className="flex-1 items-center">
                <View className="items-center justify-center mb-2">
                  <FontAwesome6 name="calendar" size={14} color="#0F2A4A" />
                </View>
                <Text className="text-ink-soft font-sans-medium text-xs mb-1 text-center">Total</Text>
                <Text className="text-navy-900 font-display-bold text-xl">{loading ? '-' : totalEvents}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Aksi Cepat */}
        <View className="px-4 mt-4">
          <Text className="text-navy-900 font-playfair font-semibold tracking-wide text-lg mb-4">Aksi Cepat</Text>
          <View className="flex-row gap-3 mb-4">
            <Pressable
              className="flex-1 bg-white p-4 rounded-xl border border-line items-center shadow-sm"
              onPress={() => router.push("/(admin)/events/create")}
            >
              <View className="items-center justify-center mb-2">
                <FontAwesome6 name="plus" size={16} color="#0F2A4A" />
              </View>
              <Text className="text-navy-900 font-sans-semibold text-sm">Buat Event</Text>
            </Pressable>
            <Pressable
              className="flex-1 bg-white p-4 rounded-xl border border-line items-center shadow-sm"
              onPress={() => router.push("/(admin)/events")}
            >
              <View className="items-center justify-center mb-2">
                <FontAwesome6 name="list" size={16} color="#0F2A4A" />
              </View>
              <Text className="text-navy-900 font-sans-semibold text-sm">Kelola Event</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleRecalculate}
            disabled={recalculating}
            className="rounded-card border border-line shadow-sm mb-6 bg-white flex-row items-center p-4"
          >
            <View className="mr-3">
              <FontAwesome6 name="boxes-stacked" size={20} color="#0F2A4A" />
            </View>
            <View className="flex-1">
              <Text className="text-navy-900 font-sans-bold text-sm mb-0.5">Recalculate Inventory</Text>
              <Text className="text-ink-soft font-sans text-xs">Hitung ulang saran stok via Celery</Text>
            </View>

            <View className="w-8 h-8 rounded-full bg-navy-900 items-center justify-center ml-2">
              {recalculating ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <FontAwesome6 name="chevron-right" size={12} color="#FFFFFF" />
              )}
            </View>
          </Pressable>
        </View>

        {/* Event Terbaru */}
        <View className="px-4">
          <Text className="text-navy-900 font-playfair font-semibold tracking-wide text-lg mb-4">Event Terbaru</Text>
          {loading ? (
            <ActivityIndicator color="#0F2A4A" />
          ) : recentEvents.length === 0 ? (
            <Text className="text-ink-soft font-sans text-sm text-center py-4">Belum ada event terdaftar.</Text>
          ) : (
            <View className="gap-3">
              {recentEvents.map(event => (
                <Pressable
                  key={event.id}
                  onPress={() => router.push(`/(admin)/events/${event.id}/review`)}
                  className="bg-white rounded-2xl overflow-hidden border border-line shadow-sm"
                >
                  <View className="bg-navy-900">
                    <ImageBackground
                      source={require("../../../../assets/event-batik-dashboard.jpeg")}
                      style={{ width: '100%', height: 56 }}
                      imageStyle={{ opacity: 0.4 }}
                      resizeMode="cover"
                    />
                  </View>
                  <View className="p-4 flex-row items-start">
                    <View className="flex-1">
                      <Text className="text-navy-900 font-sans-bold text-base mb-1" numberOfLines={1}>{event.name}</Text>
                      <Text className="text-ink-soft font-sans text-xs mb-2">{event.venue_name}</Text>
                      <View className="flex-row items-center">
                        <FontAwesome6 name="calendar-day" size={10} color="#8A93A0" />
                        <Text className="text-ink-soft font-sans text-xs ml-1.5">
                          {dayjs(event.start_datetime).format('DD MMM YYYY')}
                        </Text>
                      </View>
                    </View>
                    <View className={`px-2 py-1 rounded-full border ${event.status === 'approved' ? 'border-[#0369a1] bg-transparent' :
                      event.status === 'rejected' ? 'border-slate-600 bg-transparent' : 'border-[#BA5E12] bg-transparent'
                      }`}>
                      <Text className={`font-sans-medium text-[10px] ${event.status === 'approved' ? 'text-[#0369a1]' :
                        event.status === 'rejected' ? 'text-slate-600' : 'text-[#BA5E12]'
                        }`}>
                        {event.status === 'pending_review' ? 'PENDING' : event.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="px-4 mt-8 mb-4">
          <Pressable
            onPress={handleLogout}
            className="bg-slate-800 rounded-xl py-4 flex-row justify-center items-center gap-2 shadow-sm"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="font-sans-bold text-white text-base">Keluar dari Akun</Text>
          </Pressable>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
