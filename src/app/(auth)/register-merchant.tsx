import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// ─── IconInput (sama seperti di Login) ─────────────────────────────────────
// Catatan: kalau di project-mu IconInput belum diekstrak jadi komponen
// terpisah di components/ui/IconInput.tsx, tinggal salin blok ini ke sana
// lalu ganti import di bawah. Kalau sudah ada, hapus definisi ini dan
// pakai: import { IconInput } from "../../components/ui/IconInput";
const IconInput = ({ icon, ...props }: any) => {
  const [focused, setFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center bg-white border-[1.5px] rounded-btn px-3.5 py-3 ${
        focused ? "border-navy-600" : "border-line"
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={focused ? "#22548C" : "#8A93A0"}
        style={{ marginRight: 8 }}
      />
      <TextInput
        placeholderTextColor="#8A93A0"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ color: "#1E2733", flex: 1, fontSize: 16 }}
        {...props}
      />
    </View>
  );
};

const CATEGORIES = [
  { label: "Kuliner Panas", value: "KULINER_PANAS" },
  { label: "Kuliner Dingin", value: "KULINER_DINGIN" },
  { label: "Kerajinan", value: "KERAJINAN" },
  { label: "Lainnya", value: "LAINNYA" },
];

export default function RegisterMerchantScreen() {
  // ── State bisnis (tidak diubah) ──────────────────────────────────────────
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("KULINER_PANAS");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  // ── State baru untuk modal konfirmasi ────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [tempStoreName, setTempStoreName] = useState("");

  const registerMerchant = useAppStore((state) => state.registerMerchant);
  const user = useAppStore((state) => state.user);

  const handleRegister = () => {
    setErrors({});
    setGlobalError("");

    // Validasi frontend (logika tidak diubah)
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Nama toko wajib diisi";
    if (!description) newErrors.description = "Deskripsi toko wajib diisi";
    if (!category) newErrors.category = "Kategori wajib diisi";
    if (!address) newErrors.address = "Alamat wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Validasi sukses -> tampilkan modal konfirmasi dulu, belum panggil API
    setTempStoreName(name);
    setShowModal(true);
  };

  const handleConfirmRegister = async () => {
    setIsLoading(true);
    try {
      await registerMerchant({
        name,
        description,
        category,
        address,
        latitude: -7.250445, // Dummy default
        longitude: 112.768845,
      });
      setShowModal(false);
      router.replace("/(merchant)/home");
    } catch (error: any) {
      setShowModal(false);
      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          const apiErrors: Record<string, string> = {};
          details.forEach((d: any) => {
            const field = d.loc[d.loc.length - 1];
            apiErrors[field] = d.msg;
          });
          setErrors(apiErrors);
        } else {
          setGlobalError("Validasi gagal");
        }
      } else {
        setGlobalError("Terjadi kesalahan, periksa koneksi internet Anda");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelModal = () => {
    setShowModal(false);
  };

  const handleBack = () => {
    router.replace("/(auth)/role-selection");
  };

  return (
    <ImageBackground
      source={require("../../../assets/batik-solo-overlay.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.4 }}
      resizeMode="repeat"
    >
      <LinearGradient
        colors={["#D6EAF8", "#FDEBD0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />

      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBack}
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
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 60 }}>
          <Text
            style={{
              fontSize: 32,
              letterSpacing: 1,
            }}
            className="font-playfair font-semibold text-navy-900 mb-2"
          >
            Profil Toko
          </Text>
          <Text
            style={{ color: "#BA5E12" }}
            className="text-base font-sans mb-8"
          >
            Halo {user?.full_name}, lengkapi data tokomu terlebih dahulu!
          </Text>
        </View>

        <Alert message={globalError} type="error" />

        <View style={{ gap: 16, marginBottom: 32 }}>
          <View>
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Nama
            </Text>
            <IconInput
              icon="storefront-outline"
              placeholder="Nama Toko"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
            />
            {errors.name ? (
              <Text className="text-danger font-sans text-xs -mt-3 mb-1">
                {errors.name}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Deskripsi
            </Text>
            <IconInput
              icon="document-text-outline"
              placeholder="Deskripsi"
              value={description}
              onChangeText={setDescription}
              editable={!isLoading}
            />
            {errors.description ? (
              <Text className="text-danger font-sans text-xs -mt-3 mb-1">
                {errors.description}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Kategori
            </Text>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    className={`px-4 py-2.5 rounded-full border-[1.5px] ${
                      isSelected
                        ? "bg-navy-800 border-navy-800"
                        : "bg-white border-line"
                    }`}
                  >
                    <Text
                      className={`font-sans-medium ${
                        isSelected ? "text-white" : "text-ink-soft"
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            {errors.category ? (
              <Text className="text-danger font-sans text-xs mt-1">
                {errors.category}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Alamat
            </Text>
            <IconInput
              icon="location-outline"
              placeholder="Alamat Lengkap"
              value={address}
              onChangeText={setAddress}
              editable={!isLoading}
            />
            {errors.address ? (
              <Text className="text-danger font-sans text-xs -mt-3 mb-1">
                {errors.address}
              </Text>
            ) : null}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
          style={{
            backgroundColor: isLoading ? "#f0a86a" : "#E8751A",
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text className="font-sans-bold text-white text-base">
            {isLoading ? "Menyimpan..." : "Buat Toko"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmationModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmRegister}
        message={
          <Text>
            Yakin buat toko <Text style={{ fontWeight: "700" }}>{tempStoreName}</Text>?
          </Text>
        }
        confirmText="Ya, Buat Toko"
        confirmColor="#E8751A"
      />
    </ImageBackground>
  );
}