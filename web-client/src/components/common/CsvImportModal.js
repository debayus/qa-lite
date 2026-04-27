import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { parseCSV } from "@/lib/utils/csv";
import { XMarkIcon } from "@/components/ui/Icons";
export default function CsvImportModal({ title, headers, defaultValues = {}, formatExample, aiPrompt, onImport, onClose, }) {
    const [csvText, setCsvText] = useState("");
    const [error, setError] = useState(null);
    const [importing, setImporting] = useState(false);
    const [promptCopied, setPromptCopied] = useState(false);
    const [exampleCopied, setExampleCopied] = useState(false);
    const fileInputRef = useRef(null);
    function handleFileChange(e) {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (ev) => setCsvText(ev.target?.result ?? "");
        reader.readAsText(file, "utf-8");
        // reset so same file can be re-selected
        e.target.value = "";
    }
    async function handleImport() {
        setError(null);
        const rows = parseCSV(csvText);
        if (rows.length < 2) {
            setError("CSV harus memiliki baris header dan minimal satu baris data.");
            return;
        }
        const [headerRow, ...dataRows] = rows;
        const normalizedHeaders = headerRow.map((h) => h.toLowerCase().trim());
        const requiredColumn = headers[0].toLowerCase().trim();
        if (!normalizedHeaders.includes(requiredColumn)) {
            setError(`CSV harus memiliki kolom "${requiredColumn}".`);
            return;
        }
        const parsed = [];
        for (const row of dataRows) {
            if (row.every((c) => !c.trim()))
                continue;
            const obj = { ...defaultValues };
            normalizedHeaders.forEach((h, i) => {
                obj[h] = (row[i] ?? "").trim();
            });
            if (!obj[requiredColumn])
                continue;
            parsed.push(obj);
        }
        if (parsed.length === 0) {
            setError("Tidak ada baris valid yang ditemukan.");
            return;
        }
        setImporting(true);
        try {
            await onImport(parsed);
            onClose();
        }
        catch {
            setError("Import gagal. Silakan coba lagi.");
        }
        finally {
            setImporting(false);
        }
    }
    function copyText(text, setter) {
        navigator.clipboard.writeText(text).then(() => {
            setter(true);
            setTimeout(() => setter(false), 2000);
        });
    }
    const previewCount = (() => {
        try {
            const rows = parseCSV(csvText);
            if (rows.length < 2)
                return 0;
            return rows.slice(1).filter((r) => r.some((c) => c.trim())).length;
        }
        catch {
            return 0;
        }
    })();
    return createPortal(_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4", onClick: onClose, children: _jsx("div", { className: "bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto", onClick: (e) => e.stopPropagation(), children: _jsxs("div", { className: "p-6 space-y-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-base font-semibold text-gray-900", children: title }), _jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100", children: _jsx(XMarkIcon, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "bg-gray-50 rounded-xl p-4 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Format CSV" }), _jsx("button", { onClick: () => copyText(formatExample, setExampleCopied), className: "text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors", children: exampleCopied ? "✓ Copied" : "Copy contoh" })] }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("div", { className: "flex flex-wrap gap-1.5", children: headers.map((h, i) => (_jsxs("span", { className: `px-2 py-0.5 rounded text-xs font-mono font-medium ${i === 0
                                                ? "bg-indigo-100 text-indigo-700"
                                                : "bg-gray-200 text-gray-600"}`, children: [h, i === 0 && (_jsx("span", { className: "ml-1 text-indigo-400 font-sans font-normal", children: "*wajib" }))] }, h))) }), _jsx("pre", { className: "text-xs font-mono text-gray-600 bg-white border border-gray-200 rounded-lg p-3 whitespace-pre overflow-x-auto leading-relaxed", children: formatExample })] })] }), _jsxs("div", { className: "bg-indigo-50 rounded-xl p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-semibold text-indigo-600 uppercase tracking-wide", children: "\u2728 AI Prompt Template" }), _jsx("button", { onClick: () => copyText(aiPrompt, setPromptCopied), className: "text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors", children: promptCopied ? "✓ Copied" : "Copy prompt" })] }), _jsx("pre", { className: "text-xs text-indigo-900 whitespace-pre-wrap font-mono bg-white/70 rounded-lg p-3 leading-relaxed border border-indigo-100", children: aiPrompt }), _jsx("p", { className: "text-xs text-indigo-500", children: "Copy prompt di atas \u2192 paste ke ChatGPT / Gemini / Claude \u2192 edit bagian dalam [ ] \u2192 hasil CSV langsung bisa diimport di sini." })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wide", children: "Upload atau Paste CSV" }), _jsx("button", { onClick: () => fileInputRef.current?.click(), className: "px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors", children: "Pilih file .csv" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".csv,text/csv", className: "hidden", onChange: handleFileChange })] }), _jsx("textarea", { value: csvText, onChange: (e) => setCsvText(e.target.value), placeholder: `Paste CSV di sini...\n\nContoh:\n${formatExample}`, className: "w-full h-44 text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none placeholder-gray-300" }), previewCount > 0 && (_jsxs("p", { className: "text-xs text-indigo-600 font-medium", children: [previewCount, " baris siap diimport"] }))] }), error && (_jsx("p", { className: "text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2", children: error })), _jsxs("div", { className: "flex justify-end gap-2 pt-1", children: [_jsx("button", { onClick: onClose, className: "px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Batal" }), _jsx("button", { onClick: handleImport, disabled: importing || !csvText.trim(), className: "px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors", children: importing
                                    ? "Mengimport..."
                                    : `Import${previewCount > 0 ? ` (${previewCount})` : ""}` })] })] }) }) }), document.body);
}
