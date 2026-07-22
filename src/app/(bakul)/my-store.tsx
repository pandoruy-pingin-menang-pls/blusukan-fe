import { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getToken } from "../../utils/secureStore";
import { Alert } from "../../components/ui/Alert";

type MerchantProfile = {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  owner_id: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
};

const CATEGORY_MAP: Record<string, string> = {
  KULINER_PANAS: "Kuliner Panas",
  JAJANAN_PASAR: "Jajanan Pasar",
  MINUMAN_TRADISIONAL: "Minuman Tradisional",
  KERAJINAN_TANGAN: "Kerajinan Tangan",
  PAKAIAN_LOKAL: "Pakaian Lokal",
  OLEH_OLEH: "Oleh-Oleh",
};

export default function MyStoreScreen() {
  const [store, setStore] = useState<MerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStoreProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = await getToken("access_token");
      if (!token) {
        throw new Error("No token found");
      }
      
      const { data } = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/merchants/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStore(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal memuat profil toko");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStoreProfile();
    }, [])
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ImageBackground
      source={require("../../../assets/batik-solo-overlay.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.4 }}
      resizeMode="repeat"
    >
      <LinearGradient
        colors={["#FDEBD0", "#D6EAF8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2 mt-4">
          Toko Saya
        </Text>
        <Text className="text-[15px] font-sans text-ink-soft mb-8">
          Kelola informasi toko Anda di Blusukan
        </Text>

        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading && store) ? 'flex' : 'none', width: '100%' }}>
          {store && (
            <>
              <View className="bg-white/90 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                <View className="items-center mb-6">
                  <View className="w-20 h-20 bg-navy-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="storefront" size={40} color="#22548C" />
                  </View>
                  <Text className="text-xl font-sans-bold text-navy-900 text-center">
                    {store.name}
                  </Text>
                  <Text className="text-sm font-sans text-ink-soft text-center mt-1 px-4">
                    {store.description || "Belum ada deskripsi"}
                  </Text>
                </View>

                <View className="space-y-4 gap-4">
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Kategori</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="pricetag-outline" size={16} color="#BA5E12" />
                      <Text className="text-sm font-sans text-navy-800">
                        {CATEGORY_MAP[store.category] || store.category}
                      </Text>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Alamat</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="location-outline" size={16} color="#BA5E12" />
                      <Text className="text-sm font-sans text-navy-800 flex-1">
                        {store.address}
                      </Text>
                    </View>
                  </View>

                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Status Verifikasi</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons 
                        name={store.is_verified ? "checkmark-circle" : "time-outline"} 
                        size={16} 
                        color={store.is_verified ? "#16a34a" : "#ca8a04"} 
                      />
                      <Text className="text-sm font-sans text-navy-800">
                        {store.is_verified ? "Terverifikasi" : "Menunggu Verifikasi"}
                      </Text>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Status Toko</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons 
                        name={store.is_active ? "power" : "power-outline"} 
                        size={16} 
                        color={store.is_active ? "#22548C" : "#94a3b8"} 
                      />
                      <Text className="text-sm font-sans text-navy-800">
                        {store.is_active ? "Aktif" : "Tidak Aktif"}
                      </Text>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Tanggal Dibuat</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="calendar-outline" size={16} color="#475569" />
                      <Text className="text-sm font-sans text-navy-800">
                        {formatDate(store.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
