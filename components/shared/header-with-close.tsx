import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";

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
      <TouchableOpacity
        onPress={onClose}
        className="w-10 h-10 items-center justify-center"
      >
        <ArrowLeft color="black" size={24} />
      </TouchableOpacity>
      <Text className="text-2xl text-foreground font-bold">{title}</Text>
      <View className="w-10" />
    </View>
  );
}
