import React, { useState, useRef } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { ONBOARDING_STEPS } from "@/constants/onboarding";
import { Button } from "@/components/ui/button";
import { router } from "expo-router";

export default function OnboardingPage() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const swiperRef = useRef<Swiper | null>(null);

  const handleIndexChanged = (index: number) => {
    setCurrentIndex(index);
  };

  const handleButtonPress = () => {
    if (currentIndex < ONBOARDING_STEPS.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      router.push("/(auth)/sign-up");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <Swiper
          ref={swiperRef}
          loop={false}
          onIndexChanged={handleIndexChanged}
          showsPagination={true}
          activeDotColor="#000"
        >
          {ONBOARDING_STEPS.map((step) => (
            <View
              key={step.id}
              className="flex-1 justify-center items-center p-4"
            >
              <Text className="text-6xl p-2">{step.icon}</Text>
              <Text className="mt-4 text-2xl font-bold">{step.title}</Text>
              <Text className="mt-2 text-base text-center">
                {step.description}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>
      <View className="p-4">
        <Button onPress={handleButtonPress}>
          <Text className="text-white">
            {currentIndex === ONBOARDING_STEPS.length - 1
              ? "Get Started"
              : "Continue"}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
