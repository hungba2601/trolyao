
import React, { useState } from 'react';
import { X, ExternalLink, Search, Tag, Globe, Sparkles } from 'lucide-react';
import { RECOMMENDED_AI_TOOLS } from '../data/aiTools';

interface AIToolsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ToolIcon = ({ src, name }: { src?: string, name: string }) => {
    const [error, setError] = useState(false);

    if (error || !src || src.startsWith('/')) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-teal-50 text-teal-600">
                <Sparkles size={24} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name}
            className="w-full h-full object-contain"
            onError={() => setError(true)}
            referrerPolicy="no-referrer"
        />
    );
};

export const AIToolsModal: React.FC<AIToolsModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    if (!isOpen || !Array.isArray(RECOMMENDED_AI_TOOLS)) return null;

    const categories = Array.from(new Set(RECOMMENDED_AI_TOOLS.map(t => t.category))).filter(Boolean);

    const filteredTools = RECOMMENDED_AI_TOOLS.filter(tool => {
        if (!tool) return false;
        const name = tool.name || '';
        const desc = tool.description || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             desc.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || tool.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-200">
                            <Sparkles size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">Thư viện Công cụ AI</h2>
                            <p className="text-sm text-slate-500 font-medium">Khám phá các ứng dụng hỗ trợ giảng dạy & học tập tốt nhất</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="p-6 bg-slate-50/50 border-b border-slate-100 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors" size={20} />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm công cụ, tính năng..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all shadow-sm outline-none"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                            <button 
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                Tất cả
                            </button>
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
                    {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTools.map((tool) => (
                                <div 
                                    key={tool.id}
                                    className="group bg-white rounded-3xl border border-slate-100 p-5 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-14 h-14 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                            <ToolIcon src={tool.image_url} name={tool.name} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                                {tool.category}
                                            </span>
                                            {tool.is_pro && (
                                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1">
                                                    <Sparkles size={10} /> VIP
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                                        {tool.name}
                                    </h3>
                                    
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                                        {tool.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1.5 mb-6">
                                        {(tool.tags || []).map(tag => (
                                            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                                                <Tag size={8} /> {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <a 
                                        href={tool.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-teal-600 transition-all shadow-lg shadow-slate-200 hover:shadow-teal-200 group/btn"
                                    >
                                        Truy cập ngay
                                        <ExternalLink size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-20">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Search size={32} />
                            </div>
                            <p className="text-lg font-medium">Không tìm thấy công cụ nào phù hợp</p>
                            <button 
                                onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                className="mt-4 text-teal-600 font-bold hover:underline"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Globe size={14} />
                        <span>Tổng cộng {RECOMMENDED_AI_TOOLS.length} công cụ</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Cập nhật thường xuyên</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
