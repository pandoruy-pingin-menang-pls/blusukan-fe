import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

  const register = useAppStore((state) => state.register);

  const handleRegister = async () => {
    setErrors({});
    setGlobalError("");
    
    // FE Validation
    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = "Nama lengkap wajib diisi";
    if (!email) newErrors.email = "Email wajib diisi";
    if (!password) newErrors.password = "Password wajib diisi";
    else if (password.length < 8) newErrors.password = "Password minimal 8 karakter";
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      await register(email, fullName, password);
      router.replace("/(auth)/select-mode");
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

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
      className="bg-surface"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-3xl font-display text-navy-900 mb-2">Daftar Akun</Text>
      <Text className="text-base font-sans text-ink-soft mb-8">
        Mulai petualangan dan jualanmu di Blusukan
      </Text>

      {globalError ? (
        <View className="bg-warn-bg p-3 rounded-lg mb-4">
          <Text className="text-warn font-sans-medium">{globalError}</Text>
        </View>
      ) : null}

      <View className="space-y-4 mb-8 gap-4">
        <View>
          <Input 
            placeholder="Nama Lengkap" 
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />
          {errors.fullName || errors.full_name ? <Text className="text-danger font-sans text-xs mt-1">{errors.fullName || errors.full_name}</Text> : null}
        </View>

        <View>
          <Input 
            placeholder="Email" 
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
          {errors.email ? <Text className="text-danger font-sans text-xs mt-1">{errors.email}</Text> : null}
        </View>

        <View>
          <Input 
            placeholder="Password (minimal 8 karakter)" 
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
          {errors.password ? <Text className="text-danger font-sans text-xs mt-1">{errors.password}</Text> : null}
        </View>

        <View>
          <Input 
            placeholder="Konfirmasi Password" 
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />
          {errors.confirmPassword ? <Text className="text-danger font-sans text-xs mt-1">{errors.confirmPassword}</Text> : null}
        </View>
      </View>

      <Button 
        label={isLoading ? "Memproses..." : "Daftar"} 
        onPress={handleRegister} 
        disabled={isLoading} 
      />

      <View className="flex-row justify-center mt-6">
        <Text className="text-ink-soft font-sans">Sudah punya akun? </Text>
        <Link href="/(auth)/login" asChild>
          <Text className="text-navy-600 font-sans-semibold">Masuk</Text>
        </Link>
      </View>
    </ScrollView>
  );
}
