import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import HeaderWithClose from "@/components/shared/header-with-close";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Profile } from "@/types/profile";
import { type Review } from "@/types/profile/review";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReviewCard from "@/components/profiles/reviews/review-card";
import { Button } from "@/components/ui/button";

interface ProfileWithReviews extends Profile {
  reviews: (Review & {
    reviewer: Pick<Profile, "name" | "username" | "image_url">;
  })[];
}

export default function ProfilePage() {
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<ProfileWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("products");

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        setError("No user ID provided");
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_id, image_url, name, username, bio, created_at")
        .eq("user_id", userId)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Profile not found");

      const { data: reviewsData, error: reviewsError } = await supabase
        .from("reviews")
        .select("*")
        .eq("review_for", userId);

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

      const reviews = (reviewsData || [])
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

      setProfile({
        ...profileData,
        reviews,
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
        <HeaderWithClose title="Profile" onClose={() => router.back()} />
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
      <HeaderWithClose
        title={profile.name || "Profile"}
        onClose={() => router.back()}
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="flex-1 px-4">
          {/* Profile Image and Basic Info */}
          <View className="items-center mt-4 mb-6">
            {profile.image_url ? (
              <Image
                source={{ uri: profile.image_url }}
                className="w-24 h-24 rounded-full mb-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-muted mb-4 items-center justify-center">
                <Text className="text-2xl text-foreground">
                  {profile.name?.charAt(0) || "?"}
                </Text>
              </View>
            )}
            <Text className="text-xl font-bold text-foreground">
              {profile.name || "No name set"}
            </Text>
            <Text className="text-base text-muted-foreground">
              @{profile.username || "username"}
            </Text>
          </View>

          {/* Bio */}
          {profile.bio && (
            <View className="mb-8 px-2">
              <Text className="text-base text-foreground text-center">
                {profile.bio}
              </Text>
            </View>
          )}

          {/* Write Review Button */}
          <Button
            variant="outline"
            className="mb-8"
            onPress={() =>
              router.push(`/(app)/profiles/review/${userId}` as any)
            }
          >
            <Text className="text-foreground">Write a Review</Text>
          </Button>

          {/* Tabs Section */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex-row w-full">
              <TabsTrigger value="products" className="flex-1">
                <Text>Products</Text>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">
                <Text>Reviews ({profile.reviews.length})</Text>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="flex-1">
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-muted-foreground">
                  TODO: Fetch user's products
                </Text>
              </View>
            </TabsContent>

            <TabsContent value="reviews" className="flex-1">
              {profile.reviews.length === 0 ? (
                <View className="flex-1 items-center justify-center p-4">
                  <Text className="text-muted-foreground">No reviews yet</Text>
                </View>
              ) : (
                <View className="flex-1 gap-4 mt-2">
                  {profile.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </View>
              )}
            </TabsContent>
          </Tabs>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
