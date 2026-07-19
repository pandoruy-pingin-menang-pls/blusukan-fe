import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
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

  const { restoreSession, isLoadingAuth } = useAppStore();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoadingAuth) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoadingAuth]);

  if (!fontsLoaded || isLoadingAuth) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
