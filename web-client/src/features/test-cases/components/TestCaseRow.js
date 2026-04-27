import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { TEST_STATUS_COLOR, TEST_STATUS_LABEL } from "@/constants";
import { ChevronUpIcon, ChevronDownIcon } from "@/components/ui/Icons";
import ConfirmModal from "@/components/common/ConfirmModal";
export default function TestCaseRow({ testCase, index, isFirst, isLast, onUpdate, onDelete, onMoveUp, onMoveDown, onEnterKey, }) {
    const [expanded, setExpanded] = useState(false);
    const [stepsText, setStepsText] = useState(testCase.steps.join("\n"));
    const [confirmDelete, setConfirmDelete] = useState(false);
    const titleRef = useRef(null);
    function handleTitleBlur(e) {
        const val = e.target.value.trim();
        if (val && val !== testCase.title)
            onUpdate(testCase.id, { title: val });
    }
    function handleTitleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            onEnterKey?.();
        }
    }
    function handleStepsBlur() {
        const steps = stepsText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        onUpdate(testCase.id, { steps });
    }
    return (_jsxs("div", { className: "border-b border-gray-100 last:border-0", children: [_jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 group", children: [_jsxs("div", { className: "flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: [_jsx("button", { onClick: onMoveUp, disabled: isFirst, className: "p-0.5 rounded text-gray-300 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors", title: "Move up", children: _jsx(ChevronUpIcon, { className: "w-3 h-3" }) }), _jsx("button", { onClick: onMoveDown, disabled: isLast, className: "p-0.5 rounded text-gray-300 hover:text-indigo-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors", title: "Move down", children: _jsx(ChevronDownIcon, { className: "w-3 h-3" }) })] }), _jsx("span", { className: "w-5 text-right text-xs text-gray-400 shrink-0", children: index }), _jsx("input", { ref: titleRef, defaultValue: testCase.title, onBlur: handleTitleBlur, onKeyDown: handleTitleKeyDown, className: "flex-1 text-sm text-gray-900 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-300 rounded px-1 py-0.5" }), _jsx("span", { className: cn("text-[11px] rounded-full px-2.5 py-0.5 font-semibold shrink-0", TEST_STATUS_COLOR[testCase.status]), children: TEST_STATUS_LABEL[testCase.status] ?? testCase.status }), _jsx("button", { onClick: () => setExpanded((v) => !v), className: "text-xs text-gray-400 hover:text-indigo-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", children: expanded
                            ? "Close"
                            : testCase.steps.length > 0
                                ? `${testCase.steps.length} step(s)`
                                : "Steps" }), _jsx("button", { onClick: () => setConfirmDelete(true), className: "text-xs text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity", title: "Delete", children: "\u2715" })] }), expanded && (_jsx("div", { className: "pl-12 pr-3 pb-3", children: _jsx("textarea", { value: stepsText, onChange: (e) => setStepsText(e.target.value), onBlur: handleStepsBlur, placeholder: "One step per line...", rows: 3, className: "w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" }) })), confirmDelete && (_jsx(ConfirmModal, { title: "Delete this test case?", description: `"${testCase.title}" will be permanently deleted.`, onConfirm: () => {
                    setConfirmDelete(false);
                    onDelete(testCase.id);
                }, onCancel: () => setConfirmDelete(false) }))] }));
}
