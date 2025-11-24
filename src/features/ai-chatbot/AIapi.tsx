import { buildSystemPrompt, SystemPromptParams } from "./systemPrompt";
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

export async function fetchOpenRouterChat(
  messages: ChatMessage[],
  modelType: 'free' | 'paid' = 'free'
): Promise<string> {
  console.log('[AIapi] fetchOpenRouterChat 호출됨');
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  console.log('[AIapi] API 키 존재 여부:', !!OPENROUTER_API_KEY);

  if (!OPENROUTER_API_KEY) {
    console.error('[AIapi] API 키가 설정되지 않음');
    throw new Error('OpenRouter API 키가 설정되어 있지 않습니다.');
  }

  // 모델 선택: 기본값은 무료 모델, 필요시 유료 모델 지정
  // model 파라미터 추가
  // 무료: x-ai/grok-4.1-fast, 유료: openai/gpt-4o-mini
  const DEFAULT_FREE_MODEL = 'x-ai/grok-4.1-fast';
  const DEFAULT_PAID_MODEL = 'openai/gpt-4o-mini';

  // modelType 파라미터를 직접 사용
  const model = modelType === 'paid' ? DEFAULT_PAID_MODEL : DEFAULT_FREE_MODEL;

  console.log(`[AIapi] fetch 요청 시작... 모델: ${model}`);
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });
  
  console.log('[AIapi] fetch 응답 수신, 상태:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('[AIapi] API 오류:', res.status, errorText);
    throw new Error(`OpenRouter API 오류: ${res.status} ${errorText}`);
  }
  
  const data = await res.json();
  console.log('[AIapi] 응답 데이터:', data);
  if (!data.choices || !data.choices[0]?.message?.content) {
    console.error('[AIapi] 잘못된 응답 형식:', data);
    throw new Error('OpenRouter 응답이 올바르지 않습니다.');
  }
  
  const content = data.choices[0].message.content;
  console.log('[AIapi] 최종 응답:', content);
  return content;
}