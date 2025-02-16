import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { router } from "expo-router";
import { Profile } from "@/types/profile";

interface ChatHeaderProps {
  profile: Profile;
  onClose: () => void;
}

export default function ChatHeader({ profile, onClose }: ChatHeaderProps) {
  return (
    <View className="flex-row items-center px-4 py-2 border-b border-input bg-white">
      <TouchableOpacity
        onPress={onClose}
        className="w-10 h-10 items-center justify-center"
      >
        <ArrowLeft color="black" size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-1 flex-row items-center ml-2"
        onPress={() => router.push(`/profiles/${profile.user_id}`)}
      >
        <View className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
          {profile.image_url ? (
            <Image
              source={{ uri: profile.image_url }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-primary">
              <Text className="text-lg font-semibold text-white">
                {profile.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground">
            {profile.name}
          </Text>
          <Text className="text-sm text-gray-500">@{profile.username}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}
