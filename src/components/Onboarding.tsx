import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DATA = [
  { id: "0" },
  {
    id: "1",
    title: "Ayo Dolan Bareng Blusukan!",
    desc: "Jelajahi tempat-tempat seru dan temukan hidden gems di sekitarmu.",
    image: require("../../assets/mblus/Adventure.png"),
  },
  {
    id: "2",
    title: "Yuk, Bikin Jualanmu Makin Dikenal!",
    desc: "Tawarkan jualanmu dan jangkau lebih banyak pelanggan dengan mudah.",
    image: require("../../assets/mblus/snack-run.png"),
  },
  {
    id: "3",
    title: "Siap Berpetualang?",
    desc: "Pilih mode yang paling cocok hari ini. Jangan khawatir, bisa ganti kapan aja kok. Ayo mulai!",
    image: require("../../assets/mblus/follow-me.png"),
  },
];

const ProgressDot = ({ index, currentIndex }: { index: number; currentIndex: number }) => {
  const isActive = currentIndex === index + 1;

  const rStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 10 : 24, { duration: 300 }),
      backgroundColor: withTiming(isActive ? "#1A4270" : "#C7CFDA", { duration: 300 }),
      borderRadius: 9999,
    };
  }, [isActive]);

  return <Animated.View className="h-2.5 mx-1" style={rStyle} />;
};

const ProgressBar = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(100, { duration: 2400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View className="w-48 h-1.5 bg-navy-50 rounded-full overflow-hidden mt-4">
      <Animated.View className="h-full bg-navy-700 rounded-full" style={animatedStyle} />
    </View>
  );
};

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentStep === 0) {
      const timer = setTimeout(() => {
        handleNext();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (currentIndex !== currentStep) {
      setCurrentStep(currentIndex);
    }
  };

  const handleNext = () => {
    if (currentStep < DATA.length - 1) {
      const nextIndex = currentStep + 1;
      scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
      setCurrentStep(nextIndex);
    } else {
      finishOnboarding();
    }
  };

  const handleSkip = () => {
    const nextIndex = 3;
    scrollRef.current?.scrollTo({ x: nextIndex * SCREEN_WIDTH, animated: true });
    setCurrentStep(nextIndex);
  };

  const finishOnboarding = () => {
    router.replace("/(auth)/login");
  };

  return (
    <LinearGradient
      colors={["#F4E9DA", "#F4E9DA", "#EEF3F9"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={{ flex: 1 }}
    >
      {currentStep > 0 && (
        <View className="absolute top-16 left-0 right-0 z-10 flex-row justify-center items-center">
          {[0, 1, 2].map((i) => (
            <ProgressDot key={i} index={i} currentIndex={currentStep} />
          ))}
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {DATA.map((item, index) => {
          if (index === 0) {
            return (
              <View
                key={item.id}
                style={{ width: SCREEN_WIDTH }}
                className="flex-1 justify-center items-center"
              >
                <Text
                  style={{ fontFamily: "GrandHotel_400Regular", fontSize: 72 }}
                  className="text-navy-900 mb-6"
                >
                  Blusukan
                </Text>
                <ProgressBar />
              </View>
            );
          }

          return (
            <View
              key={item.id}
              style={{ width: SCREEN_WIDTH }}
              className="flex-1 items-center justify-center px-6 pt-10"
            >
              <Image
                source={item.image}
                style={{ width: SCREEN_WIDTH * 0.5, height: SCREEN_WIDTH * 0.5 }}
                resizeMode="contain"
                accessibilityLabel={`Ilustrasi ${item.title}`}
                className="mb-8"
              />
              <Text
                style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                className="text-4xl text-navy-900 text-center mb-4"
              >
                {item.title}
              </Text>
              <Text className="text-base font-sans text-ink-soft text-center px-4 leading-relaxed">
                {item.desc}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {currentStep > 0 && (
        <View className="absolute bottom-10 left-0 right-0 px-6">
          {currentStep < 3 ? (
            <View className="flex-row justify-between items-center">
              <Pressable
                onPress={handleSkip}
                className="py-3 px-6"
                accessibilityRole="button"
                accessibilityLabel="Lewati panduan"
              >
                <Text className="text-navy-700 font-sans-semibold text-base">Skip</Text>
              </Pressable>
              <Pressable
                onPress={handleNext}
                className="bg-navy-700 py-3 px-8 rounded-btn active:bg-navy-800"
                accessibilityRole="button"
                accessibilityLabel="Lanjut ke tahap berikutnya"
              >
                <Text className="text-white font-sans-semibold text-base">Next</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={finishOnboarding}
              className="bg-navy-900 py-4 w-full rounded-btn items-center active:bg-navy-800 shadow-sm"
              accessibilityRole="button"
              accessibilityLabel="Mulai gunakan aplikasi"
            >
              <Text className="text-white font-sans-bold text-lg">Get Started</Text>
            </Pressable>
          )}
        </View>
      )}
    </LinearGradient>
  );
};
