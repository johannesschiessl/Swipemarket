import { View, Text, Image, TouchableOpacity } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Profile } from "@/types/profile";

interface ChatCardProps {
  chat: {
    id: string;
    user_1_id: string;
    user_2_id: string;
    created_at: string;
    latest_message?: {
      text?: string;
      created_at: string;
    };
  };
  currentUserId: string;
}

export default function ChatCard({ chat, currentUserId }: ChatCardProps) {
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(
    null,
  );
  const otherUserId =
    chat.user_1_id === currentUserId ? chat.user_2_id : chat.user_1_id;

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", otherUserId)
        .single();

      if (!error && data) {
        setOtherUserProfile(data);
      } else {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();
  }, [otherUserId]);

  if (!otherUserProfile) {
    return null;
  }

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 space-x-4"
      onPress={() => router.push(`/chat/${otherUserId}`)}
    >
      <View className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
        {otherUserProfile.image_url ? (
          <Image
            source={{ uri: otherUserProfile.image_url }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-primary">
            <Text className="text-lg font-semibold text-white">
              {otherUserProfile.name.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 px-2">
        <Text className="text-base font-semibold">{otherUserProfile.name}</Text>
        {chat.latest_message && (
          <View className="flex-row items-center mt-1">
            <Text className="text-sm text-gray-500 flex-1" numberOfLines={1}>
              {chat.latest_message.text || "Sent an image"}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(chat.latest_message.created_at), {
                addSuffix: true,
              })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
