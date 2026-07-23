import { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Image
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as Location from "expo-location";
import { getToken } from "../../../utils/secureStore";
import { Alert } from "../../../components/ui/Alert";

type ItineraryItem = {
  id: string;
  raw_query: string;
  created_at: string;
  waypoints: any[];
};

const ITEMS_PER_PAGE = 5;
const FILTER_OPTIONS = [
  { label: "Semua", value: "any" },
  { label: "< 1 Minggu", value: "week" },
  { label: "< 1 Bulan", value: "month" },
  { label: "< 6 Bulan", value: "6month" },
  { label: "< 1 Tahun", value: "year" },
];

const HistoryCard = ({ item }: { item: ItineraryItem }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <View className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-white">
      <TouchableOpacity 
        onPress={() => router.push(`/(dolan)/itinerary/${item.id}`)}
        activeOpacity={0.9}
      >
        <View className="bg-navy-900 relative">
          <ImageBackground
            source={require("../../../../assets/dashboard-batik-overlay.png")}
            style={{ paddingHorizontal: 16, paddingVertical: 14, minHeight: 64, justifyContent: 'center' }}
            imageStyle={{ opacity: 0.4 }}
            resizeMode="cover"
          >
            <Text className="font-sans-bold text-white text-[15px] leading-6 pr-4" numberOfLines={2}>
              "{item.raw_query || "Rute Tanpa Judul"}"
            </Text>
          </ImageBackground>
        </View>
      </TouchableOpacity>
      
      <View className="flex-row items-center justify-between px-4 py-3 bg-white">
        <Text className="font-sans text-slate-500 text-xs">
          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="border border-slate-300 px-3 py-1.5 rounded-lg">
            <Text className="font-sans-semibold text-slate-600 text-[10px] uppercase">
              {item.waypoints?.length || 0} Tempat
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => setExpanded(!expanded)} 
            className="p-1 rounded-full bg-slate-50 border border-slate-100"
          >
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      {expanded && item.waypoints && item.waypoints.length > 0 && (
        <View className="px-4 pb-4 bg-white border-t border-slate-100 pt-3 gap-3">
          {item.waypoints.map((wp, idx) => (
            <View key={idx} className="flex-row items-start gap-3">
              <View className="w-6 h-6 rounded-full bg-orange-50 items-center justify-center border border-orange-100 mt-0.5">
                <Text className="font-sans-bold text-orange-600 text-[10px]">{idx + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans-semibold text-navy-800 text-[13px] leading-5">{wp.name}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function ItineraryInputScreen() {
  const { search } = useLocalSearchParams<{ search?: string }>();
  const [query, setQuery] = useState(search || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // History State
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [filterTime, setFilterTime] = useState<string>("any");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const token = await getToken("access_token");
      if (!token) return;
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:8000";
      const res = await axios.get(`${baseUrl}/api/itineraries/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        setItineraries(res.data);
      }
    } catch (err) {
      console.log("Failed to fetch history:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredItineraries = itineraries.filter(it => {
    if (filterTime === "any") return true;
    
    const itemDate = new Date(it.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - itemDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (filterTime === "week") return diffDays <= 7;
    if (filterTime === "month") return diffDays <= 30;
    if (filterTime === "6month") return diffDays <= 180;
    if (filterTime === "year") return diffDays <= 365;
    
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // sort newest first

  const totalPages = Math.max(1, Math.ceil(filteredItineraries.length / ITEMS_PER_PAGE));
  const paginatedItineraries = filteredItineraries.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // When filter changes, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [filterTime]);

  const handleGenerate = async () => {
    if (!query.trim()) {
      setError("Ceritakan dulu dong mau jalan-jalan ke mana dan cari apa :)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Minta izin lokasi
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Izin akses lokasi dibutuhkan untuk mencari tempat terdekat dari posisimu.");
        setIsLoading(false);
        return;
      }

      // 2. Ambil lokasi saat ini (dengan fallback agar tidak hang)
      let current_lat = -7.5666; // Default: Solo
      let current_lon = 110.8166;
      
      try {
        let location = await Location.getLastKnownPositionAsync();
        if (!location) {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low
          });
        }
        if (location) {
          current_lat = location.coords.latitude;
          current_lon = location.coords.longitude;
        }
      } catch (locErr) {
        console.warn("Gagal mendapatkan lokasi akurat, menggunakan lokasi default Solo.", locErr);
      }

      // 3. Panggil API
      const token = await getToken("access_token");
      
      const payload = {
        raw_query: query,
        current_lat,
        current_lon
      };

      const { data } = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/itineraries`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Sukses, redirect ke hasil
      router.push(`/(dolan)/itinerary/${data.id}`);
      
      // Reset input jika kembali
      setQuery("");
      
    } catch (err: any) {
      let errorMsg = "Gagal membuat rute. Coba ceritakan dengan kalimat lain.";
      if (err.response?.data) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail) && err.response.data.detail[0]?.msg) {
          errorMsg = err.response.data.detail[0].msg;
        } else if (err.response.data.message) {
          errorMsg = err.response.data.message;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
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
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginTop: 40 }}>
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2">
            Mau Dolan ke Mana?
          </Text>
          <Text className="text-[15px] font-sans text-ink-soft mb-8">
            Ceritakan rencanamu, dan Mblus akan menyusun rute terbaik khusus untukmu.
          </Text>
        </View>

        <Alert message={error} type="error" />

        <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm mb-4 relative">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="sparkles" size={20} color="#BA5E12" />
            <Text className="font-sans-bold text-navy-900 text-lg">
              Asisten Rute Cerdas
            </Text>
          </View>

          <View className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[140px] mb-6">
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Contoh: Aku mau cari batik kualitas premium di sekitar Pasar Klewer lalu makan siang yang khas Solo..."
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              className="font-sans text-navy-900 text-[15px] flex-1 p-0"
              style={{ minHeight: 100 }}
              editable={!isLoading}
            />
          </View>

          <View style={{ display: isLoading ? 'flex' : 'none', alignItems: 'center', marginBottom: 20 }}>
            <ActivityIndicator size="large" color="#22548C" />
            <Text className="font-sans-semibold text-navy-800 mt-4 text-center">
              Meminta petunjuk...
            </Text>
            <Text className="font-sans text-ink-soft text-xs mt-1 text-center px-4">
              Mblus sedang menganalisis lokasi dan mencari tempat terbaik untukmu
            </Text>
          </View>

          <TouchableOpacity 
            onPress={handleGenerate}
            disabled={isLoading}
            activeOpacity={0.8}
            style={{ display: isLoading ? 'none' : 'flex' }}
            className="w-full bg-navy-900 rounded-2xl py-4 items-center justify-center flex-row gap-2"
          >
            <Ionicons name="navigate-circle-outline" size={22} color="white" />
            <Text className="font-sans-bold text-white text-[16px]">
              Buatkan Rute Dolan
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View className="pt-2 pb-4">
          <Text className="text-sm font-sans-semibold text-ink-soft mb-3 ml-2">Tips Pencarian:</Text>
          <View className="flex-row gap-2 flex-wrap">
            <View className="bg-white/60 border border-slate-200 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-sans text-navy-800">Sebutkan lokasi spesifik</Text>
            </View>
            <View className="bg-white/60 border border-slate-200 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-sans text-navy-800">Kategori (Makan, Belanja)</Text>
            </View>
            <View className="bg-white/60 border border-slate-200 px-3 py-1.5 rounded-full">
              <Text className="text-xs font-sans text-navy-800">Preferensi waktu</Text>
            </View>
          </View>
        </View>

        {/* Riwayat Perjalanan Section */}
        <View className="mt-8 mb-12">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-playfair font-semibold text-navy-900 ml-2">
              Riwayat Perjalanan
            </Text>
            
            <View className="relative z-50">
              <TouchableOpacity
                onPress={() => setIsFilterOpen(!isFilterOpen)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 flex-row items-center justify-between w-36 h-10 shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-slate-700 font-sans-semibold text-xs">
                  {FILTER_OPTIONS.find(opt => opt.value === filterTime)?.label || "Semua"}
                </Text>
                <Ionicons name={isFilterOpen ? "chevron-up" : "chevron-down"} size={16} color="#22548C" />
              </TouchableOpacity>
              
              {isFilterOpen && (
                <View className="absolute right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-lg w-36 z-50 overflow-hidden">
                  {FILTER_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        setFilterTime(opt.value);
                        setIsFilterOpen(false);
                      }}
                      className="px-3 py-2.5 border-b border-slate-100 active:bg-slate-50"
                    >
                      <Text className="text-slate-700 font-sans text-xs">
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* History List */}
          {isHistoryLoading ? (
            <ActivityIndicator size="large" color="#22548C" className="my-8" />
          ) : paginatedItineraries.length === 0 ? (
            <View className="bg-white/80 rounded-2xl p-6 items-center border border-slate-100 shadow-sm">
              <Text className="font-sans text-slate-500 text-center">Belum ada riwayat perjalanan untuk filter ini.</Text>
            </View>
          ) : (
            <View className="gap-3">
              {paginatedItineraries.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </View>
          )}

          {/* Pagination Controls */}
          {filteredItineraries.length > ITEMS_PER_PAGE && (
            <View className="flex-row justify-center items-center gap-4 mt-6">
              <TouchableOpacity
                onPress={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`w-10 h-10 rounded-full items-center justify-center border ${
                  page === 1 ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'
                }`}
              >
                <Ionicons name="chevron-back" size={20} color={page === 1 ? "#cbd5e1" : "#475569"} />
              </TouchableOpacity>
              
              <Text className="font-sans-semibold text-navy-900">
                Hal {page} dari {totalPages}
              </Text>

              <TouchableOpacity
                onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`w-10 h-10 rounded-full items-center justify-center border ${
                  page === totalPages ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'
                }`}
              >
                <Ionicons name="chevron-forward" size={20} color={page === totalPages ? "#cbd5e1" : "#475569"} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
