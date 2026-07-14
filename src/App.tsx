
import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SetupModal } from './components/SetupModal';
import { SettingsModal } from './components/SettingsModal';
import { DocumentManager } from './components/DocumentManager';
import { PromptTemplatePanel } from './components/PromptTemplatePanel';
import { DashboardModal } from './components/DashboardModal';
import { AIToolsModal } from './components/AIToolsModal';
import { OnboardingTour } from './components/OnboardingTour';
import { WelcomeDialog } from './components/WelcomeDialog';
import { setApiKeys, generateResponseStream, getGeminiApiKey, getGroqApiKey, getAvailableModels, getSelectedModel, setSelectedModel } from './services/ai';
import { getTeacherProfile, saveTeacherProfile as saveProfileService } from './services/profile';
import { buildDocumentContext } from './services/documents';
import { initDarkMode, toggleDarkMode, isDarkMode } from './services/darkMode';
import {
  getSessions, saveSessions, deleteSession, renameSession,
  getMessages, saveMessages, generateTitle,
  getBookmarks, saveBookmark, removeBookmark,
  autoDetectTags, updateSessionFolder,
  shouldShowOnboarding,
} from './services/chatStorage';
import { downloadMarkdown, downloadWord, downloadPdf } from './services/exportChat';
import type { TeacherProfile, ChatSession, ChatMessage } from './types';
import { Menu, Settings, Key, Cpu, FileText, Download, Plus, Moon, Sun, Globe, Smartphone } from 'lucide-react';
import InstallPwaModal from './components/InstallPwaModal';



// AI language options
const AI_LANGUAGES: { code: string; label: string; flag: string }[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

// System Prompt Construction
const constructSystemPrompt = (profile: TeacherProfile, hasDocuments: boolean, aiLang: string = 'vi') => {
  const langInstruction = aiLang !== 'vi'
    ? `\n\n## NGÔN NGỮ TRẢ LỜI\nHãy trả lời TOÀN BỘ bằng ${AI_LANGUAGES.find(l => l.code === aiLang)?.label || aiLang}. Dù user hỏi bằng tiếng Việt, bạn vẫn phải trả lời bằng ${AI_LANGUAGES.find(l => l.code === aiLang)?.label || aiLang}.`
    : '';

  return `Bạn là trợ lý AI thông minh và toàn diện dành cho giáo viên Việt Nam.

## VAI TRÒ
Bạn là một chuyên gia giáo dục, có thể:
- Hỗ trợ soạn giáo án, bài giảng, đề kiểm tra
- Tư vấn phương pháp giảng dạy hiện đại
- Phân tích, tóm tắt, giải thích tài liệu giáo dục
- Trả lời câu hỏi chuyên môn liên quan đến việc dạy và học

## NGUYÊN TẮC QUAN TRỌNG
1. **Thực tế**: Đề xuất giải pháp thực tế, dễ áp dụng cho giáo viên Việt Nam.
2. **Cập nhật**: Ưu tiên kiến thức mới nhất về giáo dục, chương trình 2018, công nghệ giáo dục.
3. **Linh hoạt**: Nếu giáo viên đã upload tài liệu, hãy tham khảo và sử dụng nội dung đó một cách thông minh khi câu hỏi liên quan.
${hasDocuments ? '4. **Tài liệu**: Giáo viên đã cung cấp tài liệu tham khảo bên dưới. Hãy SỬ DỤNG LINH HOẠT nội dung này khi trả lời - trích dẫn, phân tích, tóm tắt theo yêu cầu.' : ''}${langInstruction}

## PROFILE GIÁO VIÊN
- Tên: ${profile.name}
- Môn: ${profile.subject}
- Cấp: ${profile.school_level}
${profile.school_name ? `- Trường: ${profile.school_name}` : ''}

## ĐỊNH DẠNG TRẢ LỜI
- Trả lời thẳng vào câu hỏi của người dùng, KHÔNG TỰ ĐỘNG GỢI Ý CÔNG CỤ HOẶC TRANG WEB trừ khi người dùng yêu cầu rõ ràng.
- Sử dụng Markdown đẹp mắt (heading, bullet, bold, code block)
- Trả lời bằng tiếng Việt thân thiện, chuyên nghiệp, dễ hiểu`;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModelState] = useState(getSelectedModel());
  const [showDocManager, setShowDocManager] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showAITools, setShowAITools] = useState(false);
  const [pendingInput, setPendingInput] = useState('');
  const [templateCategory, setTemplateCategory] = useState('');
  const [folderFilter, setFolderFilter] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [darkMode, setDarkModeState] = useState(isDarkMode());
  const [aiLanguage, setAiLanguage] = useState(() => localStorage.getItem('ai_language') || 'vi');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize dark mode on mount
  useEffect(() => {
    initDarkMode();
    // Show onboarding for first-time users
    if (shouldShowOnboarding()) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallModal(true);
    }
  };

  const handleNewChat = useCallback(() => {
    // Save current chat before switching
    if (currentChatId && messages.length > 0) {
      saveMessages(currentChatId, messages);
    }
    const newId = Date.now().toString();
    const newSession: ChatSession = { id: newId, title: 'Cuộc trò chuyện mới', created_at: new Date().toISOString(), selectedDocIds: [] };
    setChatHistory(prev => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });
    setCurrentChatId(newId);
    setMessages([]);
    setSelectedDocIds([]);
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [currentChatId, messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N = new chat
      if (e.ctrlKey && e.key === 'n') { e.preventDefault(); handleNewChat(); }
      // Ctrl+K = focus search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('aside input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
      // Ctrl+/ = open templates
      if (e.ctrlKey && e.key === '/') { e.preventDefault(); setShowTemplatePanel(true); }
      // Ctrl+D = toggle dark mode
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        const newState = toggleDarkMode();
        setDarkModeState(newState);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  // Load saved sessions on mount
  useEffect(() => {
    const geminiKey = getGeminiApiKey();
    const groqKey = getGroqApiKey();
    const userProfile = getTeacherProfile();

    if (!geminiKey && !groqKey) {
      setShowSetup(true);
    } else if (userProfile) {
      setProfile(userProfile);

      // Load persisted sessions
      const savedSessions = getSessions();
      if (savedSessions.length > 0) {
        setChatHistory(savedSessions);
        const lastId = savedSessions[0].id;
        setCurrentChatId(lastId);
        setMessages(getMessages(lastId));
        setSelectedDocIds(savedSessions[0].selectedDocIds || []);
      } else {
        // First time — create initial chat
        const initId = Date.now().toString();
        const initSession: ChatSession = { id: initId, title: 'Chào mừng', created_at: new Date().toISOString() };
        const welcomeMsg: ChatMessage = {
          id: 'welcome', role: 'model',
          text: `Chào thầy/cô ${userProfile.name}! Tôi có thể giúp gì cho thầy/cô hôm nay?`,
          timestamp: new Date().toISOString(),
        };
        setChatHistory([initSession]);
        setCurrentChatId(initId);
        setMessages([welcomeMsg]);
        saveSessions([initSession]);
        saveMessages(initId, [welcomeMsg]);
      }
    }
    setLoading(false);
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      saveMessages(currentChatId, messages);
    }
  }, [messages, currentChatId]);

  // Save selected docs to current session whenever they change
  useEffect(() => {
    if (!currentChatId || chatHistory.length === 0) return;

    setChatHistory(prev => {
      const session = prev.find(s => s.id === currentChatId);
      if (!session) return prev;

      const currentDocs = session.selectedDocIds || [];
      const isSameLength = currentDocs.length === selectedDocIds.length;
      const isSameContent = isSameLength && currentDocs.every(id => selectedDocIds.includes(id));

      if (isSameContent) return prev;

      const updated = prev.map(s =>
        s.id === currentChatId ? { ...s, selectedDocIds } : s
      );
      saveSessions(updated);
      return updated;
    });
  }, [selectedDocIds, currentChatId, chatHistory.length]);

  const handleSetupComplete = (geminiKey: string, groqKey: string, newProfile: TeacherProfile, selectedModel: string) => {
    setApiKeys(geminiKey, groqKey);
    setSelectedModel(selectedModel);
    setSelectedModelState(selectedModel);
    saveProfileService(newProfile);
    setProfile(newProfile);
    setShowSetup(false);

    const initId = Date.now().toString();
    const initSession: ChatSession = { id: initId, title: 'Cuộc trò chuyện mới', created_at: new Date().toISOString() };
    const welcomeMsg: ChatMessage = {
      id: 'welcome_setup', role: 'model',
      text: `Chào ${newProfile.name}! Hệ thống đã sẵn sàng. 🎉`,
      timestamp: new Date().toISOString(),
    };
    setChatHistory([initSession]);
    setCurrentChatId(initId);
    setMessages([welcomeMsg]);
    saveSessions([initSession]);
    saveMessages(initId, [welcomeMsg]);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setSelectedModelState(model);
  };

  const handleSendMessage = async (text: string) => {
    if (!profile || !currentChatId) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);

    // Auto-title: if this is the first user message, update title
    const isFirstUserMsg = messages.filter(m => m.role === 'user').length === 0;
    if (isFirstUserMsg) {
      const newTitle = generateTitle(text);
      const tags = autoDetectTags(text);
      setChatHistory(prev => {
        const updated = prev.map(s => s.id === currentChatId ? { ...s, title: newTitle, tags } : s);
        saveSessions(updated);
        return updated;
      });
    }

    try {
      const docContext = await buildDocumentContext(selectedDocIds);
      const systemPrompt = constructSystemPrompt(profile, selectedDocIds.length > 0, aiLanguage) + docContext;

      const historyForGemini = [
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text }] }
      ];

      const botMsgId = (Date.now() + 1).toString();
      const botMessage: ChatMessage = {
        id: botMsgId,
        role: 'model',
        text: '',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);

      await generateResponseStream(historyForGemini, systemPrompt, (chunkText) => {
        setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: chunkText } : m));
      });
    } catch (error: unknown) {
      console.error(error);
      const errDetail = error instanceof Error ? error.message : 'Lỗi không xác định';
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `**⚠️ Lỗi:** ${errDetail}\n\nVui lòng kiểm tra:\n- API Key có đúng không?\n- Kết nối mạng có ổn không?\n- API Key đã hết quota chưa?\n\n👉 Nhấn nút **Settings (API Key)** trên Header để cập nhật.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectChat = useCallback((id: string) => {
    // Save current messages before switching
    if (currentChatId && messages.length > 0) {
      saveMessages(currentChatId, messages);
    }
    const session = chatHistory.find(s => s.id === id);
    if (session) {
      setSelectedDocIds(session.selectedDocIds || []);
    }
    setCurrentChatId(id);
    setMessages(getMessages(id));
    setSidebarOpen(false);
  }, [currentChatId, messages, chatHistory]);

  const handleDeleteChat = useCallback((id: string) => {
    deleteSession(id);
    setChatHistory(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveSessions(updated);
      if (id === currentChatId) {
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id);
          setMessages(getMessages(updated[0].id));
        } else {
          handleNewChat();
        }
      }
      return updated;
    });
  }, [currentChatId, handleNewChat]);

  const handleRenameChat = useCallback((id: string, newTitle: string) => {
    renameSession(id, newTitle);
    setChatHistory(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, title: newTitle } : s);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const handleBookmarkMessage = useCallback((msg: ChatMessage) => {
    const session = chatHistory.find(s => s.id === currentChatId);
    saveBookmark(currentChatId || '', session?.title || '', msg);
  }, [currentChatId, chatHistory]);

  const handleRemoveBookmark = useCallback((messageId: string) => {
    removeBookmark(messageId);
  }, []);

  const handleMoveToFolder = useCallback((chatId: string, folder: string) => {
    updateSessionFolder(chatId, folder || undefined);
    setChatHistory(prev => {
      const updated = prev.map(s => s.id === chatId ? { ...s, folder: folder || undefined } : s);
      saveSessions(updated);
      return updated;
    });
  }, []);

  const handleRegenerate = useCallback(async (messageId: string) => {
    // Find the AI message and the user message before it
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex < 0 || messages[msgIndex].role !== 'model') return;

    // Find the last user message before this AI response
    let userText = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') { userText = messages[i].text; break; }
    }
    if (!userText) return;

    setIsTyping(true);
    try {
      const docContext = await buildDocumentContext(selectedDocIds);
      const systemPrompt = constructSystemPrompt(profile || { name: 'Giáo viên', subject: '', school_level: '' }, selectedDocIds.length > 0, aiLanguage) + docContext;

      // Build history in Gemini format
      const historyForGemini = [
        ...messages.slice(0, msgIndex).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      ];

      // The last message in history for regeneration should be the user message that triggered the response
      // We already found it as userText
      if (historyForGemini.length > 0 && historyForGemini[historyForGemini.length - 1].role !== 'user') {
          // This shouldn't happen if the sequence is correct, but let's be safe
      }

      // Clear current message text and start streaming
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          const versions = m.versions || [];
          versions.push({ text: m.text, timestamp: m.timestamp });
          return { ...m, text: '', timestamp: new Date().toISOString(), versions };
        }
        return m;
      }));

      await generateResponseStream(historyForGemini, systemPrompt, (chunkText) => {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: chunkText } : m));
      });
    } catch (error: unknown) {
      console.error('Regenerate failed:', error);
    } finally {
      setIsTyping(false);
    }
  }, [messages, profile, selectedDocIds, aiLanguage]);

  // Export handlers
  const handleExportMarkdown = () => {
    const session = chatHistory.find(s => s.id === currentChatId);
    downloadMarkdown(session?.title || 'chat', messages);
    setShowExportMenu(false);
  };

  const handleExportWord = async () => {
    const session = chatHistory.find(s => s.id === currentChatId);
    await downloadWord(session?.title || 'chat', messages);
    setShowExportMenu(false);
  };

  // Chat pin handler
  const handleTogglePin = useCallback((chatId: string) => {
    setChatHistory(prev => {
      const updated = prev.map(s => s.id === chatId ? { ...s, pinned: !s.pinned } : s);
      saveSessions(updated);
      return updated;
    });
  }, []);

  // Export PDF handler
  const handleExportPdf = () => {
    const session = chatHistory.find(s => s.id === currentChatId);
    downloadPdf(session?.title || 'chat', messages);
    setShowExportMenu(false);
  };

  // Dark mode toggle handler
  const handleToggleDark = () => {
    const newState = toggleDarkMode();
    setDarkModeState(newState);
  };

  // AI language change handler
  const handleAiLanguageChange = (code: string) => {
    setAiLanguage(code);
    localStorage.setItem('ai_language', code);
    setShowLangMenu(false);
  };

  // Filtered chat history for search + folder, pinned first
  const filteredHistory = chatHistory
    .filter(s => {
      const matchSearch = !searchQuery.trim() || s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFolder = !folderFilter || s.folder === folderFilter;
      return matchSearch && matchFolder;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });

  if (loading) return <div className="h-[100dvh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>;

  return (
    <div className="flex flex-col h-[100dvh] bg-gray-50 overflow-hidden app-wrapper">
      {showWelcome && <WelcomeDialog onStart={() => setShowWelcome(false)} />}

      {/* === PERSISTENT HEADER === */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-2 sm:px-4 gap-1.5 sm:gap-3 shrink-0 z-30">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 sm:p-2 sm:-ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden shrink-0">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Cpu size={20} className="text-teal-600" />
          <span className="font-bold text-gray-900 text-sm sm:text-base hidden sm:inline whitespace-nowrap">Trợ lý GV</span>
        </div>

        {/* New Chat Button - Always visible */}
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-xs font-medium shadow-sm active:scale-95 shrink-0"
          title="Tạo phiên trò chuyện mới"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Mới</span>
        </button>

        {/* Model Selector */}
        {getAvailableModels().length > 0 && (
          <div className="flex items-center ml-0.5 sm:ml-2 shrink-0">
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-medium rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full py-1.5 px-1.5 sm:px-2 outline-none max-w-[120px] sm:max-w-[180px] truncate shadow-sm cursor-pointer"
            >
              {getAvailableModels().map(model => {
                let displayName = model;
                if (model.includes('gemini')) {
                  displayName = model.replace('gemini-', 'Gemini ').replace('-preview', '');
                } else if (model.includes('llama')) {
                  displayName = model.replace('llama-', 'Llama ').replace('-versatile', '').replace('-instant', '');
                } else if (model.includes('mixtral')) {
                  displayName = 'Mixtral 8x7B';
                } else if (model.includes('gemma')) {
                  displayName = 'Gemma 2 9B';
                }
                return (
                  <option key={model} value={model}>
                    {displayName}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="flex-1" />

        {/* Export Button */}
        {messages.length > 0 && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition-colors text-xs font-medium"
              title="Tải xuống nội dung"
            >
              <Download size={16} />
              <span className="hidden lg:inline">Tải xuống</span>
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-52 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={handleExportMarkdown}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-lg">📝</span>
                    <div>
                      <div className="font-medium text-gray-900">Markdown (.md)</div>
                      <div className="text-xs text-gray-500">Dạng văn bản thuần</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportWord}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-lg">📄</span>
                    <div>
                      <div className="font-medium text-gray-900">Word (.docx)</div>
                      <div className="text-xs text-gray-500">Có định dạng đẹp</div>
                    </div>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <span className="text-lg">🖨️</span>
                    <div>
                      <div className="font-medium text-gray-900">PDF (.pdf)</div>
                      <div className="text-xs text-gray-500">In / Lưu PDF</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* AI Language Selector */}
        <div className="relative hidden sm:block shrink-0">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-xs font-medium"
            title="Ngôn ngữ AI trả lời"
          >
            <Globe size={14} />
            {AI_LANGUAGES.find(l => l.code === aiLanguage)?.flag}
          </button>
          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-44 py-1">
                {AI_LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleAiLanguageChange(lang.code)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${aiLanguage === lang.code ? 'bg-purple-50 text-purple-700 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <span>{lang.flag}</span>
                    {lang.label}
                    {aiLanguage === lang.code && <span className="ml-auto text-purple-500">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Documents Button */}
        <button
          onClick={() => setShowDocManager(true)}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors text-xs font-medium shrink-0 relative"
          title="Quản lý Tài liệu"
        >
          <FileText size={16} />
          <span className="hidden lg:inline">Tài liệu</span>
          {selectedDocIds.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 sm:static sm:top-auto sm:right-auto bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
              {selectedDocIds.length}
            </span>
          )}
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={handleToggleDark}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 shrink-0 hidden sm:block"
          title={darkMode ? 'Chế độ sáng (Ctrl+D)' : 'Chế độ tối (Ctrl+D)'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Install App Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors shrink-0"
          title="Cài đặt ứng dụng"
        >
          <Smartphone size={16} />
          <span className="text-xs font-medium hidden sm:inline whitespace-nowrap">Cài App</span>
        </button>

        {/* Settings / API Key Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group shrink-0"
          title="Cài đặt hệ thống"
        >
          <Key size={16} className={`${(!getGeminiApiKey() && !getGroqApiKey()) ? 'text-red-500 animate-pulse' : 'text-gray-500 group-hover:text-teal-600'}`} />
          {(!getGeminiApiKey() && !getGroqApiKey()) && (
            <span className="text-xs font-medium text-red-500 hidden sm:inline whitespace-nowrap">Lấy API key</span>
          )}
          <Settings size={16} className="text-gray-400 hidden sm:block" />
        </button>
      </header>

      {/* === MAIN LAYOUT === */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex w-80 shrink-0 h-full">
          <Sidebar
            profile={profile}
            history={filteredHistory}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            onOpenSettings={() => setShowSettings(true)}
            onShowAITools={() => setShowAITools(true)}
            onRenameChat={handleRenameChat}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onShowBookmarks={() => setShowBookmarks(true)}
            onShowDashboard={() => setShowDashboard(true)}
            folderFilter={folderFilter}
            onFolderFilterChange={setFolderFilter}
            onMoveToFolder={handleMoveToFolder}
            onTogglePin={handleTogglePin}
          />
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out">
            <Sidebar
              profile={profile}
              history={filteredHistory}
              currentChatId={currentChatId}
              onNewChat={() => {
                handleNewChat();
                setSidebarOpen(false);
              }}
              onSelectChat={(id) => {
                handleSelectChat(id);
                setSidebarOpen(false);
              }}
              onDeleteChat={handleDeleteChat}
              onOpenSettings={() => {
                setShowSettings(true);
                setSidebarOpen(false);
              }}
              onShowAITools={() => {
                setShowAITools(true);
                setSidebarOpen(false);
              }}
              onRenameChat={handleRenameChat}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onShowBookmarks={() => {
                setShowBookmarks(true);
                setSidebarOpen(false);
              }}
              onShowDashboard={() => {
                setShowDashboard(true);
                setSidebarOpen(false);
              }}
              folderFilter={folderFilter}
              onFolderFilterChange={setFolderFilter}
              onMoveToFolder={handleMoveToFolder}
              onTogglePin={handleTogglePin}
            />
          </div>
        )}

        <main className="flex-1 flex flex-col relative w-full h-full bg-white shadow-2xl z-0 overflow-hidden">
          <div className="flex-1 min-h-0 relative h-full">
            <ChatArea
              messages={messages}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              userName={profile?.name || ''}
              onBookmark={handleBookmarkMessage}
              onOpenTemplates={() => { setTemplateCategory(''); setShowTemplatePanel(true); }}
              onOpenTemplatesWithCategory={(cat) => { setTemplateCategory(cat); setShowTemplatePanel(true); }}
              pendingInput={pendingInput}
              onPendingInputConsumed={() => setPendingInput('')}
              onRegenerate={handleRegenerate}
            />
          </div>
        </main>
      </div>

      {/* === MODALS === */}
      {showSetup && (
        <>
          <div className="fixed inset-0 z-50 bg-white" />
          <SetupModal onSubmit={handleSetupComplete} />
        </>
      )}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={(geminiKey, groqKey) => {
            setApiKeys(geminiKey, groqKey);
          }}
        />
      )}

      <DocumentManager
        isOpen={showDocManager}
        onClose={() => setShowDocManager(false)}
        selectedDocIds={selectedDocIds}
        onSelectionChange={setSelectedDocIds}
      />

      <PromptTemplatePanel
        isOpen={showTemplatePanel}
        onClose={() => setShowTemplatePanel(false)}
        initialCategory={templateCategory}
        onSelectTemplate={(prompt) => {
          setShowTemplatePanel(false);
          setPendingInput(prompt);
        }}
      />

      <DashboardModal
        isOpen={showDashboard}
        onClose={() => setShowDashboard(false)}
      />

      {/* Bookmarks Modal */}
      {showBookmarks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBookmarks(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">⭐ Tin nhắn đã lưu</h2>
              <button onClick={() => setShowBookmarks(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <span className="text-gray-500 text-xl">✕</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {getBookmarks().length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📌</p>
                  <p>Chưa có tin nhắn nào được ghim.</p>
                  <p className="text-sm mt-1">Nhấn nút ⭐ trên tin nhắn AI để ghim.</p>
                </div>
              ) : (
                getBookmarks().map(b => (
                  <div key={b.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{b.sessionTitle}</span>
                        <span className="text-xs text-gray-400 ml-2">{new Date(b.bookmarkedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <button
                        onClick={() => { handleRemoveBookmark(b.message.id); setShowBookmarks(false); setTimeout(() => setShowBookmarks(true), 50); }}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Bỏ ghim
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-4 whitespace-pre-wrap">{b.message.text.substring(0, 300)}{b.message.text.length > 300 ? '...' : ''}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AIToolsModal
        isOpen={showAITools}
        onClose={() => setShowAITools(false)}
      />

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      <InstallPwaModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
}

export default App;
