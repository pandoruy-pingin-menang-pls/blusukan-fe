import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert, ScrollView } from "react-native";
import { adminService } from "@/services/admin";
import { FontAwesome6 } from "@expo/vector-icons";
import { useAppStore } from "@/store/useAppStore";

export default function AdminDashboardScreen() {
  const user = useAppStore((state) => state.user);
  const [recalculating, setRecalculating] = useState(false);

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

  return (
    <ScrollView className="flex-1 bg-surface">
      <View className="bg-navy-900 px-5 pt-8 pb-10 rounded-b-3xl shadow-sm">
        <Text className="text-navy-50 font-sans text-sm mb-1">Selamat datang,</Text>
        <Text className="text-white font-display-semibold text-2xl">Admin Blusukan</Text>
        <Text className="text-navy-50 font-sans text-xs mt-1">{user?.email}</Text>
      </View>

      <View className="px-4 mt-6">
        <Text className="text-navy-900 font-display-semibold text-lg mb-4">System Tools</Text>

        <Pressable 
          onPress={handleRecalculate}
          disabled={recalculating}
          className="bg-white rounded-card p-4 border border-line shadow-sm flex-row items-center"
        >
          <View className="w-12 h-12 rounded-full bg-warn-bg items-center justify-center mr-4">
            <FontAwesome6 name="boxes-stacked" size={20} color="#A9722F" />
          </View>
          <View className="flex-1">
            <Text className="text-navy-900 font-sans-bold text-base mb-0.5">Recalculate Inventory</Text>
            <Text className="text-ink-soft font-sans text-xs">Hitung ulang saran stok harian semua pedagang via Celery</Text>
          </View>
          
          {recalculating ? (
            <ActivityIndicator color="#A9722F" className="ml-2" />
          ) : (
            <FontAwesome6 name="chevron-right" size={14} color="#8A93A0" className="ml-2" />
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
