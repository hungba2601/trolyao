import React, { useState } from 'react';
import { X, Copy, CheckCircle, Smartphone } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.origin;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-800">
            <Smartphone size={24} className="text-blue-500" />
            <h2 className="text-xl font-bold">Cài đặt ứng dụng</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-center gap-2 text-amber-600 font-medium text-sm mb-4">
            <span>⚠️</span>
            <span>Bạn đang mở trong trình duyệt nhúng</span>
          </div>
          
          <p className="text-center text-sm text-gray-600 mb-6 px-2">
            Trình duyệt này không hỗ trợ cài đặt trực tiếp. Vui lòng mở bằng <strong className="text-gray-800">Chrome</strong> hoặc <strong className="text-gray-800">Safari</strong> để cài app.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <label className="block text-xs font-medium text-gray-400 mb-2 text-center uppercase tracking-wider">
              Link ứng dụng:
            </label>
            <div className="bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl py-2.5 px-4 text-center select-all mb-3 overflow-x-auto whitespace-nowrap">
              {currentUrl}
            </div>
            
            <button
              onClick={handleCopyLink}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold transition-all ${
                copied ? 'bg-green-500 shadow-green-500/30' : 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30 shadow-lg'
              }`}
            >
              {copied ? (
                <>
                  <CheckCircle size={18} />
                  <span>Đã chép link</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span>📌</span> Cách cài đặt:
            </h3>
            <ol className="text-sm text-gray-600 space-y-3 pl-1">
              <li className="flex gap-2">
                <span className="font-medium text-gray-800">1.</span>
                <span>Nhấn "Copy Link" ở trên.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-800">2.</span>
                <span>Mở trình duyệt <strong>Chrome</strong> (Android) hoặc <strong>Safari</strong> (iPhone).</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-800">3.</span>
                <span>Dán link vào thanh địa chỉ và truy cập.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-800">4.</span>
                <span><strong>Android (Chrome):</strong> Nhấn menu 3 chấm ⋮ &rarr; "Thêm vào MH chính".</span>
              </li>
              <li className="flex gap-2">
                <span className="font-medium text-gray-800">5.</span>
                <span><strong>iPhone (Safari):</strong> Nhấn nút Chia sẻ (vuông mũi tên) &rarr; "Thêm vào MH chính".</span>
              </li>
            </ol>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaModal;
