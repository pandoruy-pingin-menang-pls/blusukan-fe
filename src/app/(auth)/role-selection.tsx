import { useState } from "react";
import { View, Text, Alert as RNAlert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Button } from "../../components/ui/Button";
import { useAppStore } from "../../store/useAppStore";
import { Alert } from "../../components/ui/Alert";

export default function RoleSelectionScreen() {
  const params = useLocalSearchParams<{ email?: string; fullName?: string; password?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const { register, isLoggedIn } = useAppStore(state => state);

  const handleWisatawan = () => {
    RNAlert.alert(
      "Konfirmasi",
      "Yakin daftar sebagai Wisatawan?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya", 
          onPress: async () => {
            if (isLoggedIn) {
              router.replace("/(dolan)/home");
              return;
            }
            if (!params.email || !params.fullName || !params.password) return;
            setIsLoading(true);
            setGlobalError("");
            try {
              await register(params.email, params.fullName, params.password);
              router.replace("/(dolan)/home");
            } catch (error: any) {
              setGlobalError(error.response?.data?.detail?.[0]?.msg || "Gagal mendaftar. Silakan coba lagi.");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handlePedagang = async () => {
    if (isLoggedIn) {
      router.replace("/(auth)/register-merchant");
      return;
    }
    if (!params.email || !params.fullName || !params.password) return;
    setIsLoading(true);
    setGlobalError("");
    try {
      await register(params.email, params.fullName, params.password);
      router.replace("/(auth)/register-merchant");
    } catch (error: any) {
      setGlobalError(error.response?.data?.detail?.[0]?.msg || "Gagal membuat akun dasar. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface justify-center px-6">
      <Text className="text-3xl font-display text-navy-900 mb-2 text-center">Pilih Peranmu</Text>
      <Text className="text-base font-sans text-ink-soft mb-8 text-center">
        Sebagai apa kamu ingin bergabung di Blusukan?
      </Text>

      <Alert message={globalError} type="error" />

      <View className="space-y-4 gap-4">
        <Button 
          label={isLoading ? "Memproses..." : "Daftar sebagai Wisatawan"} 
          onPress={handleWisatawan}
          disabled={isLoading}
        />
        
        <Button 
          label={isLoading ? "Memproses..." : "Daftar sebagai Pedagang"} 
          variant="secondary"
          onPress={handlePedagang}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
