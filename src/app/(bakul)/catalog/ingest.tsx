import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  TextInput
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { getToken } from "../../../utils/secureStore";
import { useAppStore } from "../../../store/useAppStore";
import { Alert } from "../../../components/ui/Alert";

type DraftItem = {
  id: string; // generated locally for unique keys
  item_name: string;
  price: string;
  category: string;
  source_type: "photo" | "manual";
};

export default function CatalogIngestScreen() {
  const merchant_id = useAppStore(state => state.merchant_id);
  
  const params = useLocalSearchParams();
  
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Initialize manual mode if navigated via ?mode=manual
  React.useEffect(() => {
    if (params.mode === "manual") {
      setIsManualMode(true);
      if (draftItems.length === 0) {
        setDraftItems([{
          id: `manual_${Date.now()}`,
          item_name: "",
          price: "0",
          category: "culinary",
          source_type: "manual"
        }]);
      }
    }
  }, [params.mode]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pickImage = async (source: "camera" | "gallery") => {
    setError("");
    try {
      let result;
      if (source === "camera") {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
          setError("Izin akses kamera dibutuhkan.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
          setError("Izin akses galeri dibutuhkan.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        uploadPhoto(uri, result.assets[0].fileName || "photo.jpg", result.assets[0].mimeType || "image/jpeg");
      }
    } catch (err) {
      setError("Gagal mengambil gambar.");
    }
  };

  const uploadPhoto = async (uri: string, name: string, type: string) => {
    if (!merchant_id) {
      setError("ID Toko tidak ditemukan.");
      return;
    }

    setIsUploading(true);
    setError("");
    
    try {
      const token = await getToken("access_token");
      
      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: name,
        type: type,
      } as any);

      const { data } = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/merchants/${merchant_id}/catalog/ingest`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          } 
        }
      );
      
      setImageUrl(data.image_url);
      
      const rawItems = Array.isArray(data) ? data : (data.draft_items || []);
      const itemsWithId = rawItems.map((item: any, index: number) => ({
        id: `draft_${index}_${Date.now()}`,
        item_name: item.item_name || "",
        price: item.price ? String(item.price) : "0",
        category: item.category || "culinary",
        source_type: "photo"
      }));
      
      setDraftItems(itemsWithId);
      
    } catch (err: any) {
      setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Gagal mengekstrak menu dari foto. Pastikan foto terbaca jelas.");
      setPhotoUri(null); // Reset so user can try again
    } finally {
      setIsUploading(false);
    }
  };

  const updateDraftItem = (id: string, field: keyof DraftItem, value: string) => {
    setDraftItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeDraftItem = (id: string) => {
    setDraftItems(prev => prev.filter(item => item.id !== id));
  };

  const addManualItem = () => {
    const newItem: DraftItem = {
      id: `manual_${Date.now()}`,
      item_name: "",
      price: "0",
      category: "culinary",
      source_type: "manual"
    };
    setDraftItems(prev => [...prev, newItem]);
  };

  const confirmCatalog = async () => {
    if (!merchant_id) return;
    
    // Validasi
    const invalidItems = draftItems.filter(i => !i.item_name.trim() || !i.price);
    if (invalidItems.length > 0) {
      setError("Pastikan semua menu memiliki nama dan harga.");
      return;
    }
    if (draftItems.length === 0) {
      setError("Tidak ada menu yang ditambahkan.");
      return;
    }

    setIsSaving(true);
    setError("");
    
    try {
      const token = await getToken("access_token");
      
      const payload = {
        image_url: imageUrl || "",
        items: draftItems.map(item => ({
          item_name: item.item_name,
          price: parseFloat(item.price) || 0,
          category: item.category,
          source_type: item.source_type
        }))
      };

      await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/merchants/${merchant_id}/catalog/confirm`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Katalog berhasil disimpan!");
      setTimeout(() => {
        router.back();
      }, 1500);
      
    } catch (err: any) {
      setError(err.response?.data?.detail?.[0]?.msg || err.response?.data?.detail || "Gagal menyimpan katalog.");
    } finally {
      setIsSaving(false);
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginTop: 60 }}>
          <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2">
            Pindai Menu
          </Text>
          <Text className="text-[15px] font-sans text-ink-soft mb-6">
            Otomatis deteksi daftar menu dan harga dari foto menggunakan AI.
          </Text>
        </View>

        <Alert message={error} type="error" />
        <Alert message={success} type="success" />

        {/* Tahap 1: Pilih / Upload Foto */}
        {!photoUri && !isUploading && !isManualMode && (
          <View className="gap-4 mb-8">
            <TouchableOpacity 
              className="bg-white/90 border-2 border-dashed border-navy-300 rounded-3xl p-10 items-center justify-center shadow-sm"
              onPress={() => pickImage("camera")}
              activeOpacity={0.8}
            >
              <View className="w-16 h-16 bg-navy-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="camera" size={32} color="#22548C" />
              </View>
              <Text className="font-sans-bold text-navy-900 text-lg text-center mb-1">
                Ambil Foto Menu
              </Text>
              <Text className="font-sans text-ink-soft text-center text-sm">
                Buka kamera untuk memotret daftar menu secara langsung
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white/80 border border-slate-200 rounded-2xl p-4 items-center justify-center flex-row gap-3 shadow-sm"
              onPress={() => pickImage("gallery")}
              activeOpacity={0.8}
            >
              <Ionicons name="images-outline" size={20} color="#475569" />
              <Text className="font-sans-semibold text-slate-600">
                Pilih dari Galeri
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tahap 2: Loading AI */}
        <View style={{ display: isUploading ? 'flex' : 'none', alignItems: 'center', paddingVertical: 40 }}>
          {photoUri && (
            <Image 
              source={{ uri: photoUri }} 
              style={{ width: 120, height: 160, borderRadius: 16, marginBottom: 24, opacity: 0.5 }} 
              resizeMode="cover" 
            />
          )}
          <ActivityIndicator size="large" color="#22548C" />
          <Text className="font-sans-bold text-navy-900 mt-6 text-lg">Menganalisis Foto...</Text>
          <Text className="font-sans text-ink-soft mt-2 text-center px-4">
            AI sedang membaca nama dan harga menu dari gambar. Ini mungkin memakan waktu beberapa detik.
          </Text>
        </View>

        {/* Tahap 3: Review Draft */}
        <View style={{ display: (!isUploading && (!!photoUri || isManualMode)) ? 'flex' : 'none', width: '100%' }}>
          <View className="flex-row items-center justify-between mb-4 mt-2">
            <Text className="font-sans-bold text-navy-900 text-lg">
              Hasil Ekstraksi ({draftItems.length})
            </Text>
            <TouchableOpacity onPress={addManualItem} className="flex-row items-center gap-1 bg-navy-50 px-3 py-1.5 rounded-full">
              <Ionicons name="add" size={16} color="#22548C" />
              <Text className="font-sans-semibold text-navy-800 text-xs">Tambah</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-4 mb-8">
            {draftItems.map((item, index) => (
              <View key={item.id} className="bg-white/95 rounded-2xl p-4 border border-slate-200 shadow-sm relative">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-orange-100 px-2.5 py-1 rounded-md">
                    <Text className="text-[10px] font-sans-semibold text-orange-800 uppercase tracking-wider">
                      Item #{index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeDraftItem(item.id)} className="p-1">
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View className="gap-3">
                  <View>
                    <Text className="text-[11px] font-sans-semibold text-ink-faint mb-1 ml-1">Nama Menu</Text>
                    <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                      <TextInput
                        value={item.item_name}
                        onChangeText={(val) => updateDraftItem(item.id, "item_name", val)}
                        className="font-sans text-navy-900 text-sm p-0"
                        placeholder="Contoh: Nasi Goreng"
                      />
                    </View>
                  </View>
                  
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-[11px] font-sans-semibold text-ink-faint mb-1 ml-1">Harga (Rp)</Text>
                      <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                        <TextInput
                          value={item.price}
                          onChangeText={(val) => updateDraftItem(item.id, "price", val.replace(/[^0-9]/g, ''))}
                          keyboardType="numeric"
                          className="font-sans text-navy-900 text-sm p-0 font-bold"
                          placeholder="0"
                        />
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-sans-semibold text-ink-faint mb-1 ml-1">Kategori</Text>
                      <View className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 justify-center">
                        <TextInput
                          value={item.category}
                          onChangeText={(val) => updateDraftItem(item.id, "category", val)}
                          className="font-sans text-navy-900 text-sm p-0"
                          placeholder="culinary"
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: 12, paddingBottom: 20 }}>
            <TouchableOpacity 
              onPress={confirmCatalog}
              disabled={isSaving}
              activeOpacity={0.8}
              className={`rounded-2xl py-4 items-center justify-center ${isSaving ? 'bg-slate-400' : 'bg-navy-900'}`}
            >
              <Text className="font-sans-bold text-white text-[16px]">
                {isSaving ? "Menyimpan..." : "Simpan ke Katalog"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                if (params.mode === "manual") {
                  router.back();
                } else {
                  setPhotoUri(null);
                  setDraftItems([]);
                  setImageUrl(null);
                  setIsManualMode(false);
                }
              }}
              disabled={isSaving}
              activeOpacity={0.8}
              className="bg-transparent border-[1.5px] border-slate-400 rounded-2xl py-4 items-center justify-center"
            >
              <Text className="font-sans-bold text-slate-600 text-[16px]">
                {params.mode === "manual" ? "Batal" : "Batal & Ulangi Foto"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
