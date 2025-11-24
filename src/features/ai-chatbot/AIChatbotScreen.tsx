import { useState, useRef, useEffect } from "react";
import { fetchOpenRouterChat, buildMessagesWithSystemPrompt, ChatMessage } from "./AIapi";
import { SystemPromptParams } from "./systemPrompt";
import {
  ChevronLeft,
  Send,
  Sparkles,
  Coffee,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "motion/react";
import { useCaffeine } from "@/contexts/CaffeineContext";
import { useTranslation } from "react-i18next";

interface AIChatbotScreenProps {
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function AIChatbotScreen({ onBack }: AIChatbotScreenProps) {
      // 모델 선택 상태: 'free' | 'paid'
      const [modelType, setModelType] = useState<'free' | 'paid'>('free');
    // 채팅 초기화 핸들러
    const handleResetChat = () => {
      setMessages([
        {
          id: "1",
          text: t("aiChat.placeholder"),
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      if (currentUserId) {
        const storageKey = `ai_chat_messages_${currentUserId}`;
        localStorage.removeItem(storageKey);
      }
    };
  const { t } = useTranslation();
  const {
    dailyLimit,
    currentIntake,
    remainingCaffeine,
  } = useCaffeine();
  
  // 현재 로그인한 사용자 ID 가져오기
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const getUserId = async () => {
      try {
        const { profileAPI } = await import("@/lib/api");
        const profile = await profileAPI.getProfile();
        setCurrentUserId(String(profile.member_id));
      } catch (error) {
        console.error('Failed to get user ID:', error);
      }
    };
    getUserId();
  }, []);
  
  // localStorage에서 채팅 기록 불러오기 (사용자별)
  const loadMessages = (): Message[] => {
    if (!currentUserId) return [
      {
        id: "1",
        text: t("aiChat.placeholder"),
        sender: "ai",
        timestamp: new Date(),
      },
    ];
    
    try {
      const storageKey = `ai_chat_messages_${currentUserId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
    return [
      {
        id: "1",
        text: t("aiChat.placeholder"),
        sender: "ai",
        timestamp: new Date(),
      },
    ];
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: t("aiChat.placeholder"),
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 사용자 ID가 로드되면 해당 사용자의 메시지 불러오기
  useEffect(() => {
    if (currentUserId) {
      const userMessages = loadMessages();
      setMessages(userMessages);
    }
  }, [currentUserId]);

  // 메시지가 변경될 때마다 localStorage에 저장 (사용자별)
  useEffect(() => {
    if (messages.length > 0 && currentUserId) {
      const storageKey = `ai_chat_messages_${currentUserId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickReplies = [
    { icon: Coffee, text: t("aiChat.quickIntake", { defaultValue: "오늘 카페인 섭취량은?" }) },
    { icon: TrendingDown, text: t("aiChat.quickReduce", { defaultValue: "카페인 줄이는 방법" }) },
    { icon: Calendar, text: t("aiChat.quickTiming", { defaultValue: "최적의 카페인 타이밍" }) },
  ];

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Show typing indicator
    setIsTyping(true);

    // OpenRouter API 호출
    console.log('[AI Chat] OpenRouter API 호출 시작');
    try {
      // DB에서 음료 기록 가져오기
      const { caffeineAPI, profileAPI } = await import("@/lib/api");
      const [history, profile] = await Promise.all([
        caffeineAPI.getHistory(),
        profileAPI.getProfile()
      ]);

      // 최근 10개 음료 기록을 텍스트로 변환
      const drinkHistoryText = history
        .slice(-10)
        .reverse()
        .map((item, idx) =>
          `${idx + 1}. ${item.brand_name} - ${item.menu_name} (${item.caffeine_mg}mg) at ${new Date(item.drinked_at).toLocaleString('ko-KR')}`
        )
        .join('\n');

      // 실제 유저 정보로 파라미터 구성
      const birthYear = profile.caffeineInfo?.age || "2000"; // age 필드는 출생연도
      const currentYear = new Date().getFullYear();
      const userAge = currentYear - parseInt(birthYear); // 만나이 계산
      const userWeight = profile.caffeineInfo?.weight_kg || 70;
      const userGender = profile.caffeineInfo?.gender || "남자";

      const params: SystemPromptParams = {
        user: profile.username || "user",
        userName: profile.name || "사용자",
        userWeight: userWeight,
        userAge: userAge,
        userGender: userGender,
        caffeineLimit: dailyLimit,
        currentCaffeine: currentIntake,
        remainingCaffeine: remainingCaffeine,
        userLanguage: profile.language_code,
        drinkHistory: drinkHistoryText || "No recent drinks.",
      };
      const messagesForAI: ChatMessage[] = buildMessagesWithSystemPrompt(params, [messageText]);
      console.log('[AI Chat] 메시지 준비 완료, API 호출 중...');
      // 모델 타입 전달
      const aiReply = await fetchOpenRouterChat(messagesForAI, modelType);
      console.log('[AI Chat] API 응답 성공:', aiReply);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      console.error('[AI Chat] API 호출 실패:', err);
      console.error('[AI Chat] 에러 상세:', {
        name: err?.name,
        message: err?.message,
        response: err?.response,
        stack: err?.stack
      });

      let errorMsg = "AI 답변을 불러오지 못했습니다. 다시 시도해 주세요.";
      if (err?.name === "AbortError" || err?.message?.includes("timeout")) {
        errorMsg = "AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
      } else if (err?.response?.status === 401 || err?.response?.status === 403) {
        errorMsg = "AI 서비스 인증에 실패했습니다. 관리자에게 문의해 주세요.";
      } else if (err?.message?.includes("Network") || err?.message?.includes("network")) {
        errorMsg = "네트워크 연결에 문제가 있습니다. 인터넷 상태를 확인해 주세요.";
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: errorMsg,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 모델 선택 영역 (드롭다운) */}
      <div className="sticky top-0 z-20 bg-background/95 px-6 py-2 border-b border-border/30 flex gap-3 items-center">
        <span className="text-sm font-semibold">AI 모델 선택:</span>
        <select
          value={modelType}
          onChange={e => setModelType(e.target.value as 'free' | 'paid')}
          className="rounded-full border px-3 py-1 text-sm bg-background focus:outline-none"
        >
          <option value="free">무료 (x-ai/grok-4.1-fast)</option>
          <option value="paid">유료 (GPT-4o)</option>
        </select>
        <span className="text-xs text-muted-foreground ml-2">
          {modelType === 'free' ? '빠른 응답, 무료' : '최고 품질, 유료' }
        </span>
      </div>
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <motion.div
              className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
              animate={{
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-[20px]">카페인 AI</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="ml-2"
          >
            초기화
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                } rounded-2xl px-4 py-3 shadow-sm`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">
                  {message.text}
                </p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString("ko-KR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex justify-start"
          >
            <div className="bg-card border border-border rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {messages.length === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-6 pb-4"
        >
          <p className="text-sm text-muted-foreground mb-3">빠른 질문</p>
          <div className="flex gap-2 flex-wrap">
            {quickReplies.map((reply, index) => {
              const Icon = reply.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="rounded-full text-sm"
                    onClick={() => handleSend(reply.text)}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {reply.text}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-border/50 px-6 py-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                // 자동으로 높이 조절
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto';
                  textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
                }
              }}
              onKeyPress={handleKeyPress}
              placeholder={t("chat.typeMessage")}
              className="rounded-2xl px-4 py-3 resize-none min-h-[48px] max-h-[150px]"
              rows={1}
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="icon"
              className="rounded-full h-12 w-12 shrink-0"
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
