import { Stack, useSegments, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import "../services/apiClient";
import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";
import { GrandHotel_400Regular } from "@expo-google-fonts/grand-hotel";
import "../../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    GrandHotel_400Regular,
    PlayfairDisplay_700Bold,
  });

  const { restoreSession, isLoadingAuth, user, isLoggedIn } = useAppStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoadingAuth) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoadingAuth]);

  // RBAC Redirect Guard
  useEffect(() => {
    if (isLoadingAuth) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminGroup = segments[0] === "(admin)";
    const inBakulGroup = segments[0] === "(bakul)";
    const inDolanGroup = segments[0] === "(dolan)";

    if (!isLoggedIn) {
      // If not logged in and not in auth group or index, redirect to login
      if (!inAuthGroup && segments[0] !== "onboarding") {
        router.replace("/(auth)/login");
      }
    } else if (user) {
      if (user.role === "pedagang" && !user.has_merchant_profile) {
        // Always redirect pedagang to onboarding if they haven't set up their store
        if (segments.join("/") !== "(auth)/register-merchant") {
          router.replace("/(auth)/register-merchant");
        }
        return;
      }

      if (user.role === "admin" && !inAdminGroup) {
        router.replace("/(admin)/dashboard");
      } else if (user.role === "pedagang" && inAdminGroup) {
        router.replace("/(bakul)/dashboard");
      } else if (user.role === "wisatawan" && inAdminGroup) {
        router.replace("/(dolan)/home");
      }
      
      // Also if they are in auth group but already logged in
      if (inAuthGroup) {
        // Allow access to role-selection and register-merchant for onboarding flows
        if (segments[1] === "register-merchant" || segments[1] === "role-selection") {
          return;
        }
        
        if (user.role === "admin") router.replace("/(admin)/dashboard");
        else if (user.role === "pedagang") router.replace("/(bakul)/dashboard");
        else router.replace("/(dolan)/home");
      }
    }
  }, [isLoggedIn, user, segments, isLoadingAuth]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
