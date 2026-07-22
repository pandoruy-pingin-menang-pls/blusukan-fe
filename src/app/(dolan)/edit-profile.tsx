import { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  ImageBackground, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput
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
export default function EditProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    
    try {
      const token = await getToken("access_token");
      await axios.patch(
        `${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000'}/api/auth/me`,
        { full_name: fullName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Profil berhasil diperbarui!");
      setTimeout(() => {
        router.back();
      }, 1500);
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
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />
      {/* Back Button */}
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
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginTop: 60 }}>
          <Text
            style={{
              fontSize: 32,
              letterSpacing: 1,
            }}
            className="font-playfair font-semibold text-navy-900 mb-2"
          >
            Edit Profil
          </Text>
          <Text
            style={{ color: "#BA5E12" }}
            className="text-base font-sans mb-8"
          >
            Perbarui data diri Anda
          </Text>
        </View>
        <Alert message={error} type="error" />
        <Alert message={success} type="success" />

        <View style={{ display: isLoading ? 'flex' : 'none', flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
          <ActivityIndicator size="large" color="#22548C" />
        </View>

        <View style={{ display: (!isLoading && profile) ? 'flex' : 'none', width: '100%' }}>
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
                  <View className="flex-row items-center bg-gray-100 border-[1.5px] border-line rounded-btn px-3.5 py-3">
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#8A93A0"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: "#8A93A0", flex: 1, fontSize: 16 }}>
                      {profile.email}
                    </Text>
                  </View>
                  <Text className="text-[11px] font-sans text-ink-faint mt-1 ml-1">
                    *Email tidak dapat diubah
                  </Text>
                </View>

                <View>
                  <Text className="text-ink-dark font-sans-semibold mb-2 ml-1">
                    Peran (Role)
                  </Text>
                  <View className="flex-row items-center bg-gray-100 border-[1.5px] border-line rounded-btn px-3.5 py-3">
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color="#8A93A0"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{ color: "#8A93A0", flex: 1, fontSize: 16 }} className="capitalize">
                      {profile.role}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                <TouchableOpacity 
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: isSaving ? "#6b8ab0" : "#22548C",
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
