import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";
import { useProfile } from "@/contexts/profile-context";
import { type Review } from "@/types/profile/review";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewCard from "@/components/profiles/reviews/review-card";
import { supabase } from "@/lib/supabase";
import { type Profile } from "@/types/profile";

interface ProfileWithReviews extends Profile {
  reviews: (Review & {
    reviewer: Pick<Profile, "name" | "username" | "image_url">;
  })[];
}

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const { profile: contextProfile } = useProfile();
  const [activeTab, setActiveTab] = useState("products");
  const [reviews, setReviews] = useState<ProfileWithReviews["reviews"]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!contextProfile?.user_id) return;

    try {
      setLoading(true);

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("review_for", contextProfile.user_id);

      if (reviewsError) throw reviewsError;

      const reviewerIds = [
        ...new Set(reviewsData?.map((r) => r.user_id) || []),
      ];
      const { data: reviewerProfiles, error: reviewerError } = await supabase
        .from("profiles")
        .select("user_id, name, username, image_url")
        .in("user_id", reviewerIds);

      if (reviewerError) throw reviewerError;

      const reviewerProfileMap = new Map(
        reviewerProfiles?.map((profile) => [profile.user_id, profile]) || [],
      );

      const transformedReviews = (reviewsData || [])
        .map((review) => {
          const reviewerProfile = reviewerProfileMap.get(review.user_id);
          if (!reviewerProfile) {
            console.warn(`No profile found for reviewer ${review.user_id}`);
            return null;
          }

          return {
            id: review.id,
            user_id: review.user_id,
            review_for: review.review_for,
            rating: review.rating as 1 | 2 | 3 | 4 | 5,
            review: review.review,
            created_at: review.created_at,
            reviewer: {
              name: reviewerProfile.name,
              username: reviewerProfile.username,
              image_url: reviewerProfile.image_url,
            },
          };
        })
        .filter(
          (review): review is NonNullable<typeof review> => review !== null,
        );

      setReviews(transformedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [contextProfile?.user_id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (!contextProfile) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      {/* Header with Settings Button */}
      <View className="flex-row justify-between items-center px-4 py-2">
        <Text className="text-2xl text-foreground font-bold">Profile</Text>
        <TouchableOpacity
          onPress={() => router.push("/(app)/settings")}
          className="p-2"
        >
          <Settings color="black" size={24} />
        </TouchableOpacity>
      </View>

      {/* Profile Content */}
      <View className="flex-1 px-4">
        {/* Profile Image and Basic Info */}
        <View className="items-center mt-4 mb-6">
          {contextProfile.image_url ? (
            <Image
              source={{ uri: contextProfile.image_url }}
              className="w-24 h-24 rounded-full mb-4"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-muted mb-4 items-center justify-center">
              <Text className="text-2xl text-foreground">
                {contextProfile.name?.charAt(0) || "?"}
              </Text>
            </View>
          )}
          <Text className="text-xl font-bold text-foreground">
            {contextProfile.name || "Set up your profile"}
          </Text>
          <Text className="text-base text-muted-foreground">
            @{contextProfile.username || "username"}
          </Text>
        </View>

        {/* Bio */}
        {contextProfile.bio && (
          <View className="mb-8 px-2">
            <Text className="text-base text-foreground text-center">
              {contextProfile.bio}
            </Text>
          </View>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex-row w-full">
            <TabsTrigger value="products" className="flex-1">
              <Text>Products</Text>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              <Text>Reviews ({reviews.length})</Text>
            </TabsTrigger>
          </TabsList>

          <ScrollView showsVerticalScrollIndicator={false}>
            <TabsContent value="products" className="flex-1">
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-muted-foreground">
                  TODO: Fetch user's products
                </Text>
              </View>
            </TabsContent>

            <TabsContent value="reviews" className="flex-1">
              {loading ? (
                <View className="flex-1 items-center justify-center p-4">
                  <Text className="text-muted-foreground">
                    Loading reviews...
                  </Text>
                </View>
              ) : reviews.length === 0 ? (
                <View className="flex-1 items-center justify-center p-4">
                  <Text className="text-muted-foreground">No reviews yet</Text>
                </View>
              ) : (
                <View className="flex-1 gap-4 mt-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </View>
              )}
            </TabsContent>
          </ScrollView>
        </Tabs>
      </View>
    </SafeAreaView>
  );
}
