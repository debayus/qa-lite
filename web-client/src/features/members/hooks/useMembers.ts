import { useState, useEffect } from 'react';
import {
  collection, query, where, getDocs,
  doc, updateDoc, arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/firestore';
import type { Project, UserRole } from '@/types';

export interface MemberDetail {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export function useMembers(project: Project | null) {
  const [members, setMembers] = useState<MemberDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) return;
    const uids = Object.keys(project.members);
    if (uids.length === 0) return;

    setLoading(true);
    const q = query(collection(db, 'users'), where('__name__', 'in', uids));
    getDocs(q).then((snap) => {
      setMembers(
        snap.docs.map((d) => ({
          uid: d.id,
          email: d.data().email ?? '',
          displayName: d.data().displayName ?? d.data().email ?? d.id,
          role: project.members[d.id],
        })),
      );
      setLoading(false);
    });
  }, [project?.id, JSON.stringify(project?.members)]);

  async function inviteMember(projectId: string, email: string, role: UserRole) {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snap = await getDocs(q);
    if (snap.empty) throw new Error('Pengguna tidak ditemukan. Minta mereka mendaftar terlebih dahulu.');

    const targetUid = snap.docs[0].id;
    await updateDoc(doc(db, 'projects', projectId), {
      [`members.${targetUid}`]: role,
      memberIds: arrayUnion(targetUid),
    });
  }

  async function changeMemberRole(projectId: string, uid: string, role: UserRole) {
    await updateDoc(doc(db, 'projects', projectId), {
      [`members.${uid}`]: role,
    });
  }

  return { members, loading, inviteMember, changeMemberRole };
}
