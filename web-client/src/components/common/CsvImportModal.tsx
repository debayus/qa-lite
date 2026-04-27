import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { parseCSV } from "@/lib/utils/csv";
import { XMarkIcon } from "@/components/ui/Icons";

interface Props {
  title: string;
  /** Column headers expected in the CSV (first is required "title"). */
  headers: string[];
  /** Default values for missing optional columns. */
  defaultValues?: Record<string, string>;
  /** Format description shown to the user. */
  formatExample: string;
  /** AI prompt template the user can copy. */
  aiPrompt: string;
  onImport: (rows: Record<string, string>[]) => Promise<void>;
  onClose: () => void;
}

export default function CsvImportModal({
  title,
  headers,
  defaultValues = {},
  formatExample,
  aiPrompt,
  onImport,
  onClose,
}: Props) {
  const [csvText, setCsvText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [exampleCopied, setExampleCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvText((ev.target?.result as string) ?? "");
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
    const parsed: Record<string, string>[] = [];
    for (const row of dataRows) {
      if (row.every((c) => !c.trim())) continue;
      const obj: Record<string, string> = { ...defaultValues };
      normalizedHeaders.forEach((h, i) => {
        obj[h] = (row[i] ?? "").trim();
      });
      if (!obj[requiredColumn]) continue;
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
    } catch {
      setError("Import gagal. Silakan coba lagi.");
    } finally {
      setImporting(false);
    }
  }

  function copyText(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setter(true);
      setTimeout(() => setter(false), 2000);
    });
  }

  const previewCount = (() => {
    try {
      const rows = parseCSV(csvText);
      if (rows.length < 2) return 0;
      return rows.slice(1).filter((r) => r.some((c) => c.trim())).length;
    } catch {
      return 0;
    }
  })();

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* ── Format Info ── */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Format CSV
              </p>
              <button
                onClick={() => copyText(formatExample, setExampleCopied)}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {exampleCopied ? "✓ Copied" : "Copy contoh"}
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap gap-1.5">
                {headers.map((h, i) => (
                  <span
                    key={h}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                      i === 0
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {h}
                    {i === 0 && (
                      <span className="ml-1 text-indigo-400 font-sans font-normal">
                        *wajib
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <pre className="text-xs font-mono text-gray-600 bg-white border border-gray-200 rounded-lg p-3 whitespace-pre overflow-x-auto leading-relaxed">
                {formatExample}
              </pre>
            </div>
          </div>

          {/* ── AI Prompt ── */}
          <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                ✨ AI Prompt Template
              </p>
              <button
                onClick={() => copyText(aiPrompt, setPromptCopied)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {promptCopied ? "✓ Copied" : "Copy prompt"}
              </button>
            </div>
            <pre className="text-xs text-indigo-900 whitespace-pre-wrap font-mono bg-white/70 rounded-lg p-3 leading-relaxed border border-indigo-100">
              {aiPrompt}
            </pre>
            <p className="text-xs text-indigo-500">
              Copy prompt di atas → paste ke ChatGPT / Gemini / Claude → edit
              bagian dalam [ ] → hasil CSV langsung bisa diimport di sini.
            </p>
          </div>

          {/* ── Upload / Paste ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Upload atau Paste CSV
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Pilih file .csv
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Paste CSV di sini...\n\nContoh:\n${formatExample}`}
              className="w-full h-44 text-xs font-mono text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none placeholder-gray-300"
            />
            {previewCount > 0 && (
              <p className="text-xs text-indigo-600 font-medium">
                {previewCount} baris siap diimport
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleImport}
              disabled={importing || !csvText.trim()}
              className="px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {importing
                ? "Mengimport..."
                : `Import${previewCount > 0 ? ` (${previewCount})` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
