import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useMembers } from "../hooks/useMembers";
import { useAuth } from "@/hooks/useAuth";
import InviteModal from "../components/InviteModal";
import { cn } from "@/lib/utils/cn";
import { STARTER_LIMITS, ROLE_COLOR, ROLE_AVATAR_BG, BTN_PRIMARY, } from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import AlertBanner from "@/components/common/AlertBanner";
export default function MembersPage() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { project } = useProject(projectId);
    const { members, loading, inviteMember, changeMemberRole } = useMembers(project);
    const [showModal, setShowModal] = useState(false);
    const isAdmin = project && user ? project.members[user.uid] === "admin" : false;
    const memberCount = Object.keys(project?.members ?? {}).length;
    const isPro = user?.entitlement === "pro";
    const atLimit = !isPro && memberCount >= STARTER_LIMITS.maxMembers;
    return (_jsxs("div", { className: "space-y-6 max-w-5xl mx-auto", children: [_jsx(PageHeader, { title: "Team Members", subtitle: `${memberCount} member(s)`, action: isAdmin ? (_jsx("button", { onClick: () => setShowModal(true), disabled: atLimit, title: atLimit
                        ? `Starter max. ${STARTER_LIMITS.maxMembers} members.`
                        : undefined, className: BTN_PRIMARY, children: "+ Invite" })) : undefined }), atLimit && (_jsx(AlertBanner, { message: _jsxs(_Fragment, { children: ["Starter plan supports ", STARTER_LIMITS.maxMembers, " members.", " ", _jsx("span", { className: "font-semibold", children: "Upgrade to Pro" }), " for unlimited members."] }) })), loading ? (_jsx(LoadingState, {})) : (_jsx("ul", { className: "divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden", children: members.map((m) => {
                    const initials = (m.displayName || m.email)
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase();
                    const avatarBg = ROLE_AVATAR_BG[m.role];
                    return (_jsxs("li", { className: "flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors", children: [_jsx("span", { className: cn("text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0", avatarBg), children: initials }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: m.displayName }), _jsx("p", { className: "text-xs text-gray-400 truncate", children: m.email })] }), _jsx("div", { className: "flex items-center gap-2", children: isAdmin && m.uid !== user?.uid ? (_jsxs("select", { value: m.role, onChange: (e) => changeMemberRole(projectId, m.uid, e.target.value), className: "text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50", children: [_jsx("option", { value: "admin", children: "admin" }), _jsx("option", { value: "tester", children: "tester" }), _jsx("option", { value: "viewer", children: "viewer" })] })) : (_jsx("span", { className: cn("text-xs rounded-full px-2.5 py-0.5 font-semibold", ROLE_COLOR[m.role]), children: m.role })) })] }, m.uid));
                }) })), showModal && project && (_jsx(InviteModal, { projectId: project.id, onClose: () => setShowModal(false), onInvite: inviteMember }))] }));
}
