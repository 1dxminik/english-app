import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    character_reply: { type: SchemaType.STRING },
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

export async function generateChatResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string,
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

    const contents = conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: msg.content }],
    }));

    contents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    });

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
