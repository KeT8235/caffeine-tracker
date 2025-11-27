import { buildSystemPrompt, SystemPromptParams } from "./systemPrompt";
import { apiRequest } from "../../lib/api"; // apiRequest 헬퍼를 import 합니다.

// systemPrompt를 포함한 메시지 배열 생성 함수
export function buildMessagesWithSystemPrompt(params: SystemPromptParams, userMessages: string[]): ChatMessage[] {
  const system = buildSystemPrompt(params);
  const messages: ChatMessage[] = [
    { role: "system", content: system },
    ...userMessages.map((msg) => ({ role: "user", content: msg } as ChatMessage)),
  ];
  return messages;
}

// OpenRouter AI 챗봇 호출 함수 (타입, 에러처리 포함)
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// 백엔드를 통해 AI 챗봇을 호출하는 새로운 함수
export async function fetchOpenRouterChat(
  messages: ChatMessage[],
  modelType: 'free' | 'paid' = 'free'
): Promise<string> {
  console.log('[AIapi] 백엔드를 통해 fetchOpenRouterChat 호출됨');

  try {
    // 우리 백엔드의 /api/ai/chat 엔드포인트에 요청을 보냅니다.
    const data = await apiRequest<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages,
        modelType, // modelType을 백엔드로 전달합니다.
      }),
    });

    console.log('[AIapi] 백엔드로부터 응답 수신:', data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('[AIapi] 백엔드로부터 받은 응답 형식이 잘못됨:', data);
      throw new Error('백엔드 응답이 올바르지 않습니다.');
    }
    
    const content = data.choices[0].message.content;
    console.log('[AIapi] 최종 응답:', content);
    return content;

  } catch (error) {
    console.error('[AIapi] 백엔드 요청 중 오류 발생:', error);
    // apiRequest에서 던진 에러를 그대로 다시 던지거나, 커스텀 에러로 래핑할 수 있습니다.
    throw error;
  }
}
