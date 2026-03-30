import * as XLSX from 'xlsx';

export async function parseFileForPreview(file: File): Promise<string[][]> {
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (ext === 'csv' || ext === 'txt') {
        return parseCsv(file);
    }
    if (ext === 'xlsx' || ext === 'xls') {
        return parseXlsx(file);
    }

    throw new Error('Định dạng file không hỗ trợ. Chọn file CSV hoặc XLSX.');
}

function parseCsv(file: File): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let text = (e.target?.result as string) || '';
                if (text.startsWith('\ufeff')) text = text.slice(1);
                const rows: string[][] = [];
                const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
                for (let i = 0; i < lines.length; i++) {
                    rows.push(parseCsvLine(lines[i]));
                }
                resolve(rows.filter((r) => r.some((c) => c.trim())));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Không thể đọc file'));
        reader.readAsText(file, 'UTF-8');
    });
}

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (inQuotes) {
            current += c;
        } else if (c === ',') {
            result.push(current);
            current = '';
        } else {
            current += c;
        }
    }
    result.push(current);
    return result.map((s) => s.trim().replace(/^"|"$/g, ''));
}

function parseXlsx(file: File): Promise<string[][]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json<string[]>(ws, {
                    header: 1,
                    defval: '',
                    raw: false,
                }) as string[][];
                const normalized = rows.map((row) => {
                    const arr = Array.isArray(row) ? row : [row];
                    return arr.map((c) => String(c ?? '').trim());
                });
                resolve(normalized.filter((r) => r.some((c) => c)));
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = () => reject(new Error('Không thể đọc file'));
        reader.readAsArrayBuffer(file);
    });
}
