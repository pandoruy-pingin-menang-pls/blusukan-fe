import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { router } from "expo-router";
import { Alert } from "../../components/ui/Alert";
import apiClient from "../../services/apiClient";

export default function BakulHome() {
  const { logout, user } = useAppStore();
  const [merchant, setMerchant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const { data } = await apiClient.get("/api/merchants/me");
        setMerchant(data);
      } catch (err) {
        setErrorMsg("Gagal mengambil data toko.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMerchant();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 items-center justify-center bg-surface p-6">
      <Text className="text-3xl font-display text-navy-900 mb-6 mt-10">Bakul Dashboard</Text>
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#0B2F5C" />
      ) : merchant ? (
        <View className="items-center bg-white w-full p-4 rounded-xl border border-line mb-8 shadow-sm">
          <Text className="text-xl font-sans-bold text-navy-800">{merchant.name}</Text>
          <Text className="text-sm text-ink-soft mt-1 bg-navy-50 px-2 py-1 rounded">{merchant.category}</Text>
          <Text className="text-sm font-sans mt-4 text-center text-ink-dark leading-relaxed">{merchant.description}</Text>
          <Text className="text-xs text-ink-soft mt-4">📍 {merchant.address}</Text>
          {merchant.is_verified && (
            <View className="bg-green-100 px-3 py-1 rounded-full mt-4">
              <Text className="text-green-800 text-xs font-sans-bold">Terverifikasi</Text>
            </View>
          )}
        </View>
      ) : (
        <View className="w-full">
          <Alert message={errorMsg} type="error" />
        </View>
      )}

      <View className="w-full">
        <Button label="Keluar Akun" onPress={handleLogout} variant="secondary" />
      </View>
    </View>
  );
}
