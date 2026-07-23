import { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Switch,
  Image
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getToken } from "../../utils/secureStore";
import { Alert } from "../../components/ui/Alert";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../store/useAppStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const merchant_id = useAppStore(state => state.merchant_id);
  const [store, setStore] = useState<MerchantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Baseline state
  type BaselineItem = { key: string; value: string };
  const [baselineItems, setBaselineItems] = useState<BaselineItem[]>([]);
  const [isBaselineLoading, setIsBaselineLoading] = useState(false);
  const [baselineMessage, setBaselineMessage] = useState("");
  const [baselineStatus, setBaselineStatus] = useState<"idle"|"success"|"error">("idle");

  const fetchStoreProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/api/merchants/me");
      setStore(data);
      if (data.baseline_inventory) {
        const parsed = Object.entries(data.baseline_inventory).map(([k, v]) => ({ key: k, value: String(v) }));
        setBaselineItems(parsed);
      } else {
        setBaselineItems([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal memuat profil toko");
    } finally {
      setIsLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchStoreProfile();
    }, [merchant_id])
  );

  const handleSaveBaseline = async () => {
    setIsBaselineLoading(true);
    setBaselineStatus("idle");
    setBaselineMessage("");
    try {
      const payload: Record<string, number> = {};
      baselineItems.forEach(item => {
        if (item.key && item.value) {
          payload[item.key] = parseInt(item.value, 10);
        }
      });
      await apiClient.patch(`/api/inventory/${merchant_id}/baseline-inventory`, {
        baseline_inventory: payload
      });
      setBaselineStatus("success");
      setBaselineMessage("Baseline stok harian berhasil disimpan!");
    } catch (err: any) {
      setBaselineStatus("error");
      setBaselineMessage(err.response?.data?.detail || "Gagal menyimpan baseline.");
    } finally {
      setIsBaselineLoading(false);
    }
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
        style={[StyleSheet.absoluteFill, { zIndex: -2 }]}
      />

      {/* Top Navy Gradient Section (Wave Background) */}
      <LinearGradient
        colors={['#1E3A8A', '#0F2A4A']}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 170,
          zIndex: 0,
          overflow: "hidden"
        }}
      >
        <Image
          source={require("../../../assets/edit-profile-wave.png")}
          style={{ width: '100%', height: '100%', opacity: 0.3 }}
          resizeMode="cover"
        />
      </LinearGradient>

      {/* Fixed Header Text */}
      <View 
        style={{
          position: "absolute",
          top: insets.top + 25,
          left: 24,
          right: 24,
          zIndex: 10
        }}
      >
        <Text
          style={{
            fontSize: 32,
            letterSpacing: 1,
            fontFamily: 'PlayfairDisplay_700Bold'
          }}
          className="text-white mb-2"
        >
          Profil
        </Text>
        <Text className="text-base font-sans text-white/80" numberOfLines={1}>
          {(store?.description && store.description.toLowerCase() !== "string") ? store.description : "Kelola informasi dan stok toko Anda"}
        </Text>
      </View>

      <ScrollView 
        style={{ flex: 1, backgroundColor: 'transparent', zIndex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 130 + insets.top, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>

        <View style={{ display: (!isLoading && store) ? 'flex' : 'none', width: '100%', marginTop: 20 }}>
          {store && (
            <>
              {/* Profile Card */}
              <View className="bg-white/90 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                <View className="items-center mb-6">
                  <View className="mb-3">
                    <Ionicons name="storefront" size={48} color="#22548C" />
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

                  <View className="mt-1 border-t border-slate-100 pt-3">
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-2">Redemption Partner</Text>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <Ionicons 
                          name={store.is_redemption_partner ? "game-controller" : "game-controller-outline"} 
                          size={16} 
                          color={store.is_redemption_partner ? "#ea580c" : "#94a3b8"} 
                        />
                        <Text className="text-sm font-sans text-navy-800">
                          {store.is_redemption_partner ? "Aktif (Bisa Buat Promo)" : "Tidak Aktif"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Baseline Inventory Card */}
              <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                <View className="flex-row items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                  <View>
                    <Ionicons name="analytics-outline" size={28} color="#22548C" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-sans-bold text-navy-900 text-lg">
                      Target Stok Harian (Baseline)
                    </Text>
                    <Text className="font-sans text-slate-500 text-xs mt-0.5">
                      Pilih kategori dan tentukan target stok untuk diprediksi AI.
                    </Text>
                  </View>
                </View>

                {baselineItems.length === 0 && (
                  <Text className="font-sans text-slate-500 text-sm text-center py-2 mb-4">
                    Belum ada target stok. Silakan tambah kategori di bawah.
                  </Text>
                )}

                {baselineItems.map((item, index) => (
                  <View key={index} className="flex-row items-center justify-between mb-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl">
                    <Text className="font-sans-bold text-navy-900 flex-1">
                      {CATEGORY_MAP[item.key] || item.key}
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="font-sans text-slate-500 text-xs">Target:</Text>
                      <TextInput
                        className="w-20 border-[1.5px] border-slate-300 rounded-xl px-2 py-1.5 font-sans-bold text-[14px] text-navy-900 bg-white text-center"
                        placeholder="0"
                        keyboardType="numeric"
                        value={item.value}
                        onChangeText={(val) => {
                          const newItems = [...baselineItems];
                          newItems[index].value = val.replace(/[^0-9]/g, "");
                          setBaselineItems(newItems);
                        }}
                      />
                      <TouchableOpacity 
                        onPress={() => {
                          const newItems = baselineItems.filter((_, i) => i !== index);
                          setBaselineItems(newItems);
                        }}
                        className="justify-center px-1"
                      >
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Available Categories Chips */}
                {(() => {
                  const availableCats = Object.keys(CATEGORY_MAP).filter(
                    cat => !baselineItems.some(i => i.key === cat)
                  );
                  if (availableCats.length > 0) {
                    return (
                      <View className="mt-2 mb-4">
                        <Text className="font-sans-semibold text-slate-500 text-xs mb-2">Pilih kategori untuk ditambahkan:</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {availableCats.map(cat => (
                            <TouchableOpacity
                              key={cat}
                              onPress={() => setBaselineItems([...baselineItems, { key: cat, value: "" }])}
                              className="bg-navy-50 border border-navy-200 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                            >
                              <Ionicons name="add" size={16} color="#22548C" />
                              <Text className="font-sans-bold text-navy-700 text-xs">{CATEGORY_MAP[cat]}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  }
                  return null;
                })()}

                {baselineStatus === "success" && (
                  <View className="bg-navy-50 border border-navy-200 p-3 rounded-xl mb-4 flex-row items-start gap-2">
                    <Ionicons name="checkmark-circle" size={20} color="#22548C" />
                    <Text className="font-sans-semibold text-navy-700 flex-1 text-sm leading-relaxed">
                      {baselineMessage}
                    </Text>
                  </View>
                )}
                {baselineStatus === "error" && (
                  <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4 flex-row items-start gap-2">
                    <Ionicons name="warning" size={20} color="#dc2626" />
                    <Text className="font-sans-semibold text-red-700 flex-1 text-sm leading-relaxed">
                      {baselineMessage}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleSaveBaseline}
                  disabled={isBaselineLoading}
                  activeOpacity={0.8}
                  style={{ backgroundColor: isBaselineLoading ? '#cbd5e1' : '#14335A' }}
                  className="rounded-2xl py-3.5 mt-2 items-center justify-center flex-row gap-2"
                >
                  {isBaselineLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={20} color="white" />
                      <Text className="font-sans-bold text-white text-[15px]">Simpan Baseline</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
