import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType, TextRun } from 'docx';

export const exportHtmlTableToWord = async (tableEl: HTMLTableElement | null, title: string = 'Bang_Du_Lieu') => {
    if (!tableEl) return;

    const rows: TableRow[] = [];

    // Parse all rows (thead, tbody, tfoot)
    const trElements = Array.from(tableEl.querySelectorAll('tr'));

    for (let rowIndex = 0; rowIndex < trElements.length; rowIndex++) {
        const tr = trElements[rowIndex];
        const cellElements = Array.from(tr.querySelectorAll('th, td'));
        const cells: TableCell[] = [];

        for (const cell of cellElements) {
            const isHeader = cell.tagName.toLowerCase() === 'th';
            const textContent = cell.textContent || '';
            
            cells.push(
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: textContent,
                                    bold: isHeader,
                                    size: 22, // 11pt
                                }),
                            ],
                            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                        }),
                    ],
                    shading: isHeader ? { fill: "F3F4F6" } : undefined,
                    margins: { top: 100, bottom: 100, left: 100, right: 100 },
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                        bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                        left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                        right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                    }
                })
            );
        }

        if (cells.length > 0) {
            rows.push(new TableRow({ children: cells }));
        }
    }

    if (rows.length === 0) return;

    const docxTable = new Table({
        rows: rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } },
                },
                children: [
                    new Paragraph({
                        text: "Bảng Dữ Liệu Tải Xuống",
                        heading: "Title",
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 300 },
                    }),
                    docxTable,
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.docx`;
    a.click();
    URL.revokeObjectURL(url);
};
