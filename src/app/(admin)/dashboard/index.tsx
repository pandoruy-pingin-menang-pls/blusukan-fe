import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView, RefreshControl } from "react-native";
import { adminService, AdminEvent } from "@/services/admin";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import 'dayjs/locale/id';
dayjs.locale('id');

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAppStore();
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
    router.replace("/(auth)/login");
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

  return (
    <ScrollView 
      className="flex-1 bg-transparent"
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="bg-navy-900 px-5 pt-8 pb-14 rounded-b-3xl shadow-sm">
        <Text className="text-navy-50 font-sans text-sm mb-1">Selamat datang,</Text>
        <Text className="text-white font-display-semibold text-2xl">Admin Blusukan</Text>
        <Text className="text-navy-50 font-sans text-xs mt-1">{user?.email}</Text>
      </View>

      {/* Ringkasan Data (Statistik) */}
      <View className="px-4 -mt-8 flex-row gap-3">
        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-line items-center">
          <View className="w-8 h-8 rounded-full bg-warn-bg items-center justify-center mb-2">
            <FontAwesome6 name="clock" size={14} color="#A9722F" />
          </View>
          <Text className="text-ink-soft font-sans-medium text-xs mb-1 text-center">Menunggu</Text>
          <Text className="text-navy-900 font-display-bold text-xl">{loading ? '-' : pendingEvents}</Text>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-line items-center">
          <View className="w-8 h-8 rounded-full bg-good/20 items-center justify-center mb-2">
            <FontAwesome6 name="check" size={14} color="#2C7A3D" />
          </View>
          <Text className="text-ink-soft font-sans-medium text-xs mb-1 text-center">Disetujui</Text>
          <Text className="text-navy-900 font-display-bold text-xl">{loading ? '-' : approvedEvents}</Text>
        </View>

        <View className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-line items-center">
          <View className="w-8 h-8 rounded-full bg-navy-50 items-center justify-center mb-2">
            <FontAwesome6 name="calendar" size={14} color="#0F2A4A" />
          </View>
          <Text className="text-ink-soft font-sans-medium text-xs mb-1 text-center">Total</Text>
          <Text className="text-navy-900 font-display-bold text-xl">{loading ? '-' : totalEvents}</Text>
        </View>
      </View>

      {/* Aksi Cepat */}
      <View className="px-4 mt-8">
        <Text className="text-navy-900 font-display-semibold text-lg mb-4">Aksi Cepat</Text>
        <View className="flex-row gap-3 mb-4">
          <Pressable 
            className="flex-1 bg-white p-4 rounded-xl border border-line items-center shadow-sm"
            onPress={() => router.push("/(admin)/events/create")}
          >
            <View className="w-10 h-10 rounded-full bg-navy-50 items-center justify-center mb-2">
              <FontAwesome6 name="plus" size={16} color="#0F2A4A" />
            </View>
            <Text className="text-navy-900 font-sans-semibold text-sm">Buat Event</Text>
          </Pressable>
          <Pressable 
            className="flex-1 bg-white p-4 rounded-xl border border-line items-center shadow-sm"
            onPress={() => router.push("/(admin)/events")}
          >
            <View className="w-10 h-10 rounded-full bg-navy-50 items-center justify-center mb-2">
              <FontAwesome6 name="list" size={16} color="#0F2A4A" />
            </View>
            <Text className="text-navy-900 font-sans-semibold text-sm">Kelola Event</Text>
          </Pressable>
        </View>

        <Pressable 
          onPress={handleRecalculate}
          disabled={recalculating}
          className="bg-white rounded-card p-4 border border-line shadow-sm flex-row items-center mb-6"
        >
          <View className="w-10 h-10 rounded-full bg-warn-bg items-center justify-center mr-3">
            <FontAwesome6 name="boxes-stacked" size={16} color="#A9722F" />
          </View>
          <View className="flex-1">
            <Text className="text-navy-900 font-sans-bold text-sm mb-0.5">Recalculate Inventory</Text>
            <Text className="text-ink-soft font-sans text-xs">Hitung ulang saran stok via Celery</Text>
          </View>
          
          {recalculating ? (
            <ActivityIndicator color="#A9722F" className="ml-2" />
          ) : (
            <FontAwesome6 name="chevron-right" size={12} color="#8A93A0" className="ml-2" />
          )}
        </Pressable>
      </View>

      {/* Event Terbaru */}
      <View className="px-4">
        <Text className="text-navy-900 font-display-semibold text-lg mb-4">Event Terbaru</Text>
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
                className="bg-white rounded-card p-4 border border-line shadow-sm flex-row items-center"
              >
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
                <View className={`px-2 py-1 rounded-full ${
                  event.status === 'approved' ? 'bg-good/20' : 
                  event.status === 'rejected' ? 'bg-danger/10' : 'bg-warn-bg'
                }`}>
                  <Text className={`font-sans-medium text-[10px] ${
                    event.status === 'approved' ? 'text-good' : 
                    event.status === 'rejected' ? 'text-danger' : 'text-primary-orange'
                  }`}>
                    {event.status === 'pending_review' ? 'PENDING' : event.status.toUpperCase()}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View className="px-4 mt-8 mb-10">
        <Button label="Keluar Akun" onPress={handleLogout} variant="secondary" />
      </View>
    </ScrollView>
  );
}
