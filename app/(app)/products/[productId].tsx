import HeaderWithClose from "@/components/shared/header-with-close";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { Product } from "@/types/products";
import { Profile } from "@/types/profile";
import { supabase } from "@/lib/supabase";
import Swiper from "react-native-swiper";
import { Button } from "@/components/ui/button";
import { Image } from "react-native";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/constants/products";

interface ProductWithProfile extends Omit<Product, "profiles"> {
  profiles: Pick<Profile, "name" | "username" | "image_url">;
}

export default function ProductPage() {
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<ProductWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!productId) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      console.log("Fetching product with ID:", productId);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (productError) {
        console.error("Product fetch error:", productError);
        throw productError;
      }

      if (!productData) {
        throw new Error("Product not found");
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("name, username, image_url")
        .eq("user_id", productData.user_id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw profileError;
      }

      if (!profileData) {
        throw new Error("Profile not found");
      }

      const combinedData: ProductWithProfile = {
        ...productData,
        profiles: profileData,
      };

      console.log("Fetched data:", combinedData);
      setProduct(combinedData);
    } catch (err) {
      console.error("Error details:", err);
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <HeaderWithClose title="Loading..." onClose={() => router.back()} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" className="text-primary" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1">
        <HeaderWithClose title="Product" onClose={() => router.back()} />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <Text className="text-primary font-semibold" onPress={fetchProduct}>
            Try Again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleMessage = () => {
    router.push(`/(app)/chat/${product.user_id}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <HeaderWithClose title={product.name} onClose={() => router.back()} />

      <View className="flex-1 pb-4">
        {/* Scrollable Content including Images and Details */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Image Carousel */}
          <View className="h-96">
            <Swiper loop={false} showsPagination={true} activeDotColor="#000">
              {product.images.map((image, index) => (
                <View key={index} className="flex-1">
                  <Image
                    source={{ uri: image }}
                    className="flex-1"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </Swiper>
          </View>

          {/* Product Details */}
          <View className="px-4 pt-4 pb-20">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">
                {product.name}
              </Text>
              <Text className="text-2xl font-bold text-primary">
                {product.price}€
              </Text>
            </View>

            <View className="flex-row gap-2 mb-4">
              <View className="bg-muted px-3 py-1 rounded-full">
                <Text className="text-sm text-muted-foreground">
                  Category:{" "}
                  {
                    PRODUCT_CATEGORIES.find((c) => c.value === product.category)
                      ?.label
                  }
                </Text>
              </View>
              <View className="bg-muted px-3 py-1 rounded-full">
                <Text className="text-sm text-muted-foreground">
                  Condition:{" "}
                  {
                    PRODUCT_CONDITIONS.find(
                      (c) => c.value === product.condition,
                    )?.label
                  }
                </Text>
              </View>
            </View>

            <Text className="text-base text-foreground mb-4">
              {product.description}
            </Text>

            {/* User Profile Section */}
            <Pressable
              onPress={() =>
                router.push(`/(app)/profiles/${product.user_id}` as any)
              }
              className="flex-row items-center mt-4"
            >
              <Image
                source={{
                  uri:
                    product.profiles.image_url ||
                    "https://via.placeholder.com/40",
                }}
                className="w-10 h-10 rounded-full mr-3"
              />
              <View>
                <Text className="text-foreground font-medium">
                  {product.profiles.name}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  @{product.profiles.username}
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>

        {/* Action Button - Fixed at bottom */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button onPress={handleMessage}>
            <Text className="text-primary-foreground">Message Seller</Text>
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
