import { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput
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
  const [searchQuery, setSearchQuery] = useState("");
  
  const merchant_id = useAppStore(state => state.merchant_id);

  const fetchCatalog = async () => {
    if (!merchant_id) {
      setError("Profil toko belum dimuat.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
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
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `Rp${numPrice.toLocaleString('id-ID')}`;
  };

  const filteredItems = items.filter(i => i.item_name.toLowerCase().includes(searchQuery.toLowerCase()));

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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900">
            Katalog Toko
          </Text>
        </View>
        <Text className="text-[15px] font-sans text-ink-soft mb-6">
          Kelola produk yang Anda tawarkan ke turis
        </Text>
        
        <View className="gap-3 mb-6 w-full">
          <TouchableOpacity 
            className="w-full bg-navy-900 rounded-2xl py-4 items-center justify-center flex-row gap-2 shadow-sm"
            onPress={() => router.push("/(bakul)/catalog/ingest")}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="white" />
            <Text className="font-sans-bold text-white text-[16px]">
              Foto Daftar Menu Baru
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full bg-white/80 border border-slate-200 rounded-2xl py-4 items-center justify-center flex-row gap-2 shadow-sm"
            onPress={() => router.push("/(bakul)/catalog/ingest?mode=manual")}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={20} color="#475569" />
            <Text className="font-sans-bold text-slate-600 text-[16px]">
              Input Manual Katalog
            </Text>
          </TouchableOpacity>
        </View>

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
                Belum ada item katalog. Silakan tambahkan katalog produk Anda.
              </Text>
            </View>
          )}

          {!isLoading && items.length > 0 && (
            <View>
              <View className="mb-4">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                  <Ionicons name="search" size={20} color="#94a3b8" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Cari nama produk..."
                    placeholderTextColor="#94a3b8"
                    className="flex-1 ml-2 font-sans text-navy-900 text-[15px] py-1"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <View className="gap-3 mb-8">
                {filteredItems.length === 0 ? (
                  <Text className="text-sm font-sans text-slate-500 text-center py-8">
                    Tidak ada produk yang sesuai dengan pencarian Anda.
                  </Text>
                ) : (
                  filteredItems.map((item) => (
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
                  ))
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
