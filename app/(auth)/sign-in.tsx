import React, { useState } from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignInPage(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  async function signInWithEmail(): Promise<void> {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    router.replace("/(app)/(tabs)/home");
  }

  return (
    <SafeAreaView className="flex-1 justify-center px-4">
      <Text className="text-2xl font-bold mb-4 text-center">Welcome Back!</Text>
      <Label>Email</Label>
      <Input
        placeholder="email@address.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        className="mb-4"
      />
      <Label>Password</Label>
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        className="mb-4"
      />
      <Button onPress={signInWithEmail} disabled={loading}>
        <Text className="text-white">Sign In</Text>
      </Button>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/sign-up")}
        className="mt-4 items-center"
      >
        <Text>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
