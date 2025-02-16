import {
  View,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { useChat } from "@/hooks/chat/use-chat";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "@/types/chat/message";
import { Profile } from "@/types/profile";
import { Plus, ArrowUp, X } from "lucide-react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import ChatHeader from "@/components/chat/chat-header";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import ChatMessage from "@/components/chat/chat-message";

export default function ChatPage() {
  const { userId } = useLocalSearchParams();
  const { messages, loading, sending, sendMessage } = useChat(userId as string);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<Profile | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!error && data) {
        setOtherUserProfile(data);
      } else {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);

      const filename = uri.split("/").pop() || "";
      const extension = filename.split(".").pop()?.toLowerCase() || "";
      const filePath = `${Date.now()}.${extension}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from("message_images")
        .upload(filePath, Buffer.from(base64, "base64"), {
          contentType: `image/${extension}`,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("message_images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !selectedImage) return;

    try {
      Keyboard.dismiss();
      setUploadingImage(true);

      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      await sendMessage(newMessage.trim(), imageUrl || undefined);
      setNewMessage("");
      setSelectedImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.user_id === currentUserId;
    return (
      <ChatMessage
        message={item}
        isCurrentUser={isCurrentUser}
        onImagePress={(imageUrl) => {
          // TODO: Implement full-screen image view
          console.log("View image:", imageUrl);
        }}
      />
    );
  };

  if (loading || !currentUserId || !otherUserProfile) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ChatHeader profile={otherUserProfile} onClose={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1">
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 8 }}
            inverted={false}
          />
          <View className="border-t border-gray-200 bg-white px-4 py-2">
            {selectedImage && (
              <View className="mb-2 rounded-xl overflow-hidden relative">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-32 h-24 rounded-xl"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setSelectedImage(null)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1"
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            <View className="flex-row items-center space-x-2">
              <View className="flex-1 flex-row items-center space-x-2 rounded-full bg-gray-100 px-4 py-2">
                <TouchableOpacity
                  className="h-8 w-8 items-center justify-center"
                  onPress={handleImagePick}
                  disabled={uploadingImage || !!selectedImage}
                >
                  <Plus size={24} color={selectedImage ? "gray" : "black"} />
                </TouchableOpacity>
                <TextInput
                  ref={inputRef}
                  className="flex-1 text-base leading-5 px-2 py-1.5"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                  onSubmitEditing={handleSend}
                  editable={!sending && !uploadingImage}
                  style={{ textAlignVertical: "center" }}
                />
                <TouchableOpacity
                  onPress={handleSend}
                  disabled={
                    sending ||
                    uploadingImage ||
                    (!newMessage.trim() && !selectedImage)
                  }
                  className={`h-8 w-8 items-center justify-center rounded-full ${
                    sending ||
                    uploadingImage ||
                    (!newMessage.trim() && !selectedImage)
                      ? "bg-gray-300"
                      : "bg-primary"
                  }`}
                >
                  {sending || uploadingImage ? (
                    <ActivityIndicator color="black" size="small" />
                  ) : (
                    <ArrowUp
                      size={24}
                      color={
                        !newMessage.trim() && !selectedImage ? "gray" : "black"
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
