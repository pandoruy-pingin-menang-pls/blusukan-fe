import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Alert } from "../../../../components/ui/Alert";

type CatalogItem = {
  id: string;
  item_name: string;
  price: string | number;
  category: string;
  image_url?: string;
};

export default function PublicCatalogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchCatalog = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/merchants/${id}/catalog`
        );
        setItems(data);
      } catch (err: any) {
        setError("Gagal memuat katalog. Toko mungkin belum memiliki menu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [id]);

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
      source={require("../../../../../assets/batik-solo-overlay.png")}
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

      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 40,
          left: 16,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "white",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          zIndex: 10,
        }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#22548C" />
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 60 }}>
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2">
            Katalog Menu
          </Text>
          <Text className="text-[15px] font-sans text-ink-soft mb-8">
            Daftar menu dan produk dari toko ini.
          </Text>
        </View>

        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading) ? 'flex' : 'none', width: '100%' }}>
          {!isLoading && items.length === 0 && !error && (
            <View className="bg-white/70 rounded-3xl p-8 items-center border border-slate-200 shadow-sm">
              <Ionicons name="restaurant-outline" size={48} color="#94a3b8" />
              <Text className="font-sans-semibold text-slate-600 text-lg mt-4 text-center">
                Belum ada menu
              </Text>
              <Text className="font-sans text-slate-500 text-center mt-2">
                Toko ini belum mengunggah daftar menunya.
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
