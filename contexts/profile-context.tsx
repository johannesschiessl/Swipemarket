import React, { createContext, useContext, useState, useEffect } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { type Profile } from "@/types/profile";

interface ProfileContextType {
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = async () => {
    try {
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.session?.user.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, image_url, name, username, bio, created_at")
        .eq("user_id", session.session.user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No profile found, create one
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert({
              user_id: session.session.user.id,
              name: "",
              username: "",
              bio: "",
              image_url: null,
            })
            .select()
            .single();

          if (createError) throw createError;
          setProfile(newProfile);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile");
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, refreshProfile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
