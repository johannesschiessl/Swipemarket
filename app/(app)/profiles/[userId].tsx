import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import HeaderWithClose from "@/components/shared/header-with-close";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Profile } from "@/types/profile";

export default function ProfilePage() {
  const { userId } = useLocalSearchParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      setProfile(data);
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

      {/* Profile Content */}
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
      </View>
    </SafeAreaView>
  );
}
