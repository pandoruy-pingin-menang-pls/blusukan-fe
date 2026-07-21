import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";

type ConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  // Dipakai untuk pesan default "Yakin daftar sebagai {roleName}?" (dipakai di role-selection)
  roleName?: string;
  // Kalau diisi, override pesan default di atas (bisa string atau JSX, misal untuk bold nama toko)
  message?: React.ReactNode;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  // Warna tombol konfirmasi, default navy (#0F172A) kalau tidak diisi
  confirmColor?: string;
};

export function ConfirmationModal({
  visible,
  roleName,
  onClose,
  onConfirm,
  message,
  title = "Konfirmasi",
  confirmText = "Ya, Lanjutkan!",
  cancelText = "Batal",
  confirmColor = "#0F172A",
}: ConfirmationModalProps) {
  const [showModal, setShowModal] = useState(visible);
  const animation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      animation.value = withSpring(1, { damping: 20, stiffness: 250 });
    } else {
      animation.value = withTiming(0, { duration: 200 }, (isFinished) => {
        if (isFinished) {
          runOnJS(setShowModal)(false);
        }
      });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(animation.value, [0, 1], [0.8, 1]);
    return {
      opacity: animation.value,
      transform: [{ scale }],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: animation.value * 0.5,
    };
  });

  if (!showModal) return null;

  return (
    <Modal transparent visible={showModal} animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-center items-center">
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "black" }, backdropStyle]}
        />

        <Animated.View
          style={[
            {
              backgroundColor: "#FFFFFF",
              width: "85%",
              borderRadius: 24,
              padding: 24,
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            },
            animatedStyle,
          ]}
        >
          <Text className="font-playfair text-[28px] font-medium tracking-wider text-navy-900 mb-2 mt-2 text-center">
            {title}
          </Text>

          <Text className="font-sans text-[15px] text-[#475569] text-center mb-6">
            {message ?? `Yakin daftar sebagai ${roleName}?`}
          </Text>

          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 rounded-xl py-3 border-[1.5px] border-[#94A3B8] items-center justify-center bg-transparent"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text className="font-sans-bold text-[#334155]">{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: confirmColor,
              }}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text className="font-sans-bold text-white">{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}