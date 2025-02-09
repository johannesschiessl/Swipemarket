import { View, Text, Dimensions } from "react-native";
import { Product } from "@/types/products";
import ProductCard from "./product-card";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useCallback, useEffect, useState } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface ProductSwipeViewProps {
  products: Product[];
  onLike: (product: Product) => void;
  onAddToList: (product: Product) => void;
  onNotInterested: (product: Product) => void;
}

export default function ProductSwipeView({
  products,
  onLike,
  onAddToList,
  onNotInterested,
}: ProductSwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.9);

  const handleSwipeLeft = useCallback(() => {
    if (currentIndex < products.length) {
      onNotInterested(products[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, onNotInterested, products]);

  const handleSwipeRight = useCallback(() => {
    if (currentIndex < products.length) {
      onLike(products[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, onLike, products]);

  const animateAndSwipe = useCallback(
    (direction: "left" | "right") => {
      const xValue =
        direction === "left" ? -SCREEN_WIDTH * 1.5 : SCREEN_WIDTH * 1.5;
      translateX.value = withTiming(xValue, { duration: 400 }, () => {
        runOnJS(direction === "left" ? handleSwipeLeft : handleSwipeRight)();
      });
      translateY.value = withTiming(0);
      rotate.value = withTiming(direction === "left" ? -30 : 30);
    },
    [translateX, translateY, rotate, handleSwipeLeft, handleSwipeRight],
  );

  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    rotate.value = withSpring(0);
  }, [translateX, translateY, rotate]);

  const resetAnimatedValues = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    rotate.value = 0;
    scale.value = withTiming(0.9);
  }, [translateX, translateY, rotate, scale]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        [-10, 0, 10],
      );

      scale.value = interpolate(
        Math.abs(event.translationX),
        [0, SCREEN_WIDTH / 4],
        [0.9, 1],
        "clamp",
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? "right" : "left";
        runOnJS(animateAndSwipe)(direction);
      } else {
        runOnJS(resetPosition)();
        scale.value = withTiming(0.9);
      }
    });

  const rStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value,
      },
      {
        translateY: translateY.value,
      },
      {
        rotate: `${rotate.value}deg`,
      },
    ],
  }));

  const nextCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(scale.value, [0.9, 1], [0.5, 1]),
  }));

  useEffect(() => {
    resetAnimatedValues();
  }, [currentIndex, resetAnimatedValues]);

  if (currentIndex >= products.length) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-semibold text-neutral-900">
          That's all for now!
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 items-center justify-center">
        {/* Next Card */}
        {currentIndex + 1 < products.length && (
          <Animated.View style={[{ position: "absolute" }, nextCardStyle]}>
            <ProductCard
              product={products[currentIndex + 1]}
              onLike={() => {}}
              onAddToList={() => {}}
              onNotInterested={() => {}}
            />
          </Animated.View>
        )}

        {/* Current Card */}
        <GestureDetector gesture={gesture}>
          <Animated.View style={rStyle}>
            <ProductCard
              product={products[currentIndex]}
              onLike={() => animateAndSwipe("right")}
              onAddToList={onAddToList.bind(null, products[currentIndex])}
              onNotInterested={() => animateAndSwipe("left")}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
}
