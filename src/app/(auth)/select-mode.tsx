import { View, Text } from "react-native";
import { router, Redirect } from "expo-router";
import { useAppStore } from "../../store/useAppStore";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "../../components/ui/Button";

export default function SelectModeScreen() {
  const { user, setMode, isLoggedIn } = useAppStore();

  if (!isLoggedIn) {
    return <Redirect href="/onboarding" />;
  }

  const handleSelect = (mode: "dolan" | "bakul") => {
    setMode(mode);
    if (mode === "dolan") {
      router.replace("/(dolan)/home");
    } else {
      router.replace("/(bakul)/home");
    }
  };

  return (
    <LinearGradient
      colors={["#F4E9DA", "#EEF3F9"]}
      style={{ flex: 1, padding: 24, justifyContent: "center" }}
    >
      <Text className="text-4xl text-navy-900 font-display text-center mb-2" style={{ fontFamily: 'PlayfairDisplay_700Bold' }}>Pilih Mode</Text>
      <Text className="text-base text-ink-soft text-center mb-8 font-sans">
        Halo, {user?.full_name || "Petualang"}! Mau pakai mode apa hari ini?
      </Text>

      <View className="space-y-4 gap-4">
        <Button 
          label="Dolan Mode (Jalan-jalan)" 
          onPress={() => handleSelect("dolan")}
        />
        
        {user?.has_merchant_profile ? (
          <Button 
            label="Bakul Mode (Berjualan)" 
            variant="secondary"
            onPress={() => handleSelect("bakul")}
          />
        ) : (
          <Button 
            label="Daftar Profil Bakul" 
            variant="secondary"
            onPress={() => {
               alert("Fitur pembuatan profil Bakul sedang dalam pengembangan.");
            }}
          />
        )}
      </View>
    </LinearGradient>
  );
}
