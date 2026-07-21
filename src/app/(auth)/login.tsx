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
import { useAppStore } from "../../store/useAppStore";
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
const MAX_SHEET_Y = SCREEN_HEIGHT * 0.35;

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

// ─── Main Screen ────────────────────────────────────────────────────────────
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
          setErrorMsg(
            details
              .map((d: any) => `${d.loc[d.loc.length - 1]}: ${d.msg}`)
              .join("\n")
          );
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

  const foodAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [MIN_SHEET_Y, MAX_SHEET_Y],
      [1.02, 1.15],
      Extrapolation.CLAMP
    );
    const bgTranslateY = interpolate(
      translateY.value,
      [MIN_SHEET_Y, MAX_SHEET_Y],
      [-140, -30],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY: bgTranslateY }],
    };
  });

  const tableAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [MIN_SHEET_Y, MAX_SHEET_Y],
      [1.40, 1.55],
      Extrapolation.CLAMP
    );
    const bgTranslateY = interpolate(
      translateY.value,
      [MIN_SHEET_Y, MAX_SHEET_Y],
      [-130, -30],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY: bgTranslateY }, { translateX: 50 }],
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
            source={require("../../../assets/login-overlay-table.png")}
            style={[
              {
                position: "absolute",
                top: "20%",
                left: 0,
                right: 0,
                width: "100%",
                height: SCREEN_HEIGHT * 0.25,
                resizeMode: "cover",
              },
              tableAnimatedStyle,
            ]}
          />
          <Animated.Image
            source={require("../../../assets/login-overlay-food.png")}
            style={[
              {
                position: "absolute",
                top: "15%",
                left: 0,
                right: 0,
                width: "100%",
                height: SCREEN_HEIGHT * 0.25,
                resizeMode: "cover",
              },
              foodAnimatedStyle,
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
              source={require("../../../assets/mblus/hanging-happy.png")}
              style={{
                width: 100,
                height: 100,
                position: "absolute",
                top: -88,
                right: 40,
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
              <Text className="text-[32px] font-playfair text-navy-900 mb-2 mt-4">
                Selamat Datang
              </Text>
              <Text className="text-base font-sans text-ink-soft mb-8">
                Silakan masuk ke akun Blusukan Anda
              </Text>

              <Alert message={errorMsg} type="error" />

              <IconInput
                icon="mail-outline"
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
              />

              <IconInput
                icon="lock-closed-outline"
                placeholder="Password"
                isPassword
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
                style={{
                  backgroundColor: isLoading ? "#f0a86a" : "#E8751A",
                  borderRadius: 14,
                  paddingVertical: 14,
                  marginTop: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text className="font-sans-bold text-white text-base">
                  {isLoading ? "Memproses..." : "Masuk"}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-ink-soft font-sans">
                  Belum punya akun?{" "}
                </Text>
                <Link href="/(auth)/register" asChild>
                  <Text className="text-primary-orange font-sans-semibold">
                    Daftar sekarang
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

