import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useBugs } from "../hooks/useBugs";
import BugCard from "../components/BugCard";
import CreateBugModal from "../components/CreateBugModal";
import BugDetailModal from "../components/BugDetailModal";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import { BUG_STATUS_LABEL, BUG_STATUS_COLOR, BTN_DANGER } from "@/constants";
import Badge from "@/components/ui/Badge";
const COLUMNS = ["open", "in_progress", "resolved", "closed"];
export default function BugsPage() {
    const { projectId } = useParams();
    const { bugs, loading, createBug, updateBugStatus, deleteBug, userMap } = useBugs(projectId);
    const [showModal, setShowModal] = useState(false);
    const [selectedBug, setSelectedBug] = useState(null);
    return (_jsxs("div", { className: "space-y-5", children: [_jsx(PageHeader, { title: "Bug Tracker", action: _jsxs("button", { onClick: () => setShowModal(true), className: BTN_DANGER, children: [_jsx("span", { className: "text-base leading-none", children: "+" }), "Report Bug"] }) }), loading ? (_jsx(LoadingState, {})) : (_jsx("div", { className: "-mx-4 px-4 overflow-x-auto md:mx-0 md:px-0", children: _jsx("div", { className: "grid grid-cols-4 gap-4 min-w-[640px]", children: COLUMNS.map((status) => {
                        const colBugs = bugs.filter((b) => b.status === status);
                        const label = BUG_STATUS_LABEL[status];
                        const color = BUG_STATUS_COLOR[status];
                        return (_jsxs("div", { className: "min-w-[180px] flex flex-col gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${color}` }), _jsx("span", { className: "text-sm font-semibold text-gray-700", children: label }), _jsx(Badge, { className: "ml-auto bg-gray-100 text-gray-500", children: colBugs.length })] }), _jsx("div", { className: "space-y-2 min-h-[120px]", children: colBugs.length === 0 ? (_jsx("div", { className: "border-2 border-dashed border-gray-100 rounded-xl h-20 flex items-center justify-center", children: _jsx("span", { className: "text-xs text-gray-300", children: "Empty" }) })) : (colBugs.map((bug) => (_jsx(BugCard, { bug: bug, reportedByName: userMap[bug.reportedBy] ?? bug.reportedBy, onStatusChange: updateBugStatus, onDelete: deleteBug, onClick: () => setSelectedBug(bug) }, bug.id)))) })] }, status));
                    }) }) })), showModal && (_jsx(CreateBugModal, { onClose: () => setShowModal(false), onSubmit: createBug })), selectedBug && (_jsx(BugDetailModal, { bug: selectedBug, reportedByName: userMap[selectedBug.reportedBy] ?? selectedBug.reportedBy, onClose: () => setSelectedBug(null) }))] }));
}
