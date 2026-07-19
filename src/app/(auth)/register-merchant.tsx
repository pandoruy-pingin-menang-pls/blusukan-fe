import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";

export default function RegisterMerchantScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("KULINER_PANAS");
  const [address, setAddress] = useState("");
  
  const CATEGORIES = [
    { label: "Kuliner Panas", value: "KULINER_PANAS" },
    { label: "Kuliner Dingin", value: "KULINER_DINGIN" },
    { label: "Kerajinan", value: "KERAJINAN" },
    { label: "Lainnya", value: "LAINNYA" },
  ];
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  
  const registerMerchant = useAppStore(state => state.registerMerchant);
  const user = useAppStore(state => state.user);

  const handleRegister = async () => {
    setErrors({});
    setGlobalError("");
    
    // Validasi frontend
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Nama toko wajib diisi";
    if (!description) newErrors.description = "Deskripsi toko wajib diisi";
    if (!category) newErrors.category = "Kategori wajib diisi";
    if (!address) newErrors.address = "Alamat wajib diisi";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await registerMerchant({
        name,
        description,
        category,
        address,
        latitude: -7.250445, // Dummy default
        longitude: 112.768845
      });
      router.replace("/(merchant)/home");
    } catch (error: any) {
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

  const handleBack = () => {
    router.replace("/(auth)/role-selection");
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
      className="bg-surface"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-display text-navy-900 mb-2 mt-12">Profil Toko</Text>
      <Text className="text-base font-sans text-ink-soft mb-8">
        Halo {user?.full_name}, silakan lengkapi data toko Anda.
      </Text>

      <Alert message={globalError} type="error" />

      <View className="space-y-4 mb-8 gap-4">
        <View>
          <Input 
            placeholder="Nama Toko" 
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
          {errors.name ? <Text className="text-danger font-sans text-xs mt-1">{errors.name}</Text> : null}
        </View>

        <View>
          <Input 
            placeholder="Deskripsi" 
            value={description}
            onChangeText={setDescription}
            editable={!isLoading}
          />
          {errors.description ? <Text className="text-danger font-sans text-xs mt-1">{errors.description}</Text> : null}
        </View>

        <View>
          <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">Kategori Toko</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row overflow-visible">
            {CATEGORIES.map((cat, index) => {
              const isSelected = category === cat.value;
              return (
                <Pressable
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  className={`px-4 py-2 rounded-full border mr-3 ${
                    isSelected ? "bg-navy-800 border-navy-800" : "bg-white border-line"
                  }`}
                >
                  <Text className={`font-sans-medium ${isSelected ? "text-white" : "text-ink-soft"}`}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {errors.category ? <Text className="text-danger font-sans text-xs mt-1">{errors.category}</Text> : null}
        </View>
        
        <View>
          <Input 
            placeholder="Alamat Lengkap" 
            value={address}
            onChangeText={setAddress}
            editable={!isLoading}
          />
          {errors.address ? <Text className="text-danger font-sans text-xs mt-1">{errors.address}</Text> : null}
        </View>
      </View>

      <Button 
        label={isLoading ? "Menyimpan..." : "Buat Toko"} 
        onPress={handleRegister} 
        disabled={isLoading} 
      />
      
      <View className="mt-4">
        <Button 
          label="Pilih Ulang Role (Wisatawan)" 
          variant="secondary"
          onPress={handleBack} 
          disabled={isLoading} 
        />
      </View>
    </ScrollView>
  );
}
