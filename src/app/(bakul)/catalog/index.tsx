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
import { useAppStore } from "../../../store/useAppStore";
import { Alert } from "../../../components/ui/Alert";

type CatalogItem = {
  id: string;
  item_name: string;
  price: string | number;
  category: string;
  image_url?: string;
};

export default function BakulCatalogScreen() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  const merchant_id = useAppStore(state => state.merchant_id);

  const fetchCatalog = async () => {
    if (!merchant_id) {
      setIsLoading(false);
      setError("Gagal mendapatkan ID Toko. Silakan muat ulang aplikasi.");
      return;
    }

    setIsLoading(true);
    setError("");
    
    try {
      const { data } = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/merchants/${merchant_id}/catalog`
      );
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal memuat katalog toko.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCatalog();
    }, [merchant_id])
  );

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num || 0);
  };

  return (
    <ImageBackground
      source={require("../../../../assets/batik-solo-overlay.png")}
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
        <View className="flex-row items-center justify-between mt-4 mb-2">
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900">
            Katalog Toko
          </Text>
        </View>
        <Text className="text-[15px] font-sans text-ink-soft mb-6">
          Daftar menu yang tersedia untuk pelanggan.
        </Text>
        
        <TouchableOpacity 
          className="w-full bg-navy-900 rounded-2xl py-4 items-center justify-center flex-row gap-2 mb-8 shadow-sm"
          onPress={() => router.push("/(bakul)/catalog/ingest")}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text className="font-sans-bold text-white text-[16px]">
            Tambah Menu via Foto (AI)
          </Text>
        </TouchableOpacity>

        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading) ? 'flex' : 'none', width: '100%' }}>
          {!isLoading && items.length === 0 && !error && (
            <View className="bg-white/70 rounded-3xl p-8 items-center border border-slate-200 shadow-sm mt-4">
              <Ionicons name="fast-food-outline" size={48} color="#94a3b8" />
              <Text className="font-sans-semibold text-slate-600 text-lg mt-4 text-center">
                Katalog masih kosong
              </Text>
              <Text className="font-sans text-slate-500 text-center mt-2">
                Gunakan tombol di atas untuk memindai daftar menu dari foto secara otomatis.
              </Text>
            </View>
          )}

          {!isLoading && items.length > 0 && (
            <View className="gap-3 mb-8">
              {items.map((item) => (
                <View 
                  key={item.id} 
                  className="bg-white/90 rounded-2xl p-4 border border-slate-200 shadow-sm flex-row justify-between items-center"
                >
                  <View className="flex-1 pr-4">
                    <Text className="font-sans-bold text-navy-900 text-lg mb-1">
                      {item.item_name}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <View className="bg-orange-100 px-2 py-0.5 rounded-full">
                        <Text className="text-[10px] font-sans-semibold text-orange-700 uppercase tracking-wide">
                          {item.category}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="font-sans-bold text-[#BA5E12] text-lg">
                    {formatPrice(item.price)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
