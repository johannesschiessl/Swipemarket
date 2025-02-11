import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import { useRouter } from "expo-router";
import { X, ImagePlus } from "lucide-react-native";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@/components/ui/select";
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  type ProductCategory,
  type ProductCondition,
} from "@/constants/products";
import { supabase } from "@/lib/supabase";

interface CreateProductForm {
  images: string[];
  name: string;
  description: string;
  price: string;
  category: Option | undefined;
  condition: Option | undefined;
}

const MAX_IMAGES = 10;

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const [form, setForm] = useState<CreateProductForm>({
    images: [],
    name: "",
    description: "",
    price: "",
    category: undefined,
    condition: undefined,
  });

  const pickImage = async () => {
    if (form.images.length >= MAX_IMAGES) {
      Alert.alert(
        "Maximum Images",
        `You can only upload up to ${MAX_IMAGES} images`,
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, result.assets[0].uri],
      }));
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const uploadImages = async (images: string[]): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < images.length; i++) {
      const uri = images[i];
      const filename = uri.split("/").pop() || "";
      const extension = filename.split(".").pop()?.toLowerCase() || "";
      const filePath = `${Date.now()}_${i}.${extension}`;

      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { error } = await supabase.storage
          .from("product_images")
          .upload(filePath, Buffer.from(base64, "base64"), {
            contentType: `image/${extension}`,
          });

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product_images").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      } catch (error) {
        console.error(`Error uploading image ${i}:`, error);
        throw new Error(`Failed to upload image ${i + 1}`);
      }
    }

    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!form.category?.value || !form.condition?.value) {
      Alert.alert("Error", "Please select a category and condition");
      return;
    }

    if (!form.name.trim()) {
      Alert.alert("Error", "Please enter a product name");
      return;
    }

    if (!form.description.trim()) {
      Alert.alert("Error", "Please enter a product description");
      return;
    }

    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    if (form.images.length === 0) {
      Alert.alert("Error", "Please add at least one image");
      return;
    }

    try {
      setLoading(true);

      const imageUrls = await uploadImages(form.images);

      const { error: productError } = await supabase
        .from("products")
        .insert({
          name: form.name.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          category: form.category.value as ProductCategory,
          condition: form.condition.value as ProductCondition,
          images: imageUrls,
          is_sold: false,
        })
        .select()
        .single();

      if (productError) throw productError;

      Alert.alert("Success", "Product created successfully!", [
        {
          text: "OK",
          onPress: () => router.push("/(app)/(tabs)/home"),
        },
      ]);
    } catch (error) {
      console.error("Error creating product:", error);
      Alert.alert("Error", "Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-1 px-4 py-6"
      >
        <Text className="text-2xl text-foreground text-center font-bold mb-6">
          Create Listing
        </Text>

        {/* Image Selection */}
        <View className="mb-6">
          <Label className="mb-2">
            Images ({form.images.length}/{MAX_IMAGES})
          </Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row py-2"
          >
            {form.images.length < MAX_IMAGES && (
              <TouchableOpacity
                onPress={pickImage}
                className="w-24 h-24 bg-muted rounded-[1rem] items-center justify-center border-2 border-dashed border-input"
              >
                <ImagePlus color="black" />
              </TouchableOpacity>
            )}
            {form.images.map((uri, index) => (
              <View key={index} className="relative ml-3">
                <Image
                  source={{ uri }}
                  className="w-24 h-24 rounded-[1rem]"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"
                >
                  <X size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Product Details */}
        <View className="gap-4">
          <View>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, name: text }))
              }
              placeholder="Product name"
              className="mt-1"
            />
          </View>

          <View>
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, description: text }))
              }
              placeholder="Describe your product in detail..."
              className="mt-1"
              numberOfLines={6}
            />
          </View>

          <View>
            <Label>Price</Label>
            <Input
              value={form.price}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, price: text }))
              }
              placeholder="0.00"
              keyboardType="decimal-pad"
              className="mt-1"
            />
          </View>

          <View>
            <Label>Category</Label>
            <Select
              value={form.category}
              onValueChange={(option) =>
                setForm((prev) => ({ ...prev, category: option }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem
                    key={category.value}
                    value={category.value}
                    label={category.label}
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>

          <View>
            <Label>Condition</Label>
            <Select
              value={form.condition}
              onValueChange={(option) =>
                setForm((prev) => ({ ...prev, condition: option }))
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent insets={contentInsets}>
                {PRODUCT_CONDITIONS.map((condition) => (
                  <SelectItem
                    key={condition.value}
                    value={condition.value}
                    label={condition.label}
                  >
                    {condition.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </View>
        </View>

        <Button onPress={handleSubmit} className="mt-8" disabled={loading}>
          <Text className="text-primary-foreground font-semibold">
            {loading ? "Creating..." : "Create Product"}
          </Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
