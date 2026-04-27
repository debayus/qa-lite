/** Parse a CSV string into a 2D array of strings. Handles quoted fields. */
export function parseCSV(text) {
    const rows = [];
    const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    for (const line of lines) {
        if (!line.trim())
            continue;
        rows.push(parseLine(line));
    }
    return rows;
}
function parseLine(line) {
    const fields = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (ch === "," && !inQuotes) {
            fields.push(current.trim());
            current = "";
        }
        else {
            current += ch;
        }
    }
    fields.push(current.trim());
    return fields;
}
function toCSVField(value) {
    const str = value ?? "";
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}
export function generateCSV(headers, rows) {
    const lines = [headers.join(",")];
    for (const row of rows) {
        lines.push(row.map(toCSVField).join(","));
    }
    return lines.join("\n");
}
export function downloadCSV(filename, content) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
