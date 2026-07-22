import { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getToken } from "../../utils/secureStore";
import { useAppStore } from "../../store/useAppStore";
import { Alert } from "../../components/ui/Alert";
import { IconInput } from "../../components/ui/IconInput";

export default function PromoScreen() {
  const merchantId = useAppStore(state => state.merchant_id);

  // -- State untuk Buat Promo --
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "nominal">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [stampRequired, setStampRequired] = useState("1");
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 86400000)); 
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState({ type: "", text: "" });

  // -- State untuk Verifikasi Kode --
  const [redeemCode, setRedeemCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState({ type: "", text: "" });

  const handleCreatePromo = async () => {
    setCreateMsg({ type: "", text: "" });

    if (!merchantId) {
      setCreateMsg({ type: "error", text: "ID Toko tidak ditemukan." });
      return;
    }
    if (!title.trim() || !discountValue || !stampRequired) {
      setCreateMsg({ type: "error", text: "Mohon lengkapi semua data." });
      return;
    }

    const value = parseInt(discountValue, 10);
    const stamp = parseInt(stampRequired, 10);

    if (isNaN(value) || value <= 0) {
      setCreateMsg({ type: "error", text: "Nilai diskon harus lebih dari 0." });
      return;
    }
    if (isNaN(stamp) || stamp <= 0) {
      setCreateMsg({ type: "error", text: "Stempel dibutuhkan minimal 1." });
      return;
    }

    setIsCreating(true);
    try {
      const token = await getToken("access_token");
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      
      const payload = {
        title: title,
        // Kirim lowercase karena biasanya backend Enum menerima lowercase di JSON body
        discount_type: discountType,
        discount_value: value,
        stamp_required_count: stamp,
        valid_until: validUntil.toISOString()
      };

      await axios.post(
        `${baseUrl}/api/merchants/${merchantId}/promos`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCreateMsg({ type: "success", text: `Promo '${title}' berhasil dibuat!` });
      
      setTitle("");
      setDiscountValue("");
      setStampRequired("1");
    } catch (err: any) {
      let errorMsg = "Gagal membuat promo.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') errorMsg = err.response.data.detail;
        else if (err.response.data.detail[0]?.msg) errorMsg = err.response.data.detail[0].msg;
      }
      setCreateMsg({ type: "error", text: errorMsg });
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyCode = async () => {
    setVerifyMsg({ type: "", text: "" });

    if (!merchantId) {
      setVerifyMsg({ type: "error", text: "ID Toko tidak ditemukan." });
      return;
    }
    if (!redeemCode.trim()) {
      setVerifyMsg({ type: "error", text: "Masukkan kode redeem." });
      return;
    }

    setIsVerifying(true);
    try {
      const token = await getToken("access_token");
      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      
      await axios.post(
        `${baseUrl}/api/merchants/${merchantId}/promo-redemptions/${redeemCode}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVerifyMsg({ type: "success", text: "Kode berhasil diverifikasi! Promo dapat digunakan." });
      setRedeemCode("");
    } catch (err: any) {
      let errorMsg = "Kode tidak valid atau sudah kadaluarsa.";
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') errorMsg = err.response.data.detail;
        else if (err.response.data.detail[0]?.msg) errorMsg = err.response.data.detail[0].msg;
      }
      setVerifyMsg({ type: "error", text: errorMsg });
    } finally {
      setIsVerifying(false);
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
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingTop: 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 mb-6">
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2">
            Promo Toko
          </Text>
          <Text className="text-[15px] font-sans text-ink-soft">
            Buat program loyalti stempel untuk menarik lebih banyak pelanggan, dan verifikasi kode dari mereka.
          </Text>
        </View>

        <View className="flex-1 bg-white rounded-t-[32px] px-6 py-8 shadow-sm">
          
          <View className="mb-10">
            <View className="flex-row items-center gap-2 mb-6">
              <Ionicons name="add-circle" size={24} color="#BA5E12" />
              <Text className="font-sans-bold text-navy-900 text-xl">Buat Promo Baru</Text>
            </View>

            {createMsg.text ? (
              <View className="mb-4">
                <Alert message={createMsg.text} type={createMsg.type as any} />
              </View>
            ) : null}

            <View className="gap-4">
              <IconInput
                icon="pricetag-outline"
                placeholder="Judul Promo (mis: Diskon Spesial 10%)"
                value={title}
                onChangeText={setTitle}
                editable={!isCreating}
              />

              <View className="flex-row bg-slate-100 p-1 rounded-xl">
                <TouchableOpacity 
                  onPress={() => setDiscountType("percentage")}
                  className="flex-1 py-2 items-center rounded-lg"
                  style={discountType === "percentage" ? styles.activeTab : styles.inactiveTab}
                >
                  <Text className="font-sans-bold text-sm" style={{ color: discountType === "percentage" ? "#14335A" : "#64748b" }}>
                    Persentase (%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setDiscountType("nominal")}
                  className="flex-1 py-2 items-center rounded-lg"
                  style={discountType === "nominal" ? styles.activeTab : styles.inactiveTab}
                >
                  <Text className="font-sans-bold text-sm" style={{ color: discountType === "nominal" ? "#14335A" : "#64748b" }}>
                    Nominal (Rp)
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <IconInput
                    icon={discountType === "percentage" ? "pie-chart-outline" : "cash-outline"}
                    placeholder={discountType === "percentage" ? "10" : "15000"}
                    value={discountValue}
                    onChangeText={setDiscountValue}
                    keyboardType="numeric"
                    editable={!isCreating}
                  />
                </View>
                <View className="flex-1">
                  <IconInput
                    icon="ribbon-outline"
                    placeholder="Jml Stempel"
                    value={stampRequired}
                    onChangeText={setStampRequired}
                    keyboardType="numeric"
                    editable={!isCreating}
                  />
                </View>
              </View>

              <View>
                <Text className="font-sans-semibold text-navy-800 text-sm ml-1 mb-2">Berlaku Hingga</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(true)}
                  className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl p-4 gap-3"
                >
                  <Ionicons name="calendar-outline" size={20} color="#64748b" />
                  <Text className="font-sans text-navy-900">
                    {validUntil.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={validUntil}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event: any, selectedDate?: Date) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) setValidUntil(selectedDate);
                    }}
                  />
                )}
              </View>

              <TouchableOpacity 
                disabled={isCreating}
                onPress={handleCreatePromo}
                className="w-full rounded-2xl py-4 items-center justify-center flex-row gap-2 mt-2"
                style={{ backgroundColor: "#14335A" }}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                    <Text className="font-sans-bold text-white text-[16px]">Buat Promo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-px bg-slate-200 w-full mb-8" />

          <View className="pb-10">
            <View className="flex-row items-center gap-2 mb-6">
              <Ionicons name="qr-code" size={24} color="#BA5E12" />
              <Text className="font-sans-bold text-navy-900 text-xl">Verifikasi Kode Redeem</Text>
            </View>

            {verifyMsg.text ? (
              <View className="mb-4">
                <Alert message={verifyMsg.text} type={verifyMsg.type as any} />
              </View>
            ) : null}

            <Text className="font-sans text-slate-500 text-sm mb-4">
              Masukkan kode kupon yang ditunjukkan oleh wisatawan.
            </Text>

            <View className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-2 mb-4">
              <TextInput
                value={redeemCode}
                onChangeText={setRedeemCode}
                placeholder="ABC123XXX"
                placeholderTextColor="#cbd5e1"
                autoCapitalize="characters"
                className="font-sans-bold text-navy-900 text-2xl text-center py-4"
                editable={!isVerifying}
              />
            </View>

            <TouchableOpacity 
              disabled={isVerifying || !redeemCode.trim()}
              onPress={handleVerifyCode}
              className="w-full rounded-2xl py-4 items-center justify-center flex-row gap-2"
              style={{ backgroundColor: !redeemCode.trim() ? "#e2e8f0" : "#ea580c" }}
            >
              {isVerifying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="font-sans-bold text-[16px]" style={{ color: !redeemCode.trim() ? "#94a3b8" : "#ffffff" }}>
                  Verifikasi Kode
                </Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  }
});
