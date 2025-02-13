import { Product } from "@/types/products";
import { View, Text, Image, Pressable } from "react-native";
import { Heart, PlusCircle, X } from "lucide-react-native";
import { useRouter } from "expo-router";
interface ProductCardProps {
  product: Product;
  onLike: () => void;
  onAddToList: () => void;
  onNotInterested: () => void;
}

export default function ProductCard({
  product,
  onLike,
  onAddToList,
  onNotInterested,
}: ProductCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(app)/products/${product.id}` as any)}
      className="relative w-full aspect-[4/5] rounded-[1rem] overflow-hidden"
    >
      {/* Background Image */}
      <Image
        source={{ uri: product.images[0] }}
        className="absolute w-full h-full bg-black"
      />

      {/* Gradient Overlay for better text readability */}
      <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Action Buttons */}
      <View className="absolute right-4 bottom-6 gap-2">
        <Pressable
          onPress={onNotInterested}
          className="p-4 rounded-full h-16 w-16 bg-neutral-100 justify-center items-center"
        >
          <X size={28} color="black" />
        </Pressable>

        <Pressable
          onPress={onAddToList}
          className="p-4 rounded-full h-16 w-16 bg-neutral-100 justify-center items-center"
        >
          <PlusCircle size={28} color="black" />
        </Pressable>

        <Pressable
          onPress={onLike}
          className="p-4 rounded-full h-16 w-16 bg-red-100 justify-center items-center"
        >
          <Heart size={28} color="red" />
        </Pressable>
      </View>

      {/* Product Info */}
      <View className="absolute bottom-8 left-4 right-20">
        <Text className="text-3xl font-bold text-white mb-1" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-xl font-semibold text-white mb-2">
          {product.price}€
        </Text>
        <Text className="text-sm text-white/90 mb-2" numberOfLines={2}>
          {product.description}
        </Text>
        <Text className="text-xs text-white/80">@{product.user_id}</Text>
      </View>
    </Pressable>
  );
}
