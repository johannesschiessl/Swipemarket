import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Settings } from "lucide-react-native";

import { useProfile } from "@/contexts/profile-context";

export default function ProfilePage(): JSX.Element {
  const router = useRouter();
  const { profile } = useProfile();

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
          {profile?.image_url ? (
            <Image
              source={{ uri: profile.image_url }}
              className="w-24 h-24 rounded-full mb-4"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-muted mb-4 items-center justify-center">
              <Text className="text-2xl text-foreground">
                {profile?.name?.charAt(0) || "?"}
              </Text>
            </View>
          )}
          <Text className="text-xl font-bold text-foreground">
            {profile?.name || "Set up your profile"}
          </Text>
          <Text className="text-base text-muted-foreground">
            @{profile?.username || "username"}
          </Text>
        </View>

        {/* Bio */}
        {profile?.bio && (
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
