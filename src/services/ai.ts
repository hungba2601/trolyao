import { GoogleGenAI } from "@google/genai";

let _gemini: GoogleGenAI | null = null;

const getGemini = (): GoogleGenAI | null => {
    if (_gemini) return _gemini;
    const key = localStorage.getItem('gemini_api_key') || '';
    if (!key) return null;
    _gemini = new GoogleGenAI({ apiKey: key });
    return _gemini;
};

export const setApiKeys = (geminiKey: string, groqKey: string) => {
    localStorage.setItem('gemini_api_key', geminiKey);
    localStorage.setItem('groq_api_key', groqKey);
    _gemini = null;
};

export const getGeminiApiKey = () => localStorage.getItem('gemini_api_key') || '';
export const getGroqApiKey = () => localStorage.getItem('groq_api_key') || '';

export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-3.5-flash'];
export const GROQ_MODELS = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'mixtral-8x7b-32768',
    'gemma2-9b-it'
];
export const MODELS = [...GEMINI_MODELS, ...GROQ_MODELS];

let _selectedModel: string | null = null;

export const getSelectedModel = (): string => {
    if (_selectedModel) return _selectedModel;
    return localStorage.getItem('selected_model') || 'gemini-2.5-flash';
};

export const setSelectedModel = (model: string) => {
    _selectedModel = model;
    localStorage.setItem('selected_model', model);
};

export const getAvailableModels = () => {
    const models: string[] = [];
    if (getGeminiApiKey()) {
        models.push(...GEMINI_MODELS);
    }
    if (getGroqApiKey()) {
        models.push(...GROQ_MODELS);
    }
    return models;
};
export const isGroqModel = (model: string) => GROQ_MODELS.includes(model);

const callGroqAPIStream = async (model: string, history: { role: string; parts: { text: string }[] }[], systemInstruction: string, onChunk: (text: string) => void) => {
    const key = getGroqApiKey();
    if (!key) throw new Error("Groq API Key chưa được nhập. Vui lòng vào Cài đặt để nhập Groq API Key.");

    const messages = [
        { role: "system", content: systemInstruction },
        ...history.map(m => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.parts[0].text
        }))
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.7,
            stream: true
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || `Groq API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    if (!reader) throw new Error("No reader stream");

    let fullText = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            if (line === 'data: [DONE]') break;
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.choices[0].delta.content) {
                        fullText += data.choices[0].delta.content;
                        onChunk(fullText);
                    }
                } catch (e) {}
            }
        }
    }
    return fullText;
};

export const generateResponseStream = async (
    history: { role: string; parts: { text: string }[] }[],
    systemInstruction: string,
    onChunk: (text: string) => void
) => {
    const selected = getSelectedModel();
    const orderedModels = [selected, ...MODELS.filter(m => m !== selected)];

    let lastError: Error | null = null;

    for (const modelName of orderedModels) {
        try {
            console.log(`[AI] Streaming with model: ${modelName}`);
            if (GROQ_MODELS.includes(modelName)) {
                const text = await callGroqAPIStream(modelName, history, systemInstruction, onChunk);
                if (text) {
                    console.log(`[Groq] ✅ Streaming success with model: ${modelName}`);
                    return text;
                }
            } else {
                const ai = getGemini();
                if (!ai) {
                    const nextError = new Error("Gemini API Key chưa được nhập.");
                    if (!lastError) lastError = nextError;
                    continue; // try next model
                }
                const response = await ai.models.generateContentStream({
                    model: modelName,
                    contents: history,
                    config: { systemInstruction, temperature: 0.7, topP: 0.95, topK: 40 }
                });

                let fullText = "";
                for await (const chunk of response) {
                    const chunkText = chunk.text;
                    if (chunkText) {
                        fullText += chunkText;
                        onChunk(fullText);
                    }
                }

                if (fullText) {
                    console.log(`[Gemini] ✅ Streaming success with model: ${modelName}`);
                    return fullText;
                }
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            console.warn(`[AI] ❌ Streaming with ${modelName} failed:`, err.message);
            lastError = err;
        }
    }

    throw lastError || new Error("Tất cả model đều thất bại khi streaming. Bạn có thể cần kiểm tra lại API Key.");
};
