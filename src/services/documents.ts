// Max chars per chunk (~4000 tokens ≈ 16000 chars, leave room for prompt)
const CHUNK_SIZE = 12000;

export interface Document {
    id: string;
    title: string;
    file_type: string;
    file_size: number;
    content: string;
    chunk_count: number;
    tags: string[];
    folder: string;
    created_at: string;
}

export interface DocumentChunk {
    id: string;
    document_id: string;
    chunk_index: number;
    content: string;
    char_count: number;
}

// ========== TEXT EXTRACTION ==========

export const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker path
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: unknown) => {
                return (item as { str: string }).str || '';
            })
            .join(' ');
        fullText += `\n--- Trang ${i} ---\n${pageText}`;
    }

    return fullText.trim();
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
};

export const extractTextFromTxt = async (file: File): Promise<string> => {
    return await file.text();
};

export const extractText = async (file: File): Promise<string> => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf':
            return extractTextFromPDF(file);
        case 'docx':
        case 'doc':
            return extractTextFromDocx(file);
        case 'txt':
        case 'md':
            return extractTextFromTxt(file);
        default:
            throw new Error(`Không hỗ trợ file .${ext}. Chỉ hỗ trợ PDF, DOCX, TXT.`);
    }
};

// removed chunking logic

// ========== LOCAL STORAGE ==========

const LOCAL_KEY = 'chatbot_documents';

interface LocalDoc {
    id: string;
    title: string;
    file_type: string;
    file_size: number;
    content: string;
    chunk_count: number;
    tags: string[];
    folder: string;
    created_at: string;
}

const getLocalDocs = (): LocalDoc[] => {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    } catch {
        return [];
    }
};

const setLocalDocs = (docs: LocalDoc[]) => {
    try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(docs));
    } catch (e) {
        console.error('localStorage full:', e);
    }
};

export const saveDocument = async (title: string, content: string, fileType: string, fileSize: number, tags: string[] = [], folder: string = ''): Promise<Document | null> => {
    const doc: LocalDoc = {
        id: crypto.randomUUID(),
        title,
        file_type: fileType,
        file_size: fileSize,
        content: content.substring(0, 100000),
        chunk_count: Math.ceil(content.length / CHUNK_SIZE),
        tags,
        folder,
        created_at: new Date().toISOString(),
    };
    const docs = getLocalDocs();
    docs.unshift(doc);
    setLocalDocs(docs);
    return doc;
};

export const getDocuments = async (): Promise<Document[]> => {
    return getLocalDocs().map(d => ({ ...d, content: '' }));
};

export const getDocumentContent = async (docId: string): Promise<string> => {
    const docs = getLocalDocs();
    return docs.find(d => d.id === docId)?.content || '';
};

export const deleteDocument = async (docId: string): Promise<boolean> => {
    const docs = getLocalDocs().filter(d => d.id !== docId);
    setLocalDocs(docs);
    return true;
};

export const updateDocumentTags = async (docId: string, tags: string[]): Promise<boolean> => {
    const docs = getLocalDocs();
    const doc = docs.find(d => d.id === docId);
    if (doc) { doc.tags = tags; setLocalDocs(docs); }
    return true;
};

export const updateDocumentFolder = async (docId: string, folder: string): Promise<boolean> => {
    const docs = getLocalDocs();
    const doc = docs.find(d => d.id === docId);
    if (doc) { doc.folder = folder; setLocalDocs(docs); }
    return true;
};


// ========== CONTEXT BUILDER FOR CHAT ==========

export const buildDocumentContext = async (selectedDocIds: string[]): Promise<string> => {
    if (selectedDocIds.length === 0) return '';

    const contents: string[] = [];
    for (const id of selectedDocIds) {
        const content = await getDocumentContent(id);
        if (content) {
            // Limit each doc to ~8000 chars to fit in context
            contents.push(content.substring(0, 8000));
        }
    }

    if (contents.length === 0) return '';

    return `\n\nTÀI LIỆU THAM KHẢO:\n${contents.map((c, i) => `--- Tài liệu ${i + 1} ---\n${c}`).join('\n\n')}`;
};
