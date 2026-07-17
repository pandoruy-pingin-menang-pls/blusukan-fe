import { View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";

type StampProps = {
  filled?: boolean;
  size?: "small" | "big";
};

export function Stamp({ filled, size = "small" }: StampProps) {
  const dimension = size === "big" ? "w-[38px] h-[38px]" : "w-[34px] h-[34px]";

  return (
    <View
      className={`${dimension} rounded-full items-center justify-center ${
        filled
          ? "bg-sogan-600 border-[1.5px] border-sogan-600"
          : "border-[1.5px] border-dashed border-stamp-empty"
      }`}
    >
      {filled && <FontAwesome6 name="check" size={13} color="#fff" />}
    </View>
  );
}
