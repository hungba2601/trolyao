import type { AITool } from '../types';

export const RECOMMENDED_AI_TOOLS: AITool[] = [
    {
        id: 'edutech-nph',
        name: 'Website chứa các app hỗ trợ cho việc giảng dạy và học tập miễn phí',
        description: 'Tổng hợp các ứng dụng hỗ trợ giáo dục miễn phí cho giáo viên và học sinh.',
        image_url: '/placeholder-ai.png',
        url: 'https://edutech-nph.vercel.app/',
        category: 'Thư viện ứng dụng',
        tags: ['Tổng hợp', 'Miễn phí', 'Giảng dạy']
    },
    {
        id: 'nls-app',
        name: 'App tích hợp NLS vào các loại KH (KHBD, KHGD, PL1,2,3,4...)',
        description: 'Giúp tích hợp nhanh khung NLS vào tất cả cá loại KH',
        image_url: '/placeholder-ai.png',
        url: 'https://nls-kappa.vercel.app/',
        category: 'Soạn giáo án',
        tags: ['NLS', 'KHBD', 'MIỄN PHÍ']
    },
    {
        id: 'de-kt-7991',
        name: 'App tạo đề kt+ma trận+câu hỏi ôn tập theo cv7991',
        description: 'Giúp tạo đề kt, ma trận , câu hỏi theo đúng cv 7991 chỉ mất 1-2 phút',
        image_url: '/placeholder-ai.png',
        url: 'https://dekt-4.vercel.app/',
        category: 'Tạo đề thi',
        tags: ['CV 7991', 'Ma trận', 'MIỄN PHÍ']
    },
    {
        id: 'khbd-5512-pptx',
        name: 'App tạo KHBD 5512+ POWETPOINT+SĐTD',
        description: 'Giúp tạo KHBD+ PPTX+ Sơ đồ tư duy 1 cách nhanh chóng',
        image_url: '/placeholder-ai.png',
        url: 'https://nlspptx-1.vercel.app/',
        category: 'Soạn giáo án',
        tags: ['5512', 'PPTX', 'MIỄN PHÍ']
    },
    {
        id: 'viet-skkn',
        name: 'App viết SKKN',
        description: 'Giúp viết skkn nhanh chóng đúng chuẩn from',
        image_url: '/placeholder-ai.png',
        url: 'https://skkn-nph.vercel.app/',
        category: 'Viết SKKN',
        tags: ['SKKN', 'MIỄN PHÍ']
    },
    {
        id: 'xuong-truyen-pro',
        name: 'XƯỞNG TRUYỆN PRO',
        description: 'Công cụ AI mạnh mẽ giúp tạo kịch bản truyện tranh, kể chuyện kỹ thuật số và minh họa bài giảng sống động chỉ trong vài phút.',
        image_url: '/xuongtruyenpro.jpg',
        url: 'https://xuongtruyenpro.vercel.app/',
        category: 'Sáng tạo truyện',
        tags: ['Truyện tranh', 'Kể chuyện', 'MIỄN PHÍ']
    },
    {
        id: 'tro-ly-anh',
        name: 'TRỢ LÝ TIẾNG ANH AI',
        description: 'Empowering Teachers with Artificial Intelligence. Công cụ chuyên dụng dành cho giáo viên hiện đại.',
        image_url: '/trolytienganhai.jpg',
        url: 'https://trolytienganh.vercel.app/',
        category: 'Tiếng Anh',
        tags: ['Tiếng Anh', 'MIỄN PHÍ']
    },
    {
        id: 'tro-ly-anh-pro',
        name: 'TRỢ LÝ ẢO TIẾNG ANH PRO',
        description: 'Giải pháp AI toàn diện giúp giáo viên soạn bài, chấm điểm và sáng tạo nội dung giảng dạy chỉ trong vài giây.',
        image_url: '/trolyaotienganhpro.jpg',
        url: 'https://english-assistant-pro.vercel.app/',
        category: 'Tiếng Anh',
        tags: ['Tiếng Anh', 'Chấm điểm', 'MIỄN PHÍ']
    },
    // --- CÔNG CỤ TỪ FILE BỔ SUNG ---
    {
        id: 'chatgpt',
        name: 'CHATGPT (OPENAI)',
        description: 'Soạn giáo án, tạo câu hỏi, tóm tắt tài liệu, gợi ý hoạt động dạy học, hỗ trợ nhiều môn và cấp học.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
        url: 'https://chatgpt.com',
        category: 'Trợ lý đa năng',
        tags: ['Chatbot', 'Đa năng', 'MIỄN PHÍ']
    },
    {
        id: 'google-gemini',
        name: 'GOOGLE GEMINI',
        description: 'Soạn bài, dịch tài liệu, gợi ý hoạt động lớp học, tích hợp tốt với Google Docs, Slides, Drive.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
        url: 'https://gemini.google.com',
        category: 'Trợ lý đa năng',
        tags: ['Google', 'Đa năng', 'MIỄN PHÍ']
    },
    {
        id: 'canva-education',
        name: 'CANVA FOR EDUCATION',
        description: 'Tạo slide, infographic, poster, video bài giảng; Magic Write gợi ý nội dung, có nhiều mẫu cho giáo dục.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Canva_icon_2021.svg',
        url: 'https://www.canva.com/education',
        category: 'Thiết kế bài giảng',
        tags: ['Slide', 'Thiết kế', 'MIỄN PHÍ']
    },
    {
        id: 'brisk-teaching',
        name: 'BRISK TEACHING',
        description: 'Tạo quiz, worksheet, summary từ YouTube, web, PDF; điều chỉnh mức đọc; tạo câu hỏi hiểu bài.',
        image_url: '/placeholder-ai.png',
        url: 'https://www.briskteaching.com',
        category: 'Tạo Quiz',
        tags: ['Extension', 'Quiz', 'MIỄN PHÍ']
    },
    {
        id: 'quizizz',
        name: 'QUIZIZZ',
        description: 'Tạo bài kiểm tra gamified, live hoặc homework; ngân hàng đề cộng đồng; thống kê kết quả theo thời gian thực.',
        image_url: '/placeholder-ai.png',
        url: 'https://quizizz.com',
        category: 'Kiểm tra đánh giá',
        tags: ['Game', 'Quiz', 'MIỄN PHÍ']
    },
    {
        id: 'quizlet',
        name: 'QUIZLET',
        description: 'Tạo flashcard từ văn bản; AI trò chuyện dạng tutor; phù hợp học từ vựng, khái niệm.',
        image_url: '/placeholder-ai.png',
        url: 'https://quizlet.com',
        category: 'Kiểm tra đánh giá',
        tags: ['Flashcard', 'Từ vựng', 'MIỄN PHÍ']
    },
    {
        id: 'wordwall',
        name: 'WORDWALL',
        description: 'Tạo trò chơi từ vựng, ngữ pháp kiểu kéo thả, trắc nghiệm nhanh chóng.',
        image_url: '/placeholder-ai.png',
        url: 'https://wordwall.net',
        category: 'Ngoại ngữ',
        tags: ['Game', 'Từ vựng', 'MIỄN PHÍ']
    },
    {
        id: 'gamma-app',
        name: 'GAMMA APP',
        description: 'Nhập chủ đề/bài học, AI sinh slide hoàn chỉnh đẹp mắt; có thể chỉnh sửa và xuất PDF/PPT.',
        image_url: '/placeholder-ai.png',
        url: 'https://gamma.app',
        category: 'Thiết kế bài giảng',
        tags: ['Slide', 'Thuyết trình', 'MIỄN PHÍ']
    },
    {
        id: 'clipchamp',
        name: 'CLIPCHAMP',
        description: 'Dựng video bài giảng, cắt ghép, lồng tiếng (text-to-speech) dễ dàng.',
        image_url: '/placeholder-ai.png',
        url: 'https://clipchamp.com',
        category: 'Video bài giảng',
        tags: ['Video', 'Edit', 'MIỄN PHÍ']
    },
    {
        id: 'notebooklm',
        name: 'NOTEBOOKLM (GOOGLE)',
        description: 'Tải PDF, tài liệu, transcript video vào; AI tóm tắt, rút ý, tạo câu hỏi ôn tập cực chuẩn.',
        image_url: '/placeholder-ai.png',
        url: 'https://notebooklm.google',
        category: 'Nghiên cứu tài liệu',
        tags: ['RAG', 'Tóm tắt', 'MIỄN PHÍ']
    }
];
