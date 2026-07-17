import { View, Text } from "react-native";

type BadgeProps = {
  label: string;
  variant?: "high" | "info";
};

export function Badge({ label, variant = "info" }: BadgeProps) {
  return (
    <View
      className={`self-start flex-row items-center gap-1 px-2 py-0.5 rounded-[6px] ${
        variant === "high" ? "bg-warn" : "bg-navy-700"
      }`}
    >
      <Text className="text-white text-[10px] font-sans-bold uppercase tracking-wider">
        {label}
      </Text>
    </View>
  );
}
