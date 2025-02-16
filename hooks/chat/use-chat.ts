import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Message } from "@/types/chat/message";
import { Chat } from "@/types/chat";

export const useChat = (otherUserId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: existingChats } = await supabase
          .from("chats")
          .select("*")
          .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
          .or(`user_1_id.eq.${otherUserId},user_2_id.eq.${otherUserId}`);

        let currentChat = existingChats?.[0];

        if (!currentChat) {
          const { data: newChat } = await supabase
            .from("chats")
            .insert([
              {
                user_1_id: user.id,
                user_2_id: otherUserId,
              },
            ])
            .select()
            .single();

          currentChat = newChat;
        }

        setChat(currentChat);

        if (currentChat) {
          const { data: chatMessages } = await supabase
            .from("messages")
            .select("*")
            .eq("chat_id", currentChat.id)
            .order("created_at", { ascending: true });

          setMessages(chatMessages || []);
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
  }, [otherUserId]);

  useEffect(() => {
    if (!chat?.id) return;

    const subscription = supabase
      .channel(`messages:${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [chat?.id]);

  const sendMessage = async (text: string, image?: string) => {
    if (!text.trim() && !image) return;

    try {
      setSending(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !chat) return;

      await supabase.from("messages").insert([
        {
          text: text.trim() || null,
          image: image || null,
          user_id: user.id,
          chat_id: chat.id,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    chat,
    loading,
    sending,
    sendMessage,
  };
};
