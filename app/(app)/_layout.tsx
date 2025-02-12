import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { PortalHost } from "@rn-primitives/portal";
import { ProfileProvider } from "@/contexts/profile-context";

export default function AppLayout(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false);
      if (!session) {
        router.replace("/(auth)/onboarding");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/(auth)/onboarding");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ProfileProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
      <PortalHost />
    </ProfileProvider>
  );
}
