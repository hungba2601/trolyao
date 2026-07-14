import React, { useState } from 'react';
import type { TeacherProfile } from '../types';
import { ExternalLink, Key, Sparkles, User } from 'lucide-react';

interface SetupModalProps {
    onSubmit: (geminiKey: string, groqKey: string, profile: TeacherProfile) => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onSubmit }) => {
    const [step, setStep] = useState(() => {
        const saved = localStorage.getItem('setup_draft_step');
        return saved ? parseInt(saved, 10) : 1;
    });
    
    const [activeProvider, setActiveProvider] = useState<'gemini' | 'groq'>('gemini');

    const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('setup_draft_gemini_key') || '');
    const [groqKey, setGroqKey] = useState(() => localStorage.getItem('setup_draft_groq_key') || '');

    const [name, setName] = useState(() => localStorage.getItem('setup_draft_name') || '');
    const [subject, setSubject] = useState(() => localStorage.getItem('setup_draft_subject') || 'Toán');
    const [schoolLevel, setSchoolLevel] = useState(() => localStorage.getItem('setup_draft_level') || 'THPT');
    const [schoolName, setSchoolName] = useState(() => localStorage.getItem('setup_draft_school') || '');

    // Persist drafts
    React.useEffect(() => {
        localStorage.setItem('setup_draft_step', step.toString());
        localStorage.setItem('setup_draft_gemini_key', geminiKey);
        localStorage.setItem('setup_draft_groq_key', groqKey);
        localStorage.setItem('setup_draft_name', name);
        localStorage.setItem('setup_draft_subject', subject);
        localStorage.setItem('setup_draft_level', schoolLevel);
        localStorage.setItem('setup_draft_school', schoolName);
    }, [step, geminiKey, groqKey, name, subject, schoolLevel, schoolName]);

    const clearDrafts = () => {
        localStorage.removeItem('setup_draft_step');
        localStorage.removeItem('setup_draft_gemini_key');
        localStorage.removeItem('setup_draft_groq_key');
        localStorage.removeItem('setup_draft_name');
        localStorage.removeItem('setup_draft_subject');
        localStorage.removeItem('setup_draft_level');
        localStorage.removeItem('setup_draft_school');
    };

    const handleNext = () => {
        if (step === 1) {
            if (!geminiKey && !groqKey) {
                alert('Vui lòng nhập ít nhất 1 API Key (Gemini hoặc Groq) để sử dụng app');
                return;
            }
            setStep(2);
        } else {
            if (name) {
                clearDrafts();
                onSubmit(geminiKey, groqKey, {
                    name,
                    subject,
                    school_level: schoolLevel,
                    school_name: schoolName
                });
            } else {
                alert('Vui lòng nhập tên của bạn');
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col animate-in zoom-in-95 duration-300 max-h-[95vh]">
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {step === 1 ? <Key size={28} className="text-teal-600" /> : <User size={28} className="text-teal-600" />}
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {step === 1 ? 'Thiết lập API Key' : '👤 Thông tin cá nhân'}
                        </h1>
                        <p className="text-gray-500">
                            {step === 1
                                ? 'Nhập API Key để kết nối với AI (chọn 1 trong 2)'
                                : 'Giúp AI hiểu rõ hơn về bạn để hỗ trợ tốt nhất'}
                        </p>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* === PROVIDER SELECTION === */}
                            <div>
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setActiveProvider('gemini')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeProvider === 'gemini' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        🤖 Gemini (Google)
                                    </button>
                                    <button
                                        onClick={() => setActiveProvider('groq')}
                                        className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${activeProvider === 'groq' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        ⚡ Groq
                                    </button>
                                </div>
                            </div>

                            {/* === KEY INPUT === */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                {activeProvider === 'gemini' ? (
                                    <>
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-700">🔑 Gemini API Key</span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <input
                                                    type="password"
                                                    value={geminiKey}
                                                    onChange={(e) => setGeminiKey(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                                    placeholder="AIza..."
                                                />
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-500">Dành cho model Gemini</p>
                                                    <a
                                                        href="https://aistudio.google.com/api-keys"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline font-medium"
                                                    >
                                                        <ExternalLink size={11} /> Lấy key Google AI
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-700">⚡ Groq API Key</span>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <input
                                                    type="password"
                                                    value={groqKey}
                                                    onChange={(e) => setGroqKey(e.target.value)}
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                    placeholder="gsk_..."
                                                />
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-500">Dành cho model Llama, Mixtral</p>
                                                    <a
                                                        href="https://console.groq.com/keys"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium"
                                                    >
                                                        <ExternalLink size={11} /> Lấy key Groq
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            {(!geminiKey && !groqKey) && (
                                <p className="text-xs text-center text-red-500 mt-2 font-medium">⚠️ Nhập ít nhất 1 API key để tiếp tục</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Môn dạy</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        {['Toán', 'Văn', 'Tiếng Anh', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Lịch Sử', 'Địa Lý', 'GDCD', 'Tin Học', 'Công Nghệ', 'Khác'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cấp học</label>
                                    <select
                                        value={schoolLevel}
                                        onChange={(e) => setSchoolLevel(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    >
                                        <option value="TieuHoc">Tiểu Học</option>
                                        <option value="THCS">THCS</option>
                                        <option value="THPT">THPT</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trường (tùy chọn)</label>
                                <input
                                    type="text"
                                    value={schoolName}
                                    onChange={(e) => setSchoolName(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    placeholder="THPT..."
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex flex-col gap-4">
                    <div className="flex justify-end gap-3">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Quay lại
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`px-6 py-2.5 text-white font-medium rounded-lg shadow-lg flex items-center gap-2 transition-colors ${step === 1 && activeProvider === 'groq' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-200'}`}
                        >
                            <Sparkles size={16} />
                            {step === 1 ? 'Tiếp theo' : 'Bắt đầu sử dụng'}
                        </button>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex justify-center gap-2">
                        <div className={`w-8 h-1 rounded-full transition-colors ${step === 1 ? 'bg-teal-600' : 'bg-gray-200'}`} />
                        <div className={`w-8 h-1 rounded-full transition-colors ${step === 2 ? 'bg-teal-600' : 'bg-gray-200'}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};
