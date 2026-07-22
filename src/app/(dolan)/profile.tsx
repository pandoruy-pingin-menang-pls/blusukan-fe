import { useState, useCallback } from "react";
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
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getToken } from "../../utils/secureStore";
import { Alert } from "../../components/ui/Alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
                style={{ paddingTop: insets.top + 25 }}
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
                    <Text className="font-sans text-white/90 text-sm">
                      Edit profile detail {'>'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

