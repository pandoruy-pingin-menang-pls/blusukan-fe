import { useState, useEffect, useCallback, useRef } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import { getToken } from "../../utils/secureStore";
import { Alert } from "../../components/ui/Alert";
import { Stamp } from "../../components/ui/Stamp";

// Types
type StampItem = {
  id: string;
  merchant_name: string;
  awarded_at: string;
};

type StampsData = {
  total_stamps: number;
  stamps: StampItem[];
};

type PromoItem = {
  promo_id: string;
  merchant_id: string;
  merchant_name: string;
  title: string;
  stamp_required_count: number;
};

type RedeemData = {
  redemption_code: string;
  expires_at: string;
};

export default function StampsScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [stampsData, setStampsData] = useState<StampsData>({ total_stamps: 0, stamps: [] });
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [promoFilter, setPromoFilter] = useState<"all" | "ready" | "not_ready">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  
  const [filterTime, setFilterTime] = useState<string>("any");
  const [page, setPage] = useState(1);

  const FILTER_OPTIONS = [
    { label: "Semua", value: "any" },
    { label: "< 1 Minggu", value: "week" },
    { label: "< 1 Bulan", value: "month" },
    { label: "< 6 Bulan", value: "6month" },
    { label: "< 1 Tahun", value: "year" },
  ];

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [redeemResult, setRedeemResult] = useState<RedeemData | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("15:00");

  const fetchData = async () => {
    try {
      const token = await getToken("access_token");
      const headers = { Authorization: `Bearer ${token}` };
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

      const [stampsRes, promosRes] = await Promise.all([
        axios.get(`${baseUrl}/api/users/me/stamps`, { headers }),
        axios.get(`${baseUrl}/api/promos?limit=50`, { headers })
      ]);

      setStampsData(stampsRes.data);
      setPromos(promosRes.data?.items || []);
    } catch (err: any) {
      console.log("Fetch error:", err.response?.data || err.message);
      setError("Gagal memuat data stempel. Coba tarik ke bawah untuk memuat ulang.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setError("");
    fetchData();
  }, []);

  const handleRedeem = async (promoId: string) => {
    setRedeemingId(promoId);
    setError("");

    try {
      const token = await getToken("access_token");
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      const { data } = await axios.post(
        `${baseUrl}/api/promos/${promoId}/redeem`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRedeemResult(data);
      setShowModal(true);
    } catch (err: any) {
      let errorMsg = "Gagal menukar stempel.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') errorMsg = err.response.data.detail;
        else if (err.response.data.detail[0]?.msg) errorMsg = err.response.data.detail[0].msg;
      }
      setError(errorMsg);
    } finally {
      setRedeemingId(null);
    }
  };

  const copyToClipboard = async () => {
    if (redeemResult?.redemption_code) {
      await Clipboard.setStringAsync(redeemResult.redemption_code);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setRedeemResult(null);
    // Refresh data after redeeming
    setIsLoading(true);
    fetchData();
  };

  // Timer Effect
  useEffect(() => {
    if (!showModal || !redeemResult?.expires_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(redeemResult.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showModal, redeemResult]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#14335A"]} />
        }
      >
        <View className="px-6 mb-6">
          <View className="shadow-sm">
            <View className="bg-blue-50 rounded-t-2xl p-4 border border-navy-900">
              <View className="flex-row items-center">
                <Ionicons name="ticket" size={20} color="#14335A" />
                <Text className="font-sans-bold text-navy-900 text-[15px] ml-3">
                  <Text className="text-orange-600">{promos.filter(p => stampsData.total_stamps >= p.stamp_required_count).length}</Text> Promo siap digunakan!
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              onPress={() => {
                const ready = promos.filter(p => stampsData.total_stamps >= p.stamp_required_count).length;
                if (ready > 0) {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                } else {
                  router.push("/(dolan)/itinerary");
                }
              }}
              className="bg-white flex-row justify-between items-center px-4 py-3 border border-t-0 border-slate-300 rounded-b-2xl"
              activeOpacity={0.8}
            >
              <Text className="font-sans-semibold text-black text-sm">
                {promos.filter(p => stampsData.total_stamps >= p.stamp_required_count).length > 0 ? "Tukar sekarang" : "Mulai kumpulkan stempel"}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 px-6 pb-8">
          {error ? <Alert message={error} type="error" /> : null}

          {isLoading && !isRefreshing ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#22548C" />
              <Text className="font-sans text-navy-800 mt-4">Memuat data stempel...</Text>
            </View>
          ) : (
            <>
              {/* Koleksi Stempel Card */}
              <View className="bg-white rounded-[24px] p-5 shadow-sm mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-playfair font-semibold text-navy-900 text-2xl">Koleksi Stempel</Text>
                  <Text className="font-sans-bold text-slate-500 text-sm">
                    Total: {stampsData.total_stamps}
                  </Text>
                </View>
                
                <View className="h-[1px] bg-slate-100 w-full mb-4" />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  <View className="flex-row gap-2">
                    {FILTER_OPTIONS.map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => { setFilterTime(opt.value); setPage(1); }}
                        className={`px-4 py-2 rounded-full border ${
                          filterTime === opt.value ? 'bg-navy-900 border-navy-900' : 'bg-white border-slate-300'
                        }`}
                      >
                        <Text className={`font-sans-medium ${filterTime === opt.value ? 'text-white' : 'text-slate-600'}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {(() => {
                  const filteredStamps = [...stampsData.stamps].filter(s => {
                    if (filterTime === "any") return true;
                    const awarded = new Date(s.awarded_at);
                    const diffTime = Math.abs(new Date().getTime() - awarded.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (filterTime === "week") return diffDays <= 7;
                    if (filterTime === "month") return diffDays <= 30;
                    if (filterTime === "6month") return diffDays <= 180;
                    if (filterTime === "year") return diffDays <= 365;
                    return true;
                  }).sort((a, b) => new Date(b.awarded_at).getTime() - new Date(a.awarded_at).getTime());

                  const paginatedStamps = filteredStamps.slice((page - 1) * 5, page * 5);
                  const totalPages = Math.ceil(filteredStamps.length / 5);

                  if (filteredStamps.length === 0) {
                    return (
                      <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6 items-center">
                        <FontAwesome6 name="stamp" size={40} color="#cbd5e1" />
                        <Text className="font-sans-semibold text-slate-500 mt-4 text-center">
                          Belum ada stempel
                        </Text>
                        <Text className="font-sans text-slate-400 text-sm text-center mt-1">
                          Yuk mulai Dolan dan dapatkan stempel pertamamu!
                        </Text>
                      </View>
                    );
                  }

                  return (
                    <View>
                      <View className="gap-3">
                        {paginatedStamps.map((stamp, index) => (
                          <View key={stamp.id || `stamp-${index}`} className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl p-3">
                            <View className="mr-3">
                              <Stamp filled={true} size="big" />
                            </View>
                            <View className="flex-1">
                              <Text className="font-sans-bold text-navy-900 text-[15px]" numberOfLines={1}>
                                {stamp.merchant_name}
                              </Text>
                              <Text className="font-sans text-slate-500 text-xs mt-0.5">
                                {formatDate(stamp.awarded_at)}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      {totalPages > 1 && (
                        <View className="flex-row justify-between items-center mt-5 border-t border-slate-100 pt-4">
                          <TouchableOpacity 
                            disabled={page === 1} 
                            onPress={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2"
                          >
                            <Ionicons name="chevron-back" size={20} color={page === 1 ? '#94a3b8' : '#14335A'} />
                          </TouchableOpacity>
                          <Text className="font-sans-medium text-slate-500">Hal {page} dari {totalPages}</Text>
                          <TouchableOpacity 
                            disabled={page === totalPages} 
                            onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-2"
                          >
                            <Ionicons name="chevron-forward" size={20} color={page === totalPages ? '#94a3b8' : '#14335A'} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })()}
              </View>

              {/* Daftar Promo Card */}
              <View className="bg-white rounded-[24px] p-5 shadow-sm mb-8">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-playfair font-semibold text-navy-900 text-2xl">Promo Tersedia</Text>
                </View>
                
                <View className="h-[1px] bg-slate-100 w-full mb-4" />

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  <View className="flex-row gap-2">
                    {[
                      { label: "Semua", value: "all" },
                      { label: "Bisa Ditukar", value: "ready" },
                      { label: "Belum Cukup", value: "not_ready" },
                    ].map(opt => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setPromoFilter(opt.value as any)}
                        className={`px-4 py-2 rounded-full border ${
                          promoFilter === opt.value ? 'bg-navy-900 border-navy-900' : 'bg-white border-slate-300'
                        }`}
                      >
                        <Text className={`font-sans-medium ${promoFilter === opt.value ? 'text-white' : 'text-slate-600'}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                
                {(() => {
                  const filteredPromos = promos.filter(promo => {
                    const isReady = stampsData.total_stamps >= promo.stamp_required_count;
                    if (promoFilter === "ready") return isReady;
                    if (promoFilter === "not_ready") return !isReady;
                    return true;
                  });

                  if (filteredPromos.length === 0) {
                    return (
                      <Text className="font-sans text-slate-500 italic text-center py-6">
                        Belum ada promo yang tersedia saat ini.
                      </Text>
                    );
                  }

                  return (
                    <View className="gap-4">
                      {filteredPromos.map((promo, index) => {
                        const canRedeem = stampsData.total_stamps >= promo.stamp_required_count;
                        const isRedeeming = redeemingId === promo.promo_id;

                        return (
                          <View key={promo.promo_id || `promo-${index}`} className="mb-4 shadow-sm">
                            {/* Bagian Atas - Gradient Overlay Batik */}
                            <View className="rounded-t-2xl overflow-hidden border border-navy-900 border-b-0">
                              <LinearGradient
                                colors={["#EA580C", "#14335A"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                              >
                                <ImageBackground
                                  source={require("../../../assets/promo-batik-overlay.png")}
                                  style={{ height: 96 }}
                                  imageStyle={{ opacity: 0.15 }}
                                />
                              </LinearGradient>
                            </View>

                            {/* Bagian Bawah - Nyantol */}
                            <View className="bg-white flex-row justify-between items-center px-4 py-4 border border-t-0 border-slate-300 rounded-b-xl">
                              <View className="flex-1 pr-3">
                                <Text className="font-sans-bold text-navy-900 text-lg">{promo.title}</Text>
                              </View>
                              
                              <TouchableOpacity 
                                disabled={!canRedeem || isRedeeming}
                                onPress={() => handleRedeem(promo.promo_id)}
                                className={`rounded-full border-[1.5px] border-dashed px-4 py-2 ${canRedeem ? 'border-navy-900' : 'border-slate-300 bg-slate-50'}`}
                                activeOpacity={0.8}
                              >
                                {isRedeeming ? (
                                  <ActivityIndicator color="#14335A" size="small" />
                                ) : (
                                  <Text className={`font-sans-bold text-sm ${canRedeem ? 'text-navy-900' : 'text-slate-400'}`}>
                                    {canRedeem ? "Tukarkan" : "Belum Cukup"}
                                  </Text>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })()}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal Sukses Redeem */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-[28px] px-6 pb-6 pt-12 items-center">
            <View className="mb-4">
              <Image 
                source={require('../../../assets/mblus/happy-jump.png')} 
                style={{ width: 120, height: 120 }} 
                resizeMode="contain" 
              />
            </View>
            <Text className="font-playfair font-semibold text-navy-900 text-2xl mb-2 text-center">
              Penukaran Berhasil!
            </Text>
            <Text className="font-sans text-slate-600 text-center mb-6">
              Tunjukkan kode ini ke kasir{'\n'}sebelum waktu habis.
            </Text>

            {/* Kode Voucher */}
            <View className="w-full rounded-2xl overflow-hidden border-2 border-orange-500 mb-6 bg-orange-50">
              <ImageBackground
                source={require('../../../assets/voucher-batik-overlay.png')}
                style={{ width: '100%', alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 }}
                imageStyle={{ opacity: 0.15, resizeMode: 'cover', transform: [{ scale: 1.5 }] }}
              >
                <Text className="font-sans-bold text-orange-700 text-sm mb-1 uppercase tracking-widest">
                  KODE VOUCHER
                </Text>
                <Text className="font-sans-bold text-navy-900 text-3xl tracking-[4px]">
                  {redeemResult?.redemption_code}
                </Text>
              </ImageBackground>
            </View>

            {/* Countdown */}
            <View className="flex-row items-center gap-2 mb-8">
              <Ionicons name="timer-outline" size={20} color="#ef4444" />
              <Text className="font-sans-bold text-slate-700">
                Sisa Waktu: <Text className="text-red-500">{timeLeft}</Text>
              </Text>
            </View>

            <View className="w-full gap-3">
              <TouchableOpacity 
                onPress={copyToClipboard}
                className="w-full bg-navy-900 rounded-xl py-3.5 items-center flex-row justify-center gap-2"
              >
                <Ionicons name="copy-outline" size={18} color="white" />
                <Text className="font-sans-bold text-white text-[15px]">Salin Kode</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleCloseModal}
                className="w-full border border-slate-300 rounded-xl py-3.5 items-center"
              >
                <Text className="font-sans-bold text-slate-700 text-[15px]">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
