import { useState } from "react";
import { View, Text } from "react-native";
import { Link, router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Alert } from "../../components/ui/Alert";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const login = useAppStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi");
      return;
    }
    
    setErrorMsg("");
    setIsLoading(true);
    
    try {
      await login(email, password);
      const currentUser = useAppStore.getState().user;
      if (currentUser?.role === "pedagang") {
        router.replace("/(merchant)/home");
      } else {
        router.replace("/(dolan)/home");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        if (Array.isArray(details)) {
          setErrorMsg(details.map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join('\n'));
        } else {
          setErrorMsg("Validasi gagal");
        }
      } else if (error.response?.status === 401) {
        setErrorMsg("Email atau password salah");
      } else {
        setErrorMsg("Terjadi kesalahan, periksa koneksi internet Anda");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface px-6 justify-center">
      <Text className="text-3xl font-display text-navy-900 mb-2">Selamat Datang</Text>
      <Text className="text-base font-sans text-ink-soft mb-8">
        Silakan masuk ke akun Blusukan Anda
      </Text>

      <Alert message={errorMsg} type="error" />

      <View className="space-y-4 mb-8 gap-4">
        <Input 
          placeholder="Email" 
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
        <Input 
          placeholder="Password" 
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </View>

      <Button 
        label={isLoading ? "Memproses..." : "Masuk"} 
        onPress={handleLogin} 
        disabled={isLoading} 
      />

      <View className="flex-row justify-center mt-6">
        <Text className="text-ink-soft font-sans">Belum punya akun? </Text>
        <Link href="/(auth)/register" asChild>
          <Text className="text-navy-600 font-sans-semibold">Daftar sekarang</Text>
        </Link>
      </View>
    </View>
  );
}
