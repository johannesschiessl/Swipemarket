import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ActivityIndicator, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import HeaderWithClose from "@/components/shared/header-with-close";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Profile } from "@/types/profile";
import { Star } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function WriteReviewPage() {
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [review, setReview] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        setError("No user ID provided");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, image_url, name, username, bio, created_at")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Profile not found");

      setProfile(data as Profile);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating");
      return;
    }

    if (!review.trim()) {
      setError("Please write a review");
      return;
    }

    if (!profile?.user_id) {
      setError("Profile not found");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const { error: reviewError } = await supabase.from("reviews").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        review_for: profile.user_id,
        rating,
        review: review.trim(),
      });

      if (reviewError) throw reviewError;

      router.push(`/(app)/profiles/${profile.user_id}` as any);
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err instanceof Error ? err.message : "Failed to submit review");
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  if (error || !profile) {
    return (
      <SafeAreaView className="flex-1">
        <HeaderWithClose title="Write Review" onClose={() => router.back()} />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <Text className="text-primary font-semibold" onPress={fetchProfile}>
            Try Again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <HeaderWithClose title="Write Review" onClose={() => router.back()} />

      <View className="flex-1 px-4">
        {/* Compact Profile Info */}
        <View className="flex-row items-center py-4 border-b border-border">
          {profile.image_url ? (
            <Image
              source={{ uri: profile.image_url }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-muted items-center justify-center">
              <Text className="text-lg text-foreground">
                {profile.name?.charAt(0) || "?"}
              </Text>
            </View>
          )}
          <View className="ml-3">
            <Text className="text-base font-medium text-foreground">
              {profile.name}
            </Text>
            <Text className="text-sm text-muted-foreground">
              @{profile.username}
            </Text>
          </View>
        </View>

        {/* Rating Selection */}
        <View className="py-6">
          <Text className="text-base font-medium text-foreground mb-2">
            Rating
          </Text>
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => {
              const isSelected = star <= (rating || 0);
              return (
                <Pressable
                  key={star}
                  onPress={() =>
                    setRating(
                      star === rating ? null : (star as 1 | 2 | 3 | 4 | 5),
                    )
                  }
                  className="mr-2"
                >
                  <Star
                    size={32}
                    color={isSelected ? "#facc15" : "#e5e7eb"}
                    fill={isSelected ? "#facc15" : "transparent"}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Review Text */}
        <View className="h-48 mb-4">
          <Text className="text-base font-medium text-foreground mb-2">
            Your Review
          </Text>
          <Textarea
            value={review}
            onChangeText={setReview}
            placeholder="Write your review here..."
            className="h-full"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Error Message */}
        {error && (
          <Text className="text-red-500 text-center mt-4 mb-2">{error}</Text>
        )}

        {/* Submit Button */}
        <Button onPress={handleSubmit} disabled={submitting} className="mt-6">
          <Text className="text-primary-foreground">
            {submitting ? "Submitting..." : "Submit Review"}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
