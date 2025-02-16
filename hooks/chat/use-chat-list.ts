import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Chat } from "@/types/chat";
import { Message } from "@/types/chat/message";

interface ChatWithLatestMessage extends Chat {
  latest_message?: Message;
}

export function useChatList() {
  const [chats, setChats] = useState<ChatWithLatestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
      }
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    async function loadChats() {
      try {
        console.log("Loading chats for user:", currentUserId);

        const { data: chatsData, error: chatsError } = await supabase
          .from("chats")
          .select("*")
          .or(`user_1_id.eq.${currentUserId},user_2_id.eq.${currentUserId}`);

        if (chatsError) {
          console.error("Error fetching chats:", chatsError);
          throw chatsError;
        }

        console.log("Found chats:", chatsData);

        if (!chatsData || chatsData.length === 0) {
          setChats([]);
          setLoading(false);
          return;
        }

        const chatsWithMessages = await Promise.all(
          chatsData.map(async (chat) => {
            try {
              const { data: messageData, error: messageError } = await supabase
                .from("messages")
                .select("*")
                .eq("chat_id", chat.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();

              if (messageError && messageError.code !== "PGRST116") {
                console.error(
                  "Error fetching message for chat:",
                  chat.id,
                  messageError,
                );
              }

              return {
                ...chat,
                latest_message: messageData || undefined,
              };
            } catch (error) {
              console.error("Error processing chat:", chat.id, error);
              return chat;
            }
          }),
        );

        console.log("Chats with messages:", chatsWithMessages);
        setChats(chatsWithMessages);
      } catch (error) {
        console.error("Error loading chats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChats();

    const messagesSubscription = supabase
      .channel("messages_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          console.log("New message received:", payload);
          const newMessage = payload.new as Message;
          setChats((currentChats) => {
            return currentChats.map((chat) => {
              if (chat.id === newMessage.chat_id) {
                return {
                  ...chat,
                  latest_message: newMessage,
                };
              }
              return chat;
            });
          });
        },
      )
      .subscribe();

    const chatsSubscription = supabase
      .channel("chats_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `user_1_id.eq.${currentUserId},user_2_id.eq.${currentUserId}`,
        },
        (payload) => {
          console.log("New chat received:", payload);
          const newChat = payload.new as Chat;
          setChats((currentChats) => [newChat, ...currentChats]);
        },
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      chatsSubscription.unsubscribe();
    };
  }, [currentUserId]);

  return {
    chats,
    loading,
    currentUserId,
  };
}
