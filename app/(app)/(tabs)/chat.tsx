import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useChatList } from "@/hooks/chat/use-chat-list";
import ChatCard from "@/components/chat/chat-card";

export default function ChatTab() {
  const { chats, loading, currentUserId } = useChatList();

  if (loading || !currentUserId) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="px-4 py-2">
          <Text className="text-2xl text-foreground font-bold">Chats</Text>
        </View>
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-lg text-gray-500 text-center">
            No chats yet.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-2">
        <Text className="text-2xl text-foreground font-bold">Chats</Text>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatCard chat={item} currentUserId={currentUserId} />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
}
