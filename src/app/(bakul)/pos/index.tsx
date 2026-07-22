import { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  ImageBackground, 
  StyleSheet 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppStore } from "../../../store/useAppStore";
import apiClient from "../../../services/apiClient";

export default function PosScreen() {
  const merchant_id = useAppStore(state => state.merchant_id);
  const [mode, setMode] = useState<"transaksi" | "promo">("transaksi");
  
  // Promo state
  const [code, setCode] = useState("");
  
  // Transaction state
  const [nominal, setNominal] = useState("");
  const [itineraryId, setItineraryId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const resetState = () => {
    setStatus("idle");
    setMessage("");
  };

  const handleConfirmPromo = async () => {
    if (!code || code.length < 6) {
      setStatus("error");
      setMessage("Masukkan kode promo yang valid (minimal 6 karakter).");
      return;
    }
    setIsLoading(true);
    resetState();
    try {
      await apiClient.post(`/api/merchants/${merchant_id}/promo-redemptions/${code}/confirm`);
      setStatus("success");
      setMessage("Promo berhasil dikonfirmasi! Berikan diskon kepada turis.");
      setCode("");
    } catch (err: any) {
      setStatus("error");
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setMessage(detail);
      } else if (Array.isArray(detail)) {
        setMessage(detail.map((d: any) => d.msg).join(", "));
      } else {
        setMessage("Gagal mengonfirmasi promo. Mungkin kode salah atau sudah expired.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordTransaction = async () => {
    const amount = parseInt(nominal.replace(/[^0-9]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) {
      setStatus("error");
      setMessage("Masukkan total pembayaran yang valid.");
      return;
    }
    setIsLoading(true);
    resetState();
    
    try {
      const payload: any = { nominal_value: amount };
      if (itineraryId.trim()) {
        payload.linked_itinerary_id = itineraryId.trim();
      }

      const res = await apiClient.post(`/api/merchants/${merchant_id}/transactions`, payload);
      setStatus("success");
      
      if (res.data.stamp_awarded) {
        setMessage("Transaksi sukses dicatat! 🎉 Turis telah otomatis menerima stempel gamification.");
      } else {
        setMessage("Transaksi sukses dicatat tanpa stempel (ID Rute kosong atau tidak valid).");
      }
      
      setNominal("");
      setItineraryId("");
    } catch (err: any) {
      setStatus("error");
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setMessage(detail);
      } else if (Array.isArray(detail)) {
        setMessage(detail.map((d: any) => d.msg).join(", "));
      } else {
        setMessage("Gagal mencatat transaksi.");
      }
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900">
            Kasir
          </Text>
          <Text className="text-[16px] font-sans text-ink-soft mt-1">
            Catat pembayaran dan validasi promo.
          </Text>
        </View>

        {/* Custom Tabs */}
        <View className="flex-row bg-slate-200/50 p-1.5 rounded-2xl mb-6">
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: mode === "transaksi" ? 'white' : 'transparent', elevation: mode === "transaksi" ? 1 : 0 }}
            onPress={() => { setMode("transaksi"); resetState(); }}
          >
            <Text className={`font-sans-bold ${mode === "transaksi" ? "text-navy-900" : "text-slate-500"}`}>
              Transaksi Baru
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: mode === "promo" ? 'white' : 'transparent', elevation: mode === "promo" ? 1 : 0 }}
            onPress={() => { setMode("promo"); resetState(); }}
          >
            <Text className={`font-sans-bold ${mode === "promo" ? "text-navy-900" : "text-slate-500"}`}>
              Validasi Promo
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "transaksi" ? (
          <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm">
            <View className="items-center mb-6">
              <View className="mb-4">
                <Ionicons name="receipt-outline" size={40} color="#ea580c" />
              </View>
              <Text className="font-sans-bold text-navy-900 text-xl text-center">
                Total Pembayaran
              </Text>
            </View>

            <View className="mb-4">
              <Text className="font-sans-semibold text-slate-700 mb-2 pl-1">Nominal (Rp)</Text>
              <TextInput
                value={nominal}
                onChangeText={(text) => setNominal(text.replace(/[^0-9]/g, ""))}
                placeholder="0"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                editable={!isLoading}
                className="border-[1.5px] border-slate-300 rounded-2xl px-4 py-4 font-sans-bold text-2xl text-navy-900 bg-slate-50 tracking-wider"
              />
            </View>

            <View className="mb-2">
              <Text className="font-sans-semibold text-slate-700 mb-2 pl-1">ID Rute Turis (Opsional)</Text>
              <TextInput
                value={itineraryId}
                onChangeText={setItineraryId}
                placeholder="Untuk memberikan stempel gamification"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                editable={!isLoading}
                className="border-[1.5px] border-slate-300 rounded-2xl px-4 py-3 font-sans text-base text-navy-900 bg-slate-50"
              />
              <Text className="text-xs text-slate-500 mt-2 pl-1 italic">
                * Jika diisi dengan ID valid, turis akan otomatis mendapatkan stempel.
              </Text>
            </View>

            {status === "success" && (
              <View className="bg-navy-50 border border-navy-200 p-4 rounded-xl mt-4 flex-row items-start gap-3">
                <Ionicons name="checkmark-circle" size={24} color="#22548C" />
                <Text className="font-sans-semibold text-navy-700 flex-1 leading-relaxed">
                  {message}
                </Text>
              </View>
            )}

            {status === "error" && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4 flex-row items-start gap-3">
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text className="font-sans-semibold text-red-700 flex-1 leading-relaxed">
                  {message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleRecordTransaction}
              disabled={isLoading || !nominal}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                marginTop: 24,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                backgroundColor: isLoading || !nominal ? '#cbd5e1' : '#ea580c'
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={24} color="white" />
                  <Text className="font-sans-bold text-white text-[16px]">
                    Simpan Transaksi
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm">
            <View className="items-center mb-6">
              <View className="mb-4">
                <Ionicons name="qr-code-outline" size={40} color="#22548C" />
              </View>
              <Text className="font-sans-bold text-navy-900 text-xl text-center">
                Validasi Kode Promo
              </Text>
              <Text className="font-sans text-slate-500 text-center mt-2 px-2 text-sm">
                Turis akan memberikan kode alfanumerik (misal: A3F9C2B1) setelah mereka mendapatkan promo dari Blusukan.
              </Text>
            </View>

            <TextInput
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholder="KODE PROMO"
              placeholderTextColor="#94a3b8"
              autoCapitalize="characters"
              maxLength={10}
              editable={!isLoading}
              className="border-[1.5px] border-slate-300 rounded-2xl px-4 py-4 text-center font-sans-bold text-2xl text-navy-900 bg-slate-50 tracking-[4px]"
            />

            {status === "success" && (
              <View className="bg-navy-50 border border-navy-200 p-4 rounded-xl mt-4 flex-row items-start gap-3">
                <Ionicons name="checkmark-circle" size={24} color="#22548C" />
                <Text className="font-sans-semibold text-navy-700 flex-1 leading-relaxed">
                  {message}
                </Text>
              </View>
            )}

            {status === "error" && (
              <View className="bg-red-50 border border-red-200 p-4 rounded-xl mt-4 flex-row items-start gap-3">
                <Ionicons name="warning" size={24} color="#dc2626" />
                <Text className="font-sans-semibold text-red-700 flex-1 leading-relaxed">
                  {message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleConfirmPromo}
              disabled={isLoading || !code}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                marginTop: 24,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                backgroundColor: isLoading || !code ? '#cbd5e1' : '#ea580c'
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="scan-circle" size={24} color="white" />
                  <Text className="font-sans-bold text-white text-[16px]">
                    Konfirmasi Promo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </ImageBackground>
  );
}
