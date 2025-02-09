import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ActivityIndicator } from "react-native";
import ProductSwipeView from "@/components/products/product-swipe-view";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/products";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_sold", false)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(product: Product) {
    try {
      // TODO: Implement liking product
      console.log("Liked product:", product.id);
    } catch (err) {
      console.error("Error liking product:", err);
    }
  }

  async function handleAddToList(product: Product) {
    try {
      // TODO: Implement adding to list
      console.log("Added to list:", product.id);
    } catch (err) {
      console.error("Error adding to list:", err);
    }
  }

  async function handleNotInterested(product: Product) {
    try {
      // TODO: Implement not interested
      console.log("Not interested in:", product.id);
    } catch (err) {
      console.error("Error marking as not interested:", err);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-4">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <Text className="text-primary font-semibold" onPress={fetchProducts}>
          Try Again
        </Text>
      </SafeAreaView>
    );
  }

  if (products.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-4">
        <Text className="text-xl text-neutral-900 text-center">
          No products available at the moment.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <View className="px-4">
        <ProductSwipeView
          products={products}
          onLike={handleLike}
          onAddToList={handleAddToList}
          onNotInterested={handleNotInterested}
        />
      </View>
    </SafeAreaView>
  );
}
