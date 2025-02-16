import { View, Text, Image, Pressable } from "react-native";
import { type Review } from "@/types/profile/review";
import { Star } from "lucide-react-native";
import { router } from "expo-router";
import { formatDistanceToNow } from "date-fns";

interface ReviewCardProps {
  review: Review & {
    reviewer: {
      name: string;
      username: string;
      image_url: string | null;
    };
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <View className="bg-card p-4 rounded-2xl border border-border">
      {/* Reviewer Info */}
      <Pressable
        onPress={() => router.push(`/(app)/profiles/${review.user_id}` as any)}
        className="flex-row items-center mb-3"
      >
        {review.reviewer.image_url ? (
          <Image
            source={{ uri: review.reviewer.image_url }}
            className="w-8 h-8 rounded-full mr-2"
            resizeMode="cover"
          />
        ) : (
          <View className="w-8 h-8 rounded-full bg-muted mr-2 items-center justify-center">
            <Text className="text-sm text-foreground">
              {review.reviewer.name.charAt(0)}
            </Text>
          </View>
        )}
        <View>
          <Text className="text-sm font-medium text-foreground">
            {review.reviewer.name}
          </Text>
          <Text className="text-xs text-muted-foreground">
            @{review.reviewer.username}
          </Text>
        </View>
      </Pressable>

      {/* Rating */}
      <View className="flex-row mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            color={star <= review.rating ? "#facc15" : "#e5e7eb"}
            size={16}
            fill={star <= review.rating ? "#facc15" : "none"}
          />
        ))}
        <Text className="text-xs text-muted-foreground ml-2">
          {formatDistanceToNow(new Date(review.created_at), {
            addSuffix: true,
          })}
        </Text>
      </View>

      {/* Review Text */}
      <Text className="text-sm text-foreground">{review.review}</Text>
    </View>
  );
}
