import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import { X, ImagePlus } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import HeaderWithClose from "@/components/shared/header-with-close";
import { useProfile } from "@/contexts/profile-context";

interface ProfileSettings {
  image: string | null;
  name: string;
  username: string;
  bio: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<ProfileSettings>({
    image: null,
    name: "",
    username: "",
    bio: "",
  });

  useEffect(() => {
    if (profile) {
      setSettings({
        image: profile.image_url,
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
      });
    }
  }, [profile]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setSettings((prev) => ({
        ...prev,
        image: result.assets[0].uri,
      }));
    }
  };

  const removeImage = () => {
    setSettings((prev) => ({
      ...prev,
      image: null,
    }));
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const filename = uri.split("/").pop() || "";
      const extension = filename.split(".").pop()?.toLowerCase() || "";
      const filePath = `${Date.now()}.${extension}`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(filePath, Buffer.from(base64, "base64"), {
          contentType: `image/${extension}`,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const deleteOldImage = async (url: string) => {
    try {
      const filePath = url.split("/").pop();
      if (!filePath) return;

      await supabase.storage.from("profile_images").remove([filePath]);
    } catch (error) {
      console.error("Error deleting old image:", error);
    }
  };

  const handleSave = async () => {
    if (!profile?.id) {
      Alert.alert("Error", "Profile not loaded");
      return;
    }

    if (!settings.name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    if (!settings.username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    try {
      setLoading(true);

      let image_url = profile.image_url;

      if (settings.image !== profile.image_url) {
        if (settings.image) {
          image_url = await uploadImage(settings.image);
        }

        if (profile.image_url) {
          await deleteOldImage(profile.image_url);
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: settings.name.trim(),
          username: settings.username.trim(),
          bio: settings.bio.trim(),
          image_url,
        })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      await refreshProfile();

      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <HeaderWithClose title="Edit Profile" onClose={() => router.back()} />

      <ScrollView className="flex-1 px-4">
        {/* Profile Image */}
        <View className="items-center mb-6 mt-4">
          {settings.image ? (
            <View className="relative">
              <Image
                source={{ uri: settings.image }}
                className="w-24 h-24 rounded-full"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={removeImage}
                className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"
              >
                <X size={16} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickImage}
              className="w-24 h-24 bg-muted rounded-full items-center justify-center border-2 border-dashed border-input"
            >
              <ImagePlus color="black" />
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Details */}
        <View className="gap-4">
          <View>
            <Label>
              <Text>Name</Text>
            </Label>
            <Input
              value={settings.name}
              onChangeText={(text) =>
                setSettings((prev) => ({ ...prev, name: text }))
              }
              placeholder="Your name"
              className="mt-1"
            />
          </View>

          <View>
            <Label>
              <Text>Username</Text>
            </Label>
            <Input
              value={settings.username}
              onChangeText={(text) =>
                setSettings((prev) => ({ ...prev, username: text }))
              }
              placeholder="@username"
              className="mt-1"
            />
          </View>

          <View>
            <Label>
              <Text>Bio</Text>
            </Label>
            <Textarea
              value={settings.bio}
              onChangeText={(text) =>
                setSettings((prev) => ({ ...prev, bio: text }))
              }
              placeholder="Tell us about yourself..."
              className="mt-1"
              numberOfLines={4}
            />
          </View>
        </View>

        <View className="gap-4 my-8">
          <Button onPress={handleSave} disabled={loading}>
            <Text className="text-primary-foreground font-semibold">
              {loading ? "Saving..." : "Save Changes"}
            </Text>
          </Button>

          <Button
            onPress={handleSignOut}
            variant="destructive"
            disabled={loading}
          >
            <Text className="text-destructive-foreground font-semibold">
              {loading ? "Signing Out..." : "Sign Out"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
