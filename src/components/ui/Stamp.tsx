import { View, Image } from "react-native";
import { useMemo } from "react";

type StampProps = {
  filled?: boolean;
  size?: "small" | "big";
};

const STAMP_ASSETS = [
  require("../../../assets/stamp-batik.png"),
  require("../../../assets/stamp-liwet.png"),
  require("../../../assets/stamp-sate.png"),
  require("../../../assets/stamp-serabi.png"),
];

export function Stamp({ filled, size = "small" }: StampProps) {
  const dimension = size === "big" ? "w-[38px] h-[38px]" : "w-[34px] h-[34px]";
  const imgSize = size === "big" ? { width: 38, height: 38 } : { width: 34, height: 34 };

  const randomAsset = useMemo(() => {
    return STAMP_ASSETS[Math.floor(Math.random() * STAMP_ASSETS.length)];
  }, []);

  if (filled) {
    return (
      <View className={`${dimension} items-center justify-center`}>
        <Image source={randomAsset} style={imgSize} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View className={`${dimension} rounded-full items-center justify-center border-[1.5px] border-dashed border-stamp-empty`} />
  );
}
