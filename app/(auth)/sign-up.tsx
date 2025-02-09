import React, { useState, useEffect } from "react";
import { Alert, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignUpPage(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);
  const router = useRouter();

  async function signUpWithEmail(): Promise<void> {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    if (session) {
      router.replace("/(app)/(tabs)/home");
    } else {
      setWaiting(true);
    }
  }

  useEffect(() => {
    if (!waiting) return;
    const interval = setInterval(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error && data.session) {
        clearInterval(interval);
        router.replace("/(app)/(tabs)/home");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [waiting, email, password, router]);

  if (waiting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-4">
        <Text className="text-lg mb-4 font-bold">Verify Your Email</Text>
        <Text className="text-base text-center">
          A verification email has been sent to {email}. Please verify your
          email address. Be sure to check your spam folder. Once verified, you
          will be signed in automatically.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 justify-center px-4">
      <Text className="text-2xl font-bold mb-4 text-center">
        Create an Account
      </Text>
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
      <Button onPress={signUpWithEmail} disabled={loading}>
        <Text className="text-white">Sign Up</Text>
      </Button>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/sign-in")}
        className="mt-4 items-center"
      >
        <Text>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
