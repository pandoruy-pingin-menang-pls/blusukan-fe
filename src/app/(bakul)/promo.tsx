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
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Alert } from "../../components/ui/Alert";
import apiClient from "../../services/apiClient";
import { useAppStore } from "../../store/useAppStore";

export default function PromoScreen() {
  const merchant_id = useAppStore(state => state.merchant_id);
  const [store, setStore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Promo Form State
  const [promoTitle, setPromoTitle] = useState("");
  const [promoStamps, setPromoStamps] = useState("");
  const [promoDiscount, setPromoDiscount] = useState("");
  const [promoDiscountType, setPromoDiscountType] = useState<"percentage" | "fixed_amount">("percentage");
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoStatus, setPromoStatus] = useState<"idle"|"success"|"error">("idle");
  const [promosList, setPromosList] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"Semua" | "Aktif" | "Nonaktif">("Semua");

  const filteredPromos = filterStatus === "Semua" 
    ? promosList 
    : promosList.filter((p: any) => filterStatus === "Aktif" ? p.is_active : !p.is_active);

  const fetchStoreProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const { data } = await apiClient.get("/api/merchants/me");
      setStore(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal memuat profil toko");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromosList = async () => {
    if (!merchant_id) return;
    try {
      const { data } = await apiClient.get(`/api/merchants/${merchant_id}/promos`);
      setPromosList(data);
    } catch (err) {
      console.error("Gagal mengambil daftar promo:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStoreProfile();
      fetchPromosList();
    }, [merchant_id])
  );

  const handleCreatePromo = async () => {
    if (!promoTitle || !promoStamps || !promoDiscount) {
      setPromoStatus("error");
      setPromoMessage("Judul promo, jumlah stempel, dan diskon wajib diisi.");
      return;
    }
    const stampCount = parseInt(promoStamps, 10);
    const discountVal = parseFloat(promoDiscount);
    if (isNaN(stampCount) || stampCount <= 0 || isNaN(discountVal) || discountVal <= 0) {
      setPromoStatus("error");
      setPromoMessage("Jumlah stempel dan diskon harus berupa angka yang valid.");
      return;
    }

    setIsPromoLoading(true);
    setPromoStatus("idle");
    setPromoMessage("");

    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30); // Default 30 days from now

      await apiClient.post(`/api/merchants/${merchant_id}/promos`, {
        title: promoTitle,
        discount_type: promoDiscountType,
        discount_value: discountVal,
        stamp_required_count: stampCount,
        valid_until: validUntil.toISOString()
      });
      setPromoStatus("success");
      setPromoMessage("Promo berhasil dibuat! Turis kini bisa menukarkan stamp mereka.");
      setPromoTitle("");
      setPromoStamps("");
      setPromoDiscount("");
      fetchPromosList();
    } catch (err: any) {
      setPromoStatus("error");
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setPromoMessage(detail);
      } else if (Array.isArray(detail)) {
        setPromoMessage(detail.map((d: any) => d.msg).join(", "));
      } else {
        setPromoMessage("Gagal membuat promo.");
      }
    } finally {
      setIsPromoLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return d.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2">
          Promo Gamifikasi
        </Text>
        <Text className="text-[15px] font-sans text-ink-soft mb-8">
          Kelola reward untuk turis penjelajah
        </Text>

        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading && store) ? 'flex' : 'none', width: '100%' }}>
          {store && (
            <>
              {store.is_redemption_partner ? (
                <>
                  <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                    <View className="flex-row items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                      <View>
                        <Ionicons name="gift-outline" size={28} color="#ea580c" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-sans-bold text-navy-900 text-lg">
                          Buat Promo Baru
                        </Text>
                        <Text className="font-sans text-slate-500 text-xs mt-0.5">
                          Berikan *reward* bagi turis yang setia!
                        </Text>
                      </View>
                    </View>

                    <View className="mb-4">
                      <Text className="font-sans-semibold text-slate-700 mb-2 pl-1 text-sm">Penawaran Promo (Judul)</Text>
                      <TextInput
                        value={promoTitle}
                        onChangeText={setPromoTitle}
                        placeholder="Contoh: Gratis Es Teh"
                        placeholderTextColor="#94a3b8"
                        editable={!isPromoLoading}
                        className="border-[1.5px] border-slate-300 rounded-2xl px-4 py-3.5 font-sans text-[15px] text-navy-900 bg-slate-50"
                      />
                    </View>

                    <View className="mb-2">
                      <Text className="font-sans-semibold text-slate-700 mb-2 pl-1 text-sm">Syarat Stempel (Jumlah)</Text>
                      <TextInput
                        value={promoStamps}
                        onChangeText={(text) => setPromoStamps(text.replace(/[^0-9]/g, ""))}
                        placeholder="Contoh: 3"
                        keyboardType="numeric"
                        placeholderTextColor="#94a3b8"
                        editable={!isPromoLoading}
                        className="border-[1.5px] border-slate-300 rounded-2xl px-4 py-3.5 font-sans-bold text-[15px] text-navy-900 bg-slate-50"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="font-sans-semibold text-slate-700 mb-2 pl-1 text-sm">Tipe Diskon</Text>
                      <View className="flex-row bg-slate-200/50 p-1.5 rounded-2xl mb-2">
                        <TouchableOpacity 
                          style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: promoDiscountType === "percentage" ? 'white' : 'transparent', elevation: promoDiscountType === "percentage" ? 1 : 0 }}
                          onPress={() => setPromoDiscountType("percentage")}
                        >
                          <Text className={`font-sans-bold text-sm ${promoDiscountType === "percentage" ? "text-navy-900" : "text-slate-500"}`}>
                            Persentase (%)
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', backgroundColor: promoDiscountType === "fixed_amount" ? 'white' : 'transparent', elevation: promoDiscountType === "fixed_amount" ? 1 : 0 }}
                          onPress={() => setPromoDiscountType("fixed_amount")}
                        >
                          <Text className={`font-sans-bold text-sm ${promoDiscountType === "fixed_amount" ? "text-navy-900" : "text-slate-500"}`}>
                            Nominal (Rp)
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View className="mb-2">
                      <Text className="font-sans-semibold text-slate-700 mb-2 pl-1 text-sm">
                        {promoDiscountType === "percentage" ? "Nilai Diskon (%)" : "Nilai Potongan (Rp)"}
                      </Text>
                      <TextInput
                        value={promoDiscount}
                        onChangeText={(text) => setPromoDiscount(text.replace(/[^0-9]/g, ""))}
                        placeholder={promoDiscountType === "percentage" ? "Contoh: 10 (untuk 10%)" : "Contoh: 15000"}
                        keyboardType="numeric"
                        placeholderTextColor="#94a3b8"
                        editable={!isPromoLoading}
                        className="border-[1.5px] border-slate-300 rounded-2xl px-4 py-3.5 font-sans-bold text-[15px] text-navy-900 bg-slate-50"
                      />
                      <Text className="text-xs text-slate-500 mt-1 pl-1">
                        *Masa aktif promo otomatis 30 hari.
                      </Text>
                    </View>

                    {promoStatus === "success" && (
                      <View className="bg-navy-50 border border-navy-200 p-3 rounded-xl mt-3 flex-row items-start gap-2">
                        <Ionicons name="checkmark-circle" size={20} color="#22548C" />
                        <Text className="font-sans-semibold text-navy-700 flex-1 text-sm leading-relaxed">
                          {promoMessage}
                        </Text>
                      </View>
                    )}

                    {promoStatus === "error" && (
                      <View className="bg-red-50 border border-red-200 p-3 rounded-xl mt-3 flex-row items-start gap-2">
                        <Ionicons name="warning" size={20} color="#dc2626" />
                        <Text className="font-sans-semibold text-red-700 flex-1 text-sm leading-relaxed">
                          {promoMessage}
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={handleCreatePromo}
                      disabled={isPromoLoading || !promoTitle || !promoStamps || !promoDiscount}
                      activeOpacity={0.8}
                      className={`rounded-2xl py-3.5 mt-5 items-center justify-center flex-row gap-2 ${
                        isPromoLoading || !promoTitle || !promoStamps || !promoDiscount ? "bg-slate-300" : "bg-primary-orange"
                      }`}
                    >
                      {isPromoLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons name="add-circle" size={20} color="white" />
                          <Text className="font-sans-bold text-white text-[15px]">
                            Terbitkan Promo
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Daftar Promo Aktif */}
                  <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                      <View className="flex-row items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                        <View>
                          <Ionicons name="list-outline" size={28} color="#22548C" />
                        </View>
                        <View className="flex-1">
                          <Text className="font-sans-bold text-navy-900 text-lg">
                            Daftar Promo Saya
                          </Text>
                        </View>
                      </View>

                      {promosList.length > 0 && (
                        <View className="mb-4">
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {["Semua", "Aktif", "Nonaktif"].map((status) => (
                              <TouchableOpacity
                                key={status}
                                onPress={() => setFilterStatus(status as any)}
                                className={`px-4 py-2 rounded-full border ${filterStatus === status ? 'bg-navy-900 border-navy-900' : 'bg-slate-50 border-slate-200'}`}
                              >
                                <Text className={`font-sans-bold text-sm ${filterStatus === status ? 'text-white' : 'text-slate-600'}`}>
                                  {status}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}

                      {promosList.length === 0 ? (
                        <Text className="text-sm font-sans text-slate-500 text-center py-4">
                          Belum ada promo yang dibuat.
                        </Text>
                      ) : filteredPromos.length === 0 ? (
                        <Text className="text-sm font-sans text-slate-500 text-center py-4">
                          Tidak ada promo dengan status {filterStatus}.
                        </Text>
                      ) : (
                        filteredPromos.map((promo: any) => (
                          <View key={promo.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-3">
                            <View className="flex-row justify-between items-center mb-2">
                            <Text className="font-sans-bold text-navy-900 text-[15px] flex-1">
                              {promo.title}
                            </Text>
                            <View className={`px-2 py-1 rounded-md ${promo.is_active ? 'bg-navy-100' : 'bg-slate-200'}`}>
                              <Text className={`text-[10px] font-sans-bold ${promo.is_active ? 'text-navy-700' : 'text-slate-500'}`}>
                                {promo.is_active ? 'AKTIF' : 'NONAKTIF'}
                              </Text>
                            </View>
                          </View>
                          
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="font-sans text-slate-600 text-xs">
                              ID: <Text className="font-sans-bold text-slate-800">{promo.id.substring(0, 8)}</Text>
                            </Text>
                            <Text className="font-sans text-slate-600 text-xs">
                              {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `Rp${promo.discount_value}`} Diskon
                            </Text>
                          </View>
                          
                          <View className="flex-row items-center justify-between mt-1">
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="star" size={12} color="#ea580c" />
                              <Text className="font-sans text-slate-600 text-xs">
                                Butuh {promo.stamp_required_count} stempel
                              </Text>
                            </View>
                            <Text className="font-sans text-slate-500 text-[10px]">
                              S/d {formatDate(promo.valid_until)}
                            </Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </>
              ) : (
                <View className="bg-white/95 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 items-center">
                  <View className="mb-4">
                    <Ionicons name="lock-closed-outline" size={48} color="#94a3b8" />
                  </View>
                  <Text className="font-sans-bold text-navy-900 text-lg text-center mb-2">
                    Fitur Gamifikasi Terkunci
                  </Text>
                  <Text className="font-sans text-slate-500 text-center leading-relaxed">
                    Anda belum terdaftar sebagai Redemption Partner. Hubungi Admin Blusukan untuk mengaktifkan fitur pembuatan dan penukaran promo bagi turis.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
