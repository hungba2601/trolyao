
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export const downloadUserGuide = async () => {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: "HƯỚNG DẪN SỬ DỤNG TRỢ LÝ GIÁO VIÊN AI",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "1. GIỚI THIỆU CHUNG", bold: true }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                    text: "Trợ lý Giáo viên AI là ứng dụng thông minh được thiết kế riêng cho giáo viên Việt Nam, giúp tối ưu hóa công việc soạn bài, tạo đề thi và nghiên cứu tài liệu.",
                    spacing: { after: 200 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({ text: "2. CÁC TÍNH NĂNG CHÍNH", bold: true }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({ text: "• Soạn giáo án: Hỗ trợ soạn giáo án theo các mẫu công văn mới nhất.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Tạo đề thi: Tự động tạo câu hỏi trắc nghiệm, tự luận kèm đáp án và ma trận.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Phân tích tài liệu: Tải lên file PDF/Word để AI tóm tắt hoặc đặt câu hỏi dựa trên nội dung đó.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Gợi ý công cụ AI: Danh sách các công cụ bổ trợ hữu ích cho giảng dạy.", bullet: { level: 0 } }),
                
                new Paragraph({
                    children: [
                        new TextRun({ text: "3. HƯỚNG DẪN THIẾT LẬP", bold: true }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({ text: "• Bước 1: Lấy Gemini API Key từ Google AI Studio (miễn phí).", bullet: { level: 0 } }),
                new Paragraph({ text: "• Bước 2: Nhập API Key vào màn hình Setup khi lần đầu mở app.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Bước 3: (Tùy chọn) Kết nối Supabase Database để lưu trữ tài liệu lâu dài.", bullet: { level: 0 } }),

                new Paragraph({
                    children: [
                        new TextRun({ text: "4. CÁCH SỬ DỤNG KHUNG CHAT", bold: true }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({ text: "• Gõ nội dung trực tiếp vào ô chat để đặt câu hỏi.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Sử dụng dấu gạch chéo (/) để mở menu lệnh nhanh (ví dụ: /giaoan, /dethi).", bullet: { level: 0 } }),
                new Paragraph({ text: "• Nhấn vào biểu tượng Micro để sử dụng giọng nói thay vì nhập văn bản.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Nhấn vào biểu tượng Tài liệu (ghim) để tải lên file tham khảo.", bullet: { level: 0 } }),

                new Paragraph({
                    children: [
                        new TextRun({ text: "5. LƯU Ý QUAN TRỌNG", bold: true }),
                    ],
                    spacing: { before: 200, after: 100 },
                }),
                new Paragraph({ text: "• AI có thể đưa ra thông tin chưa chính xác, Thầy/Cô nên kiểm tra lại trước khi sử dụng.", bullet: { level: 0 } }),
                new Paragraph({ text: "• Dữ liệu nháp được lưu tự động trên trình duyệt, Thầy/Cô không lo bị mất nội dung khi tải lại trang.", bullet: { level: 0 } }),
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Huong_dan_su_dung_Tro_ly_Giao_vien_AI.docx");
};
