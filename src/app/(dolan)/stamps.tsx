import { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Modal
} from "react-native";
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
  id: string;
  title: string;
  description: string;
  required_stamps: number;
};

type RedeemData = {
  redemption_code: string;
  expires_at: string;
};

export default function StampsScreen() {
  const [stampsData, setStampsData] = useState<StampsData>({ total_stamps: 0, stamps: [] });
  const [promos, setPromos] = useState<PromoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

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
        axios.get(`${baseUrl}/api/promos/available`, { headers })
      ]);

      setStampsData(stampsRes.data);
      setPromos(Array.isArray(promosRes.data) ? promosRes.data : []);
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
        contentContainerStyle={{ flexGrow: 1, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#14335A"]} />
        }
      >
        <View className="px-6 mb-6">
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2">
            Stempel & Promo
          </Text>
          <Text className="text-[15px] font-sans text-ink-soft">
            Kumpulkan stempel setiap kali kamu berbelanja dan tukarkan dengan promo menarik!
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-t-[32px] px-6 py-8 shadow-sm">
          {error ? <Alert message={error} type="error" /> : null}

          {isLoading && !isRefreshing ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color="#22548C" />
              <Text className="font-sans text-navy-800 mt-4">Memuat data stempel...</Text>
            </View>
          ) : (
            <>
              {/* Koleksi Stempel */}
              <View className="mb-10">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="font-sans-bold text-navy-900 text-xl">Koleksi Stempel</Text>
                  <View className="bg-orange-100 px-3 py-1.5 rounded-full">
                    <Text className="font-sans-bold text-orange-800 text-sm">
                      Total: {stampsData.total_stamps}
                    </Text>
                  </View>
                </View>

                {stampsData.stamps.length === 0 ? (
                  <View className="bg-slate-50 border border-slate-200 rounded-2xl p-6 items-center">
                    <FontAwesome6 name="stamp" size={40} color="#cbd5e1" />
                    <Text className="font-sans-semibold text-slate-500 mt-4 text-center">
                      Belum ada stempel
                    </Text>
                    <Text className="font-sans text-slate-400 text-sm text-center mt-1">
                      Yuk mulai Dolan dan dapatkan stempel pertamamu!
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {stampsData.stamps.map((stamp) => (
                      <View key={stamp.id} className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl p-3">
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
                )}
              </View>

              {/* Daftar Promo */}
              <View className="pb-8">
                <Text className="font-sans-bold text-navy-900 text-xl mb-4">Promo Tersedia</Text>
                
                {promos.length === 0 ? (
                  <Text className="font-sans text-slate-500 italic text-center py-6">
                    Belum ada promo yang tersedia saat ini.
                  </Text>
                ) : (
                  <View className="gap-4">
                    {promos.map(promo => {
                      const canRedeem = stampsData.total_stamps >= promo.required_stamps;
                      const isRedeeming = redeemingId === promo.id;

                      return (
                        <View key={promo.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]">
                          <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1 pr-4">
                              <Text className="font-sans-bold text-navy-900 text-lg mb-1">{promo.title}</Text>
                              <Text className="font-sans text-slate-600 text-sm">{promo.description}</Text>
                            </View>
                            <View className="bg-slate-100 px-2.5 py-1.5 rounded-md items-center">
                              <Text className="font-sans-bold text-navy-800 text-xs">Butuh</Text>
                              <View className="flex-row items-center gap-1 mt-0.5">
                                <FontAwesome6 name="stamp" size={10} color="#BA5E12" />
                                <Text className="font-sans-bold text-orange-800 text-sm">{promo.required_stamps}</Text>
                              </View>
                            </View>
                          </View>
                          
                          <TouchableOpacity 
                            disabled={!canRedeem || isRedeeming}
                            onPress={() => handleRedeem(promo.id)}
                            className={`w-full rounded-xl py-3 items-center justify-center flex-row gap-2 mt-2 ${
                              canRedeem ? 'bg-navy-900' : 'bg-slate-200'
                            }`}
                          >
                            {isRedeeming ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <>
                                <Ionicons name="ticket" size={18} color={canRedeem ? "white" : "#94a3b8"} />
                                <Text className={`font-sans-bold text-[15px] ${canRedeem ? 'text-white' : 'text-slate-400'}`}>
                                  {canRedeem ? "Tukar Stempel" : "Stempel Kurang"}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
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
      >
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-white w-full rounded-[28px] p-6 items-center">
            <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
            </View>
            <Text className="font-playfair font-bold text-navy-900 text-2xl mb-2 text-center">
              Penukaran Berhasil!
            </Text>
            <Text className="font-sans text-slate-600 text-center mb-6">
              Tunjukkan kode ini ke kasir sebelum waktu habis.
            </Text>

            {/* Kode Voucher */}
            <View className="w-full border-2 border-dashed border-orange-500 bg-orange-50 rounded-2xl py-4 px-6 items-center mb-6">
              <Text className="font-sans text-orange-700 text-sm mb-1 uppercase tracking-widest">
                KODE VOUCHER
              </Text>
              <Text className="font-sans-bold text-navy-900 text-3xl tracking-[4px]">
                {redeemResult?.redemption_code}
              </Text>
            </View>

            {/* Countdown */}
            <View className="flex-row items-center gap-2 mb-8 bg-slate-100 px-4 py-2 rounded-full">
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
