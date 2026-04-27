import { useState } from "react";
import { useParams } from "react-router-dom";
import { useProject } from "@/features/projects/hooks/useProjects";
import { useMembers } from "../hooks/useMembers";
import { useAuth } from "@/hooks/useAuth";
import InviteModal from "../components/InviteModal";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/types";
import {
  STARTER_LIMITS,
  ROLE_COLOR,
  ROLE_AVATAR_BG,
  BTN_PRIMARY,
} from "@/constants";
import PageHeader from "@/components/common/PageHeader";
import LoadingState from "@/components/common/LoadingState";
import AlertBanner from "@/components/common/AlertBanner";

export default function MembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const { project } = useProject(projectId);
  const { members, loading, inviteMember, changeMemberRole } =
    useMembers(project);
  const [showModal, setShowModal] = useState(false);

  const isAdmin =
    project && user ? project.members[user.uid] === "admin" : false;
  const memberCount = Object.keys(project?.members ?? {}).length;
  const isPro = user?.entitlement === "pro";
  const atLimit = !isPro && memberCount >= STARTER_LIMITS.maxMembers;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Team Members"
        subtitle={`${memberCount} member(s)`}
        action={
          isAdmin ? (
            <button
              onClick={() => setShowModal(true)}
              disabled={atLimit}
              title={
                atLimit
                  ? `Starter max. ${STARTER_LIMITS.maxMembers} members.`
                  : undefined
              }
              className={BTN_PRIMARY}
            >
              + Invite
            </button>
          ) : undefined
        }
      />

      {atLimit && (
        <AlertBanner
          message={
            <>
              Starter plan supports {STARTER_LIMITS.maxMembers} members.{" "}
              <span className="font-semibold">Upgrade to Pro</span> for
              unlimited members.
            </>
          }
        />
      )}

      {loading ? (
        <LoadingState />
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {members.map((m) => {
            const initials = (m.displayName || m.email)
              .split(" ")
              .slice(0, 2)
              .map((w: string) => w[0])
              .join("")
              .toUpperCase();
            const avatarBg = ROLE_AVATAR_BG[m.role];
            return (
              <li
                key={m.uid}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <span
                  className={cn(
                    "text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    avatarBg,
                  )}
                >
                  {initials}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {m.displayName}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && m.uid !== user?.uid ? (
                    <select
                      value={m.role}
                      onChange={(e) =>
                        changeMemberRole(
                          projectId!,
                          m.uid,
                          e.target.value as UserRole,
                        )
                      }
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                    >
                      <option value="admin">admin</option>
                      <option value="tester">tester</option>
                      <option value="viewer">viewer</option>
                    </select>
                  ) : (
                    <span
                      className={cn(
                        "text-xs rounded-full px-2.5 py-0.5 font-semibold",
                        ROLE_COLOR[m.role],
                      )}
                    >
                      {m.role}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showModal && project && (
        <InviteModal
          projectId={project.id}
          onClose={() => setShowModal(false)}
          onInvite={inviteMember}
        />
      )}
    </div>
  );
}
