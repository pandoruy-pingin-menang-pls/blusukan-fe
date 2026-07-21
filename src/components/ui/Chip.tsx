import React from "react";
import { Pressable, Text } from "react-native";

type ChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
};

export function Chip({ label, active, onPress, icon }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-pill border ${
        active ? "bg-navy-800 border-navy-800" : "bg-white border-line"
      }`}
    >
      {icon}
      <Text
        className={`text-[12.5px] font-sans-semibold ${
          active ? "text-white" : "text-ink-soft"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
