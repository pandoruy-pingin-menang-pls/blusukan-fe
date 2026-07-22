import { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getToken } from "../../utils/secureStore";
import { Alert } from "../../components/ui/Alert";
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  has_merchant_profile: boolean;
  created_at: string;
  updated_at: string;
};
export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = await getToken("access_token");
      if (!token) {
        throw new Error("No token found");
      }
      
      const { data } = await axios.get(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal memuat profil");
    } finally {
      setIsLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[32px] font-playfair font-semibold tracking-wide text-navy-900 mb-2 mt-4">
          Profil Saya
        </Text>
        <Text className="text-[15px] font-sans text-ink-soft mb-8">
          Kelola informasi akun Blusukan Anda
        </Text>
        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading && profile) ? 'flex' : 'none', width: '100%' }}>
          {profile && (
            <>
              <View className="bg-white/90 rounded-3xl p-6 border border-slate-200 shadow-sm mb-6">
                <View className="items-center mb-6">
                  <View className="w-20 h-20 bg-navy-100 rounded-full items-center justify-center mb-3">
                    <Ionicons name="person" size={40} color="#22548C" />
                  </View>
                  <Text className="text-xl font-sans-bold text-navy-900 text-center">
                    {profile.full_name}
                  </Text>
                  <Text className="text-sm font-sans text-ink-soft text-center mt-1">
                    {profile.email}
                  </Text>
                </View>
                <View className="space-y-4 gap-4">
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Peran (Role)</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="shield-checkmark" size={16} color="#BA5E12" />
                      <Text className="text-sm font-sans text-navy-800 capitalize">
                        {profile.role}
                      </Text>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Status Toko</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={profile.has_merchant_profile ? "storefront" : "storefront-outline"} size={16} color="#22548C" />
                      <Text className="text-sm font-sans text-navy-800">
                        {profile.has_merchant_profile ? "Sudah memiliki toko" : "Belum memiliki toko"}
                      </Text>
                    </View>
                  </View>
                  
                  <View>
                    <Text className="text-xs font-sans-semibold text-ink-faint mb-1">Tanggal Bergabung</Text>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="calendar-outline" size={16} color="#475569" />
                      <Text className="text-sm font-sans text-navy-800">
                        {formatDate(profile.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity 
                className="w-full bg-navy-900 rounded-2xl py-4 items-center justify-center"
                onPress={() => router.push({ pathname: "/(dolan)/edit-profile", params: { full_name: profile.full_name } })}
                activeOpacity={0.8}
              >
                <Text className="font-sans-bold text-white text-[16px]">
                  Edit Profil
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

