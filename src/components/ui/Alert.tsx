import { View, Text } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

type AlertProps = {
  type?: "error" | "warning" | "success" | "info";
  message: string;
};

export function Alert({ type = "error", message }: AlertProps) {
  if (!message) return null;

  const bgColors = {
    error: "bg-warn-bg",
    warning: "bg-yellow-100",
    success: "bg-green-100",
    info: "bg-blue-100",
  };

  const textColors = {
    error: "text-warn",
    warning: "text-yellow-800",
    success: "text-green-800",
    info: "text-blue-800",
  };

  const icons = {
    error: "circle-exclamation",
    warning: "triangle-exclamation",
    success: "circle-check",
    info: "circle-info",
  };

  return (
    <View className={`${bgColors[type]} p-3 rounded-xl flex-row items-center gap-3 mb-4`}>
      <FontAwesome6 name={icons[type]} size={16} className={textColors[type]} />
      <Text className={`${textColors[type]} font-sans-medium flex-1 leading-snug`}>
        {message}
      </Text>
    </View>
  );
}
