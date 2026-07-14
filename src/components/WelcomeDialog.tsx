
import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface WelcomeDialogProps {
  onStart: () => void;
}

export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#1e293b] rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
      >
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles size={40} className="text-teal-400" />
          </div>
          
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            TRỢ LÝ ẢO AI
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Hệ thống hỗ trợ giáo dục thông minh tích hợp trí tuệ nhân tạo
          </p>

          <button
            onClick={onStart}
            className="group relative w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:shadow-[0_0_30px_rgba(13,148,136,0.5)] active:scale-[0.98] flex items-center justify-center gap-2 overflow-hidden"
          >
            <Sparkles size={20} className="group-hover:animate-pulse" />
            <span>BẮT ĐẦU</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>

          <div className="mt-8 pt-6 border-t border-white/5 w-full">
            <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">
              Made by Nguyễn Phi Hùng
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
};
