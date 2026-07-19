import { View, Text } from "react-native";
import { useAppStore } from "../../store/useAppStore";
import { Button } from "../../components/ui/Button";
import { router } from "expo-router";

export default function BakulHome() {
  const { logout } = useAppStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-6">
      <Text className="text-xl font-display text-navy-900 mb-6">Bakul Home (placeholder)</Text>
      <Button label="Keluar Akun" onPress={handleLogout} variant="secondary" />
    </View>
  );
}

