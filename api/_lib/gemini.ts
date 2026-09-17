import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    user_transcript: {
      type: SchemaType.STRING,
      description: 'Accurate word-for-word English transcription of what the user said in the audio.',
    },
    character_reply: {
      type: SchemaType.STRING,
      description: 'In-character response following character persona and instructions.',
    },
    feedback: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING, enum: ['clean', 'has_feedback'], format: 'enum' },
        corrections: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING },
              text: { type: SchemaType.STRING },
            },
          },
        },
        remember: { type: SchemaType.STRING, nullable: true },
      },
      required: ['status', 'corrections'],
    },
    memory_updates: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          content: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
        },
      },
    },
  },
  required: ['character_reply', 'feedback', 'memory_updates'],
};

export interface ChatInput {
  text?: string;
  audio?: {
    data: string; // base64
    mimeType: string;
  };
}

export async function generateChatResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  input: string | ChatInput,
) {
  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const contents: any[] = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const isAudio = typeof input !== 'string' && !!input.audio?.data;

    if (isAudio && typeof input !== 'string' && input.audio) {
      contents.push({
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: input.audio.mimeType || 'audio/webm',
              data: input.audio.data,
            },
          },
          {
            text: 'Listen to my audio recording above. 1. Transcribe what I said accurately into "user_transcript". 2. Reply in character into "character_reply". 3. Provide brief English feedback (evaluating pronunciation, clarity, naturalness, and grammar from what you heard) in "feedback". 4. Suggest any memory updates in "memory_updates".',
          },
        ],
      });
    } else {
      const textMessage = typeof input === 'string' ? input : (input.text || '');
      contents.push({
        role: 'user',
        parts: [{ text: textMessage }],
      });
    }

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    if (error?.status === 429) {
      throw { status: 429, message: 'Rate limit reached. Please wait a moment.' };
    }
    throw error;
  }
}
