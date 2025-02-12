import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";

interface HeaderWithCloseProps {
  title: string;
  onClose: () => void;
}

export default function HeaderWithClose({
  title,
  onClose,
}: HeaderWithCloseProps): JSX.Element {
  return (
    <View className="flex-row justify-between items-center px-4 py-2 border-b border-input">
      <View className="w-10" />
      <Text className="text-2xl text-foreground font-bold">{title}</Text>
      <TouchableOpacity
        onPress={onClose}
        className="w-10 h-10 items-center justify-center"
      >
        <X color="black" size={24} />
      </TouchableOpacity>
    </View>
  );
}
