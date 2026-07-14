
import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Bot, User, Copy, ThumbsUp, ThumbsDown, Check, Star, RefreshCw } from 'lucide-react';
import type { ChatMessage } from '../types';
import { isBookmarked } from '../services/chatStorage';

interface MessageBubbleProps {
    message: ChatMessage;
    onBookmark?: (msg: ChatMessage) => void;
    onRegenerate?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onBookmark, onRegenerate }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const [starred, setStarred] = useState(() => isBookmarked(message.id));
    const [activeVersion, setActiveVersion] = useState(-1); // -1 = current

    const allVersions = useMemo(() => {
        const vs = (message.versions || []).map((v, i) => ({ text: v.text, label: `v${i + 1}`, timestamp: v.timestamp }));
        vs.push({ text: message.text, label: `v${vs.length + 1}`, timestamp: message.timestamp });
        return vs;
    }, [message.text, message.versions, message.timestamp]);

    const displayText = activeVersion >= 0 && activeVersion < allVersions.length
        ? allVersions[activeVersion].text
        : message.text;
    const hasVersions = allVersions.length > 1;

    const handleCopy = () => {
        // Copy raw text (keeps LaTeX formulas as-is)
        navigator.clipboard.writeText(message.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStar = () => {
        if (onBookmark) {
            onBookmark(message);
            setStarred(true);
        }
    };

    return (
        <div className={`flex gap-2 sm:gap-3 px-1 sm:px-4 py-3 sm:py-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm mt-1 ${isUser
                ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                }`}>
                {isUser ? <User size={18} strokeWidth={2.5} /> : <Bot size={18} strokeWidth={2.5} />}
            </div>

            {/* Content Container */}
            <div className={`flex flex-col min-w-0 flex-1 max-w-[92%] sm:max-w-3xl ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Header */}
                <div className={`flex items-center gap-2 mb-1.5 px-1 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-sm font-bold ${isUser ? 'text-teal-900' : 'text-slate-900'}`}>
                        {isUser ? 'Thầy/Cô chính' : 'Trợ lý AI'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Version navigation */}
                {hasVersions && !isUser && (
                    <div className="flex items-center gap-1 mb-2 px-1">
                        <span className="text-[10px] font-medium text-gray-400 mr-1">Phiên bản:</span>
                        {allVersions.map((v, i) => {
                            const isCurrent = (activeVersion === -1 && i === allVersions.length - 1) || activeVersion === i;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setActiveVersion(i === allVersions.length - 1 ? -1 : i)}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${isCurrent
                                            ? 'bg-teal-600 text-white shadow-sm'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {v.label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Bubble Box */}
                <div className={`
                    p-3.5 sm:p-5 rounded-2xl shadow-sm border border-slate-100/50 relative w-full
                    ${isUser ? 'bg-teal-50 rounded-tr-sm' : 'bg-white rounded-tl-sm'}
                `}>
                    <div className={`prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed overflow-x-auto break-words ${isUser ? 'whitespace-pre-wrap font-medium text-slate-800' : ''
                        }`}>
                        {isUser ? (
                            message.text
                        ) : (
                            <ReactMarkdown
                                remarkPlugins={[remarkMath, remarkGfm]}
                                rehypePlugins={[[rehypeKatex, { strict: false }]]}
                                components={{
                                    h1: ({ ...props }) => <h1 className="text-xl font-extrabold text-slate-900 mt-6 mb-4 tracking-tight" {...props} />,
                                    h2: ({ ...props }) => <h2 className="text-lg font-bold text-slate-800 mt-5 mb-3 border-b border-slate-100 pb-1" {...props} />,
                                    h3: ({ ...props }) => <h3 className="text-base font-bold text-slate-800 mt-4 mb-2 text-teal-700" {...props} />,
                                    ul: ({ ...props }) => <ul className="list-disc list-outside ml-4 mb-4 space-y-1.5 marker:text-teal-400" {...props} />,
                                    ol: ({ ...props }) => <ol className="list-decimal list-outside ml-4 mb-4 space-y-1.5 marker:text-teal-700 marker:font-semibold" {...props} />,
                                    li: ({ ...props }) => <li className="mb-1 pl-1" {...props} />,
                                    p: ({ ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                    strong: ({ ...props }) => <strong className="font-bold text-slate-900" {...props} />,
                                    table: ({ ...props }) => (
                                        <div className="overflow-x-auto my-5 rounded-xl border border-slate-200 shadow-sm">
                                            <table className="min-w-full divide-y divide-slate-200 text-sm" {...props} />
                                        </div>
                                    ),
                                    thead: ({ ...props }) => <thead className="bg-slate-50 text-slate-700" {...props} />,
                                    tbody: ({ ...props }) => <tbody className="bg-white divide-y divide-slate-100" {...props} />,
                                    tr: ({ ...props }) => <tr className="hover:bg-teal-50/30 transition-colors" {...props} />,
                                    th: ({ ...props }) => (
                                        <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase tracking-wider whitespace-nowrap" {...props} />
                                    ),
                                    td: ({ ...props }) => (
                                        <td className="px-4 py-3 text-slate-600 border-b border-slate-50 last:border-0" {...props} />
                                    ),
                                    code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
                                        return !inline ? (
                                            <div className="relative group/code my-4 w-full">
                                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                                                </div>
                                                <div className="bg-[#1e1e1e] rounded-xl p-0 overflow-hidden shadow-lg border border-slate-800">
                                                    <div className="px-4 py-2 bg-[#2d2d2d] border-b border-slate-700 text-xs text-slate-400 font-mono flex items-center justify-between">
                                                        <span>Code snippet</span>
                                                    </div>
                                                    <div className="p-4 overflow-x-auto w-full max-w-[80vw] sm:max-w-full">
                                                        <code className={`!bg-transparent text-sm font-mono text-blue-300 ${className}`} {...props}>
                                                            {children}
                                                        </code>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <code className="bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded-md text-sm font-mono border border-teal-100/50 whitespace-pre-wrap break-words" {...props}>
                                                {children}
                                            </code>
                                        )
                                    },
                                    blockquote: ({ ...props }) => <blockquote className="border-l-4 border-teal-400 pl-4 py-2 my-4 italic text-slate-600 bg-slate-50 rounded-r-lg" {...props} />,
                                    a: ({ ...props }) => <a className="text-teal-600 hover:text-teal-800 hover:underline font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                    hr: ({ ...props }) => <hr className="my-6 border-slate-100" {...props} />,
                                }}
                            >
                                {displayText}
                            </ReactMarkdown>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {!isUser && (
                    <div className="flex items-center gap-2 pt-2 px-1 transition-opacity duration-200">
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white shadow-sm border border-slate-200 hover:text-teal-600 hover:border-teal-200 transition-all"
                            title="Sao chép (giữ nguyên LaTeX)"
                        >
                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
                        </button>
                        <button
                            onClick={handleStar}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border border-transparent ${starred
                                    ? 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-100'
                                    : 'text-slate-500 hover:bg-white hover:text-amber-500 hover:shadow-sm hover:border-slate-200'
                                }`}
                            title="Ghim tin nhắn"
                        >
                            <Star size={14} fill={starred ? 'currentColor' : 'none'} />
                            <span className="hidden sm:inline">{starred ? 'Đã ghim' : 'Ghim'}</span>
                        </button>
                        {onRegenerate && (
                            <button
                                onClick={() => onRegenerate(message.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-white hover:text-cyan-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                                title="Tạo lại câu trả lời"
                            >
                                <RefreshCw size={14} />
                                <span className="hidden sm:inline">Tạo lại</span>
                            </button>
                        )}
                        <div className="flex-1" />
                        <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                                <ThumbsUp size={15} />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors">
                                <ThumbsDown size={15} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
