import { Request, Response } from 'express';
import axios from 'axios';

export const handleChat = async (req: Request, res: Response) => {
  // 프론트엔드에서 messages와 modelType을 받습니다.
  const { messages: userMessages, modelType = 'free' } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'AI API 키가 서버에 설정되지 않았습니다.' });
  }

  if (!userMessages) {
    return res.status(400).json({ error: '메시지가 요청에 포함되지 않았습니다.' });
  }

  // 프론트엔드에 있던 모델 선택 로직을 백엔드로 가져옵니다.
  const DEFAULT_FREE_MODEL = 'mistralai/mistral-7b-instruct:free';
  const DEFAULT_PAID_MODEL = 'openai/gpt-4o-mini';
  const model = modelType === 'paid' ? DEFAULT_PAID_MODEL : DEFAULT_FREE_MODEL;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model, // 선택된 모델을 사용합니다.
        messages: userMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error('OpenRouter API 요청 중 오류 발생:', error.response ? error.response.data : error.message);
    res.status(error.response?.status || 500).json({
      error: 'AI 서비스로부터 응답을 받는 데 실패했습니다.',
      details: error.response?.data,
    });
  }
};
