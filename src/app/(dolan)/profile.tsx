import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, FontAwesome6 } from "@expo/vector-icons";
import axios from "axios";
import { getToken } from "../../utils/secureStore";
import { Alert } from "../../components/ui/Alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppStore } from "../../store/useAppStore";

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
  const insets = useSafeAreaInsets();
  const { logout } = useAppStore();
  const params = useLocalSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [stampsCount, setStampsCount] = useState(0);
  const [promosCount, setPromosCount] = useState(0);

  useEffect(() => {
    if (params.updated === "true") {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        router.setParams({ updated: undefined });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [params.updated]);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError("");
    try {
      const token = await getToken("access_token");
      if (!token) {
        throw new Error("No token found");
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, stampsRes, promosRes] = await Promise.all([
        axios.get(`${baseUrl}/api/auth/me`, { headers }),
        axios.get(`${baseUrl}/api/users/me/stamps`, { headers }),
        axios.get(`${baseUrl}/api/promos/available`, { headers })
      ]);

      setProfile(profileRes.data);
      setStampsCount(stampsRes.data?.total_stamps || 0);
      setPromosCount(Array.isArray(promosRes.data) ? promosRes.data.length : 0);
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
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <Alert message={error} type="error" />
        </View>

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading && profile) ? 'flex' : 'none', width: '100%' }}>
          {profile && (
            <>
              {/* Top Orange Section */}
              <LinearGradient
                colors={['#FB923C', '#E8751A']}
                className="w-full relative overflow-hidden rounded-b-[16px] border-b-[2px] border-[#BA5E12]"
                style={{ paddingTop: insets.top + 25, height: 170 }}
              >
                {/* Background scenery, dinaikkan dan diperbesar area tampilnya */}
                <View className="absolute bottom-1 left-0 right-0 h-44 overflow-hidden">
                  <Image
                    source={require("../../../assets/profile-scenery.png")}
                    style={{ width: '100%', height: '100%', opacity: 0.55 }}
                    resizeMode="cover"
                  />
                  {/* Fade dari transparan (atas) ke warna gradient bawah (E8751A) supaya nyambung */}
                  <LinearGradient
                    colors={['rgba(232, 117, 26, 0)', 'rgba(232, 117, 26, 0.85)', '#E8751A']}
                    locations={[0, 0.6, 1]}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>

                {/* Content placed above the scenery so it doesn't overlap */}
                <View className="px-6 pb-10 z-10">
                  <Text
                    style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                    className="text-white text-[32px] mb-1"
                  >
                    {profile.full_name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: "/(dolan)/edit-profile", params: { full_name: profile.full_name } })}
                    activeOpacity={0.8}
                  >
                    <Text className="text-base font-sans text-white/80 mb-8">
                      Edit profile detail {'>'}
                    </Text>
                    
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              
              {/* Stamps Summary Card */}
              <View className="px-6 mt-6 mb-6 z-20">
                <View className="shadow-sm">
                  <View className="bg-blue-50 rounded-t-2xl p-5 border border-navy-900">
                    <View className="flex-row items-center mb-3">
                      <FontAwesome6 name="stamp" size={20} color="#14335A" />
                      <Text className="font-sans-bold text-navy-900 text-lg ml-3">
                        Stempel terkumpul: <Text className="text-orange-600">{stampsCount}</Text>
                      </Text>
                    </View>
                    <Text className="font-sans text-slate-600">
                      Ada <Text className="font-sans-bold text-navy-900">{promosCount}</Text> promo yang menunggumu!
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={() => router.push("/(dolan)/stamps")}
                    className="bg-white flex-row justify-between items-center px-5 py-3.5 border border-t-0 border-slate-300 rounded-b-2xl"
                    activeOpacity={0.8}
                  >
                    <Text className="font-sans-semibold text-black">
                      Lihat promo lebih detail
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logout Button */}
              <View className="px-6 mb-10">
                <TouchableOpacity
                  onPress={async () => {
                    await logout();
                    router.replace("/(auth)/login");
                  }}
                  className="bg-slate-800 rounded-xl py-4 flex-row justify-center items-center gap-2 shadow-sm"
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={20} color="white" />
                  <Text className="font-sans-bold text-white text-base">Keluar dari Akun</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {showToast && (
        <View 
          className="absolute bottom-6 right-6 bg-green-600 rounded-xl px-4 py-3 flex-row items-center shadow-lg"
          style={{ zIndex: 100, elevation: 5 }}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
          <Text className="text-white font-sans-medium">Profil berhasil diperbarui!</Text>
        </View>
      )}
    </ImageBackground>
  );
}
