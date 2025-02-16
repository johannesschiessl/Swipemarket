import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import { Message } from "@/types/chat/message";

interface ChatMessageProps {
  message: Message;
  isCurrentUser: boolean;
  onImagePress?: (imageUrl: string) => void;
}

export default function ChatMessage({
  message,
  isCurrentUser,
  onImagePress,
}: ChatMessageProps) {
  const maxWidth = Dimensions.get("window").width * 0.7;

  return (
    <View
      className={`mx-4 my-1 max-w-[80%] ${
        isCurrentUser ? "self-end" : "self-start"
      }`}
    >
      <View
        className={`rounded-2xl p-3 ${
          isCurrentUser ? "bg-primary" : "bg-gray-200"
        }`}
      >
        {message.text && (
          <Text className={`${isCurrentUser ? "text-white" : "text-gray-900"}`}>
            {message.text}
          </Text>
        )}
        {message.image && (
          <TouchableOpacity
            onPress={() => onImagePress?.(message.image!)}
            className="mt-2"
          >
            <Image
              source={{ uri: message.image }}
              className="rounded-xl"
              style={{
                width: maxWidth - 40, // Account for padding and margins
                height: (maxWidth - 40) * 0.75, // 4:3 aspect ratio
                resizeMode: "cover",
              }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
