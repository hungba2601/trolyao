import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Check } from 'lucide-react';
import { getAvailableModels, getSelectedModel, setSelectedModel, isGroqModel } from '../services/ai';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (geminiKey: string, groqKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
    const [geminiKey, setGeminiKey] = useState(() => {
        const draft = localStorage.getItem('settings_draft_gemini_key');
        if (draft !== null) return draft;
        return localStorage.getItem('gemini_api_key') || '';
    });
    const [groqKey, setGroqKey] = useState(() => {
        const draft = localStorage.getItem('settings_draft_groq_key');
        if (draft !== null) return draft;
        return localStorage.getItem('groq_api_key') || '';
    });
    
    const [currentModel, setCurrentModel] = useState(getSelectedModel());
    
    const [activeProvider, setActiveProvider] = useState<'gemini' | 'groq'>(() => {
        return isGroqModel(getSelectedModel()) ? 'groq' : 'gemini';
    });

    // Persist drafts
    useEffect(() => {
        localStorage.setItem('settings_draft_gemini_key', geminiKey);
        localStorage.setItem('settings_draft_groq_key', groqKey);
    }, [geminiKey, groqKey]);

    const clearDrafts = () => {
        localStorage.removeItem('settings_draft_gemini_key');
        localStorage.removeItem('settings_draft_groq_key');
    };

    if (!isOpen) return null;

    const handleSave = () => {
        clearDrafts();
        onSave(geminiKey, groqKey);
        onClose();
    };

    const handleClose = () => {
        clearDrafts();
        onClose();
    };

    const handleModelSelect = (model: string) => {
        setSelectedModel(model);
        setCurrentModel(model);
    };

    const allModels = getAvailableModels();
    const filteredModels = allModels.filter(m => activeProvider === 'groq' ? isGroqModel(m) : !isGroqModel(m));

    const getModelInfo = (model: string) => {
        if (isGroqModel(model)) {
            let label = model;
            let desc = 'Mô hình siêu nhanh từ Groq';
            let badge = 'Groq';
            let color = 'purple';
            
            if (model === 'llama-3.3-70b-versatile') {
                label = 'Llama 3.3 70B';
                desc = 'Thông minh nhất, mạnh ngang các mô hình trả phí lớn';
            } else if (model === 'llama-3.1-8b-instant') {
                label = 'Llama 3.1 8B';
                desc = 'Siêu nhẹ và cực kỳ nhanh, phù hợp chat thông thường';
            } else if (model === 'mixtral-8x7b-32768') {
                label = 'Mixtral 8x7B';
                desc = 'Xử lý đa ngôn ngữ tốt và khả năng lập luận mạnh mẽ';
            } else if (model === 'gemma2-9b-it') {
                label = 'Gemma 2 9B';
                desc = 'Mô hình hiệu suất cao do chính Google phát triển';
            }
            return { label, desc, badge, color };
        }

        switch (model) {
            case 'gemini-3.5-flash':
                return { label: '3.5 Flash', desc: 'Mới nhất, cực kỳ thông minh và nhanh', badge: 'Mới', color: 'teal' };
            case 'gemini-2.5-flash':
                return { label: '2.5 Flash', desc: 'Ổn định, model mặc định tin cậy', badge: 'Stable', color: 'emerald' };
            default:
                return { label: model, desc: '', badge: '', color: 'gray' };
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">⚙️ Cài đặt</h2>
                    <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar">

                    {/* === PROVIDER SELECTION === */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">🛠️ Chọn Nền tảng AI</h3>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => {
                                    setActiveProvider('groq');
                                    if (!isGroqModel(currentModel)) {
                                        handleModelSelect('llama-3.1-8b-instant');
                                    }
                                }}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeProvider === 'groq' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ⚡ Groq
                            </button>
                            <button
                                onClick={() => {
                                    setActiveProvider('gemini');
                                    if (isGroqModel(currentModel)) {
                                        handleModelSelect('gemini-2.5-flash');
                                    }
                                }}
                                className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeProvider === 'gemini' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                🤖 Gemini (Google)
                            </button>
                        </div>
                    </div>

                    {/* === MODEL SELECTION === */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">🤖 Chọn Model ({activeProvider === 'gemini' ? 'Gemini' : 'Groq'})</h3>
                        <div className="space-y-2">
                            {filteredModels.map(model => {
                                const info = getModelInfo(model);
                                const isActive = currentModel === model;
                                const activeColor = activeProvider === 'gemini' ? 'teal' : 'purple';
                                
                                return (
                                    <button
                                        key={model}
                                        onClick={() => handleModelSelect(model)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${isActive
                                            ? `border-${activeColor}-500 bg-${activeColor}-50`
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? `bg-${activeColor}-600` : 'bg-gray-200'
                                            }`}>
                                            {isActive ? <Check size={16} className="text-white" /> : <div className="w-3 h-3 rounded-full bg-gray-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 text-sm">{info.label}</span>
                                                {info.badge && (
                                                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                                                            info.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                                            info.color === 'teal' ? 'bg-teal-100 text-teal-700' :
                                                            info.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                                                            info.color === 'purple' ? 'bg-purple-100 text-purple-700' :
                                                            'bg-blue-100 text-blue-700'
                                                        }`}>{info.badge}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* === API KEY === */}
                    <div className="pt-4 border-t border-gray-100">
                        {activeProvider === 'gemini' ? (
                            <>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">🔑 Gemini API Key</h3>
                                <input
                                    type="password"
                                    value={geminiKey}
                                    onChange={(e) => setGeminiKey(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="AIza..."
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500 font-medium">Bắt buộc nếu dùng model Gemini</p>
                                    <a
                                        href="https://aistudio.google.com/api-keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline font-medium"
                                    >
                                        <ExternalLink size={11} /> Lấy Gemini Key
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">⚡ Groq API Key</h3>
                                <input
                                    type="password"
                                    value={groqKey}
                                    onChange={(e) => setGroqKey(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="gsk_..."
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500 font-medium">Bắt buộc nếu dùng model Groq</p>
                                    <a
                                        href="https://console.groq.com/keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium"
                                    >
                                        <ExternalLink size={11} /> Lấy Groq Key
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-5 py-2 text-white font-medium rounded-lg transition-colors ${activeProvider === 'gemini' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
};
