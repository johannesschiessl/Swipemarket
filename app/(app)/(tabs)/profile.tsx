import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function ProfilePage(): JSX.Element {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchEmail() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      }
      const session = data?.session;
      setEmail(session?.user.email || null);
    }
    fetchEmail();
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <View className="items-center space-y-4">
        <Text className="mb-4 text-lg font-bold">Profile</Text>
        {email ? (
          <Text className="text-base">Email: {email}</Text>
        ) : (
          <Text className="text-base">Loading Email...</Text>
        )}
        <Button
          onPress={handleSignOut}
          disabled={loading}
          variant="destructive"
          className="mt-8"
        >
          <Text className="text-white">Sign Out</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}
