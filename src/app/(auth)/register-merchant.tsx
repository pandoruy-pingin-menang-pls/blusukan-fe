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
  Switch,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

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

  // ── State baru untuk modal konfirmasi dan form map ───────────────────────
  const [showModal, setShowModal] = useState(false);
  const [tempStoreName, setTempStoreName] = useState("");
  const [latitude, setLatitude] = useState("-7.5666");
  const [longitude, setLongitude] = useState("110.8283");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRedemptionPartner, setIsRedemptionPartner] = useState(false);

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
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        is_redemption_partner: isRedemptionPartner,
      });
      router.replace("/(bakul)/dashboard");
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

          <View className="mb-4">
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Kategori
            </Text>
            <View className="relative">
              <Pressable 
                onPress={() => setShowDropdown(!showDropdown)}
                className="bg-white rounded-btn px-4 py-3.5 border-[1.5px] border-line flex-row justify-between items-center"
              >
                <Text className="font-sans text-ink capitalize">
                  {CATEGORIES.find(c => c.value === category)?.label || category}
                </Text>
                <FontAwesome6 name={showDropdown ? "chevron-up" : "chevron-down"} size={14} color="#8A93A0" />
              </Pressable>
              
              {showDropdown && (
                <View className="bg-white border-[1.5px] border-line rounded-xl mt-2 overflow-hidden">
                  {CATEGORIES.map((cat, idx) => (
                    <Pressable
                      key={cat.value}
                      onPress={() => {
                        setCategory(cat.value);
                        setShowDropdown(false);
                      }}
                      className={`px-4 py-3.5 ${idx !== CATEGORIES.length - 1 ? 'border-b border-line' : ''} ${category === cat.value ? 'bg-navy-50' : ''}`}
                    >
                      <Text className={`font-sans ${category === cat.value ? 'text-navy-900 font-sans-semibold' : 'text-ink-soft'}`}>
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            {errors.category ? (
              <Text className="text-danger font-sans text-xs mt-1">
                {errors.category}
              </Text>
            ) : null}
          </View>

          <View>
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Alamat Lengkap
            </Text>
            <IconInput
              icon="location-outline"
              placeholder="Misal: Jl. Slamet Riyadi No. 1"
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

          <View>
            <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
              Pilih Lokasi di Peta
            </Text>
            <View className="h-64 w-full rounded-2xl overflow-hidden mb-2 border-[1.5px] border-line">
              <WebView
                source={{
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
                      <link rel="stylesheet" href="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css" />
                      <link rel="stylesheet" href="https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.css" />
                      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
                      <script src="https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"></script>
                      <script src="https://unpkg.com/leaflet.locatecontrol/dist/L.Control.Locate.min.js"></script>
                      <style>
                        body { padding: 0; margin: 0; }
                        html, body, #map { height: 100%; width: 100%; }
                        .leaflet-control-attribution { display: none !important; }
                      </style>
                    </head>
                    <body>
                      <div id="map"></div>
                      <script>
                        var lat = ${latitude || -7.5666};
                        var lng = ${longitude || 110.8283};
                        var map = L.map('map', { zoomControl: false }).setView([lat, lng], 14);
                        
                        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                          maxZoom: 19
                        }).addTo(map);

                        var marker = L.marker([lat, lng]).addTo(map);

                        var geocoder = L.Control.geocoder({
                          defaultMarkGeocode: false,
                          placeholder: "Cari jalan atau tempat..."
                        })
                        .on('markgeocode', function(e) {
                          var latlng = e.geocode.center;
                          map.setView(latlng, 16);
                          marker.setLatLng(latlng);
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                            lat: latlng.lat,
                            lng: latlng.lng,
                            name: e.geocode.name
                          }));
                        })
                        .addTo(map);

                        L.control.locate({
                          position: 'topleft',
                          strings: { title: "Ke Lokasi Saya" },
                          locateOptions: { enableHighAccuracy: true }
                        }).addTo(map);

                        map.on('locationfound', function(e) {
                          marker.setLatLng(e.latlng);
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                            name: "Lokasi Saat Ini"
                          }));
                        });

                        map.on('click', function(e) {
                          marker.setLatLng(e.latlng);
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                            lat: e.latlng.lat,
                            lng: e.latlng.lng
                          }));
                        });
                      </script>
                    </body>
                    </html>
                  `,
                  baseUrl: "https://localhost"
                }}
                onMessage={(event) => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    setLatitude(data.lat.toString());
                    setLongitude(data.lng.toString());
                    if (data.name && !address) {
                      setAddress(data.name);
                    }
                  } catch (e) {}
                }}
                geolocationEnabled={true}
                scrollEnabled={false}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">Latitude</Text>
              <TextInput
                className="bg-white rounded-btn px-4 py-3.5 font-sans text-ink border-[1.5px] border-line"
                value={latitude}
                onChangeText={setLatitude}
                keyboardType="numeric"
                placeholder="-7.5666"
              />
            </View>
            <View className="flex-1">
              <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">Longitude</Text>
              <TextInput
                className="bg-white rounded-btn px-4 py-3.5 font-sans text-ink border-[1.5px] border-line"
                value={longitude}
                onChangeText={setLongitude}
                keyboardType="numeric"
                placeholder="110.8283"
              />
            </View>
          </View>
        </View>

        <View className="mb-6 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2 flex-1">
              <Ionicons name="game-controller" size={20} color="#ea580c" />
              <Text className="text-ink-dark font-sans-bold text-base">Redemption Partner</Text>
            </View>
            <Switch 
              value={isRedemptionPartner}
              onValueChange={setIsRedemptionPartner}
              trackColor={{ false: "#cbd5e1", true: "#f97316" }}
              thumbColor="#ffffff"
            />
          </View>
          <Text className="text-ink-soft font-sans text-sm leading-relaxed">
            Aktifkan opsi ini jika Anda bersedia menjadi redemption partner. Selain dapat membuat promo gamifikasi, toko Anda akan mendapatkan prioritas (multiplier) dalam rekomendasi AI kepada turis.
          </Text>
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