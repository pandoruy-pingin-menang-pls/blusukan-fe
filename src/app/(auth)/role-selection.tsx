import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { Alert } from "../../components/ui/Alert";
import { ConfirmationModal } from "../../components/ui/ConfirmationModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

// AnimatedCard Component for handling scale animation
const AnimatedCard = ({ onPress, children, disabled, className, style }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} className={className}>
      <Pressable
        onPressIn={() => {
          if (!disabled) scale.value = withSpring(1.03);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        onPress={onPress}
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default function RoleSelectionScreen() {
  const params = useLocalSearchParams<{ email?: string; fullName?: string; password?: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [isWisatawanModalVisible, setIsWisatawanModalVisible] = useState(false);
  const { register, isLoggedIn } = useAppStore(state => state);

  const confirmWisatawan = async () => {
    setIsWisatawanModalVisible(false);
    
    // Give animation time to finish before heavy operations
    setTimeout(async () => {
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
    }, 250);
  };

  const handleWisatawan = () => {
    setIsWisatawanModalVisible(true);
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
    <ImageBackground
      source={require("../../../assets/batik-solo-overlay.png")}
      style={{ flex: 1 }}
      imageStyle={{ opacity: 0.4 }}
      resizeMode="repeat"
    >
      <LinearGradient
        colors={["#D6EAF8", "#FDEBD0"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      />
      <View className="flex-1 justify-center px-6">
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: 60,
            left: 24,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
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

        <View className="items-center mb-10 mt-25">
          <Text className="text-[32px] font-playfair text-navy-900 mb-2 text-center">
            Pilih Peranmu
          </Text>
          <Text className="text-base font-sans text-ink-soft text-center">
            Pilih gaya petualangan Blusukan-mu!
          </Text>
        </View>

        <Alert message={globalError} type="error" />

        <View className="flex-col gap-6">
          <AnimatedCard
            onPress={handleWisatawan}
            disabled={isLoading}
            style={{
              backgroundColor: '#EBF4FA',
              borderRadius: 24,
              borderWidth: 2,
              borderColor: '#22548C',
              overflow: 'hidden',
              shadowColor: "#22548C",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-col items-center p-6">
              <Image
                source={require("../../../assets/mblus/adventure.png")}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
              />
              <Text className="text-2xl font-playfair text-navy-900 mb-2 text-center">
                Wisatawan
              </Text>
              <Text className="text-sm font-sans text-ink-dark text-center leading-relaxed">
                ( Dolan ) Jelajahi kuliner dan kerajinan!
              </Text>
            </View>
          </AnimatedCard>

          <AnimatedCard
            onPress={handlePedagang}
            disabled={isLoading}
            style={{
              backgroundColor: '#FFF5EB',
              borderRadius: 24,
              borderWidth: 2,
              borderColor: '#E8751A',
              overflow: 'hidden',
              shadowColor: "#E8751A",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-col items-center p-6">
              <Image
                source={require("../../../assets/mblus/snack-run.png")}
                style={{ width: 120, height: 120, marginBottom: 16 }}
                resizeMode="contain"
              />
              <Text className="text-2xl font-playfair text-[#BA5E12] mb-2 text-center">
                Pedagang
              </Text>
              <Text className="text-sm font-sans text-ink-dark text-center leading-relaxed">
                ( Bakul ) Jual daganganmu disini!
              </Text>
            </View>
          </AnimatedCard>
        </View>
      </View>

      <ConfirmationModal 
        visible={isWisatawanModalVisible}
        roleName="Wisatawan"
        onClose={() => setIsWisatawanModalVisible(false)}
        onConfirm={confirmWisatawan}
        message={
          <Text>
            Yakin daftar sebagai <Text style={{ fontWeight: "700" }}>Wisatawan</Text>?
          </Text>
        }
      />
    </ImageBackground>
  );
}
