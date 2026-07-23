import { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
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
const IconInput = ({ icon, ...props }: any) => {
  const [focused, setFocused] = useState(false);
  const isEditable = props.editable !== false;
  
  return (
    <View
      className={`flex-row items-center border-[1.5px] rounded-btn px-3.5 py-3 ${
        focused ? "border-navy-600" : "border-line"
      } ${!isEditable ? "bg-slate-100" : "bg-white"}`}
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
        style={{ color: !isEditable ? "#64748b" : "#1E2733", flex: 1, fontSize: 16, ...(props.style || {}) }}
        {...props}
      />
    </View>
  );
};
export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
      setFullName(data.full_name);
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
  const handleSave = async () => {
    if (!fullName.trim()) {
      setError("Nama lengkap tidak boleh kosong");
      return;
    }
    setIsSaving(true);
    setError("");
    
    try {
      const token = await getToken("access_token");
      await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/me`,
        { full_name: fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      router.replace({ pathname: "/(dolan)/profile", params: { updated: "true" } });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
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
        style={[StyleSheet.absoluteFill, { zIndex: -2 }]}
      />
      
      {/* Top Navy Gradient Section */}
      <LinearGradient
        colors={['#1E3A8A', '#0F2A4A']}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 170,
          zIndex: 0,
          overflow: "hidden"
        }}
      >
        <Image
          source={require("../../../assets/edit-profile-wave.png")}
          style={{ width: '100%', height: '100%', opacity: 0.3 }}
          resizeMode="cover"
        />
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1, backgroundColor: 'transparent', zIndex: 1  }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: insets.top + 25 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginTop: 0 }}>
          <Text
            style={{
              fontSize: 32,
              letterSpacing: 1,
              fontFamily: 'PlayfairDisplay_700Bold'
            }}
            className="text-white mb-2"
          >
            Edit Profil
          </Text>
          <Text
            className="text-base font-sans text-white/80 mb-8"
          >
            Perbarui data diri Anda
          </Text>
        </View>
        <Alert message={error} type="error" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading && profile) ? 'flex' : 'none', width: '100%', marginTop: 40 }}>
          {profile && (
            <>
              <View style={{ gap: 16, marginBottom: 32 }}>
                <View>
                  <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
                    Nama Lengkap
                  </Text>
                  <IconInput
                    icon="person-outline"
                    placeholder="Nama Lengkap"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={!isSaving}
                  />
                </View>

                <View>
                  <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
                    Email
                  </Text>
                  <IconInput
                    icon="mail-outline"
                    value={profile.email}
                    editable={false}
                  />
                </View>

              </View>

              <View style={{ gap: 12 }}>
                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: isSaving ? "#6b8ab0" : "#0F2A4A",
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="font-sans-bold text-white text-base">
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => router.back()}
                  disabled={isSaving}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "transparent",
                    borderWidth: 1.5,
                    borderColor: "#94A3B8",
                    borderRadius: 14,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text className="font-sans-bold text-slate-600 text-base">
                    Batal
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

