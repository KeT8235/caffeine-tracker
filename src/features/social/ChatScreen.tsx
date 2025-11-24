import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Send, Coffee, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { chatAPI } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface Friend {
  id: number;
  name: string;
  initials: string;
  caffeineLevel: number;
  avatarColor: string;
}

interface ChatScreenProps {
  friend: Friend;
  onBack: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: "me" | "friend";
  timestamp: string;
  type?: "info" | "warning";
}

export function ChatScreen({ friend, onBack }: ChatScreenProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 채팅방 생성 및 메시지 로드
  useEffect(() => {
    initChat();
  }, [friend.id]);

  const initChat = async () => {
    try {
      setIsLoading(true);
      
      // 사용자 정보 가져오기 (localStorage에서)
      const token = localStorage.getItem("auth_token");
      let userId = null;
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userId = payload.memberId;
        setCurrentUserId(userId);
      }

      // 채팅방 생성 또는 가져오기
      const roomData = await chatAPI.getOrCreateChatRoom(friend.id);
      setRoomId(roomData.roomId);

      // 메시지 로드
      const messagesData = await chatAPI.getMessages(roomData.roomId);
      const formattedMessages: Message[] = messagesData.messages.map((msg: any) => ({
        id: msg.message_id,
        text: msg.content,
        sender: msg.sender_id === userId ? "me" : "friend",
        timestamp: new Date(msg.sent_at).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(formattedMessages);
    } catch (error: any) {
      console.error("Chat init failed:", error);
      toast.error(t("chat.loadFailed", { defaultValue: "채팅을 불러오는 중 오류가 발생했습니다." }));
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (inputValue.trim() === "" || !roomId) return;

    const messageText = inputValue.trim();
    setInputValue("");

    try {
      // 메시지 전송
      const result = await chatAPI.sendMessage(roomId, messageText);
      
      // 새 메시지 추가
      const newMessage: Message = {
        id: result.data.message_id,
        text: result.data.content,
        sender: "me",
        timestamp: new Date(result.data.sent_at).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newMessage]);
    } catch (error: any) {
      console.error("Message send failed:", error);
      toast.error(t("chat.sendFailed", { defaultValue: "메시지 전송에 실패했습니다." }));
      setInputValue(messageText); // 실패 시 입력값 복원
    }
  };

  const getCaffeineStatus = (level: number) => {
    if (level >= 300) {
      return {
        color: "bg-red-500",
        label: t("dashboard.high"),
        textColor: "text-red-600",
      };
    } else if (level >= 100) {
      return {
        color: "bg-yellow-500",
        label: t("dashboard.caution"),
        textColor: "text-yellow-700",
      };
    } else {
      return {
        color: "bg-green-500",
        label: t("dashboard.safe"),
        textColor: "text-green-600",
      };
    }
  };

  const status = getCaffeineStatus(friend.caffeineLevel);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-center space-x-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onBack}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </motion.div>

          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <Avatar className="w-12 h-12 border-2 border-border/50">
                <div
                  className={`w-full h-full bg-gradient-to-br ${friend.avatarColor} flex items-center justify-center`}
                >
                  <span className="text-white text-[16px]">
                    {friend.initials}
                  </span>
                </div>
              </Avatar>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${status.color} rounded-full border-2 border-background`}
              />
            </div>

            <div className="flex-1">
              <h1 className="text-[20px]">{friend.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  카페인 {friend.caffeineLevel}mg
                </span>
                <Badge
                  className={`${status.color} text-white border-0 text-[10px] px-1.5 py-0`}
                >
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caffeine Info Banner */}
      {friend.caffeineLevel >= 300 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-6 mt-4"
        >
          <Card className="p-3 bg-red-50 border-red-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800">
                  <span className="">{friend.name}</span>님의 카페인 섭취량이
                  높습니다
                </p>
                <p className="text-xs text-red-600 mt-0.5">
                  적절한 휴식을 권장해보세요!
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end space-x-2 max-w-[75%] ${message.sender === "me" ? "flex-row-reverse space-x-reverse" : ""}`}
              >
                {message.sender === "friend" && (
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <div
                      className={`w-full h-full bg-gradient-to-br ${friend.avatarColor} flex items-center justify-center`}
                    >
                      <span className="text-white text-xs">
                        {friend.initials}
                      </span>
                    </div>
                  </Avatar>
                )}

                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      message.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}
                  >
                    <p className="text-[15px] leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                  <p
                    className={`text-xs text-muted-foreground px-1 ${
                      message.sender === "me" ? "text-right" : "text-left"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="px-6 pb-2">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 no-scrollbar">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs whitespace-nowrap"
            onClick={() => setInputValue(t("chat.suggestReduce", { defaultValue: "카페인 섭취 조금 줄이는 게 어때?" }))}
          >
            <Coffee className="w-3 h-3 mr-1" />
            {t("chat.reduceButton", { defaultValue: "카페인 줄이기 추천" })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs whitespace-nowrap"
            onClick={() => setInputValue(t("chat.suggestWater", { defaultValue: "물 좀 마셔!" }))}
          >
            💧 {t("chat.waterButton", { defaultValue: "물 마시기" })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs whitespace-nowrap"
            onClick={() => setInputValue(t("chat.suggestGreet", { defaultValue: "오늘 어때?" }))}
          >
            👋 {t("chat.greetButton", { defaultValue: "인사하기" })}
          </Button>
        </div>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={t("chat.typeMessage")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="rounded-full pr-4 h-11 bg-secondary/50 border-secondary focus:border-primary"
            />
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              className="rounded-full w-11 h-11 bg-primary hover:bg-primary/90"
              onClick={handleSend}
              disabled={inputValue.trim() === ""}
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
