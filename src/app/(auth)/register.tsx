import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Link, router } from "expo-router";
import { Alert } from "../../components/ui/Alert";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MIN_SHEET_Y = SCREEN_HEIGHT * 0.20;
const DEFAULT_SHEET_Y = SCREEN_HEIGHT * 0.25;
const MAX_SHEET_Y = SCREEN_HEIGHT * 0.30;

const IconInput = ({
  icon,
  isPassword,
  ...props
}: any) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      className={`flex-row items-center bg-white border-[1.5px] rounded-btn px-3.5 py-3 mb-4 ${
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
        secureTextEntry={isPassword && !showPassword}
        style={{ color: '#1E2733', flex: 1, fontSize: 16 }}
        {...props}
      />
      {isPassword && (
        <Pressable
          onPress={() => setShowPassword((v) => !v)}
          hitSlop={8}
        >
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="#8A93A0"
            style={{ marginLeft: 4 }}
          />
        </Pressable>
      )}
    </View>
  );
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");

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

    // Go to next step
    router.push({
      pathname: "/(auth)/role-selection",
      params: { email, fullName, password }
    });
  };

  const translateY = useSharedValue(DEFAULT_SHEET_Y);
  const context = useSharedValue({ y: 0 });

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = event.translationY + context.value.y;
      translateY.value = Math.min(Math.max(newY, MIN_SHEET_Y), MAX_SHEET_Y);
    })
    .onEnd(() => {
      if (translateY.value < DEFAULT_SHEET_Y - 20) {
        translateY.value = withSpring(MIN_SHEET_Y, {
          damping: 20,
          stiffness: 100,
        });
      } else if (translateY.value > DEFAULT_SHEET_Y + 20) {
        translateY.value = withSpring(MAX_SHEET_Y, {
          damping: 20,
          stiffness: 100,
        });
      } else {
        translateY.value = withSpring(DEFAULT_SHEET_Y, {
          damping: 20,
          stiffness: 100,
        });
      }
    });

  const bottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [MIN_SHEET_Y, MAX_SHEET_Y],
      [1.02, 1.15],
      Extrapolation.CLAMP
    );
    const bgTranslateY = interpolate(
      translateY.value,
      [MIN_SHEET_Y, MAX_SHEET_Y],
      [-100, -30],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY: bgTranslateY }],
    };
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={require("../../../assets/batik-solo-overlay.png")}
          style={{ flex: 1 }}
          imageStyle={{ opacity: 0.45 }}
          resizeMode="repeat"
        >
          <LinearGradient
            colors={["#FDEBD0", "#D6EAF8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
          />

          <Animated.Image
            source={require("../../../assets/register-overlay.png")}
            style={[
              {
                position: "absolute",
                top: "10%",
                left: 0,
                right: 0,
                width: "100%",
                height: SCREEN_HEIGHT * 0.35,
                resizeMode: "cover",
              },
              bgAnimatedStyle,
            ]}
          />

          <Animated.View
            className="absolute left-0 right-0 bottom-0 bg-white"
            style={[
              {
                height: SCREEN_HEIGHT,
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
              },
              bottomSheetStyle,
            ]}
          >
            <Image
              source={require("../../../assets/mblus/hanging-hello.png")}
              style={{
                width: 100,
                height: 100,
                position: "absolute",
                top: -90,
                left: 40,
                zIndex: 10,
              }}
              resizeMode="contain"
            />

            <GestureDetector gesture={dragGesture}>
              <View style={{ paddingBottom: 8, paddingTop: 12 }}>
                <View className="w-12 h-1.5 bg-gray-300 rounded-full self-center" />
              </View>
            </GestureDetector>

            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-[32px] font-playfair text-[#BA5E12] mb-2 mt-4">
                Daftar Akun
              </Text>
              <Text className="text-base font-sans text-[#BA5E12] mb-8">
                Silakan buat akun Blusukan Anda
              </Text>

              <Alert message={globalError} type="error" />

              <View className="mb-2">
                <IconInput
                  icon="person-outline"
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isLoading}
                />
                {errors.fullName || errors.full_name ? <Text className="text-danger font-sans text-xs mb-4 -mt-2">{errors.fullName || errors.full_name}</Text> : null}

                <IconInput
                  icon="mail-outline"
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                />
                {errors.email ? <Text className="text-danger font-sans text-xs mb-4 -mt-2">{errors.email}</Text> : null}

                <IconInput
                  icon="lock-closed-outline"
                  placeholder="Password (minimal 8 karakter)"
                  isPassword
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                />
                {errors.password ? <Text className="text-danger font-sans text-xs mb-4 -mt-2">{errors.password}</Text> : null}

                <IconInput
                  icon="lock-closed-outline"
                  placeholder="Konfirmasi Password"
                  isPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!isLoading}
                />
                {errors.confirmPassword ? <Text className="text-danger font-sans text-xs mb-4 -mt-2">{errors.confirmPassword}</Text> : null}
              </View>

              <TouchableOpacity
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
                className={`rounded-[14px] py-[14px] mt-4 items-center justify-center ${
                  isLoading ? "bg-navy-600" : "bg-navy-900"
                }`}
              >
                <Text className="font-sans-bold text-white text-base">
                  {isLoading ? "Memproses..." : "Lanjut"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-ink-soft font-sans">
                  Sudah punya akun?{" "}
                </Text>
                <Link href="/(auth)/login" asChild>
                  <Text className="text-navy-900 font-sans-semibold">
                    Masuk
                  </Text>
                </Link>
              </View>
            </ScrollView>
          </Animated.View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}
