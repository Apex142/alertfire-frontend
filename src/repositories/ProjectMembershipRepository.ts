// src/repositories/ProjectMembershipRepository.ts
import { db } from "@/lib/firebase/client";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { ProjectMemberPermission } from "@/types/enums/ProjectMemberPermission";
import { ProjectMemberRole } from "@/types/enums/ProjectMemberRole";
import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";
import {
  DocumentData,
  DocumentSnapshot,
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { IProjectMembershipRepository } from "./IProjectMembershipRepository";

const MEMBERSHIPS_COLLECTION = "project_memberships";

const mapDocToMembership = (
  docSnap: DocumentSnapshot<DocumentData>
): ProjectMembership => {
  const data = docSnap.data();
  if (!data) {
    throw new Error(
      `No data found for project membership document ${docSnap.id}`
    );
  }
  return {
    id: docSnap.id,
    projectId: data.projectId,
    userId: data.userId,
    role: data.role as ProjectMemberRole,
    permission: data.permission as ProjectMemberPermission,
    joinedAt: data.joinedAt as Timestamp,
    invitedBy: data.invitedBy,
    status: data.status as ProjectMemberStatus,
    leftAt: data.leftAt instanceof Timestamp ? data.leftAt : null,
  };
};

export class ProjectMembershipRepository
  implements IProjectMembershipRepository
{
  private membershipsCollectionRef = collection(db, MEMBERSHIPS_COLLECTION);

  async findById(membershipId: string): Promise<ProjectMembership | null> {
    if (!membershipId || typeof membershipId !== "string") {
      return null;
    }
    const docRef = doc(db, MEMBERSHIPS_COLLECTION, membershipId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? mapDocToMembership(docSnap) : null;
  }

  async findByProjectAndUser(
    projectId: string,
    userId: string
  ): Promise<ProjectMembership | null> {
    if (!projectId || !userId) return null;
    const q = query(
      this.membershipsCollectionRef,
      where("projectId", "==", projectId),
      where("userId", "==", userId),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return mapDocToMembership(snapshot.docs[0]);
    }
    return null;
  }

  async findUserMemberships(userId: string): Promise<ProjectMembership[]> {
    if (!userId || typeof userId !== "string") return [];
    const q = query(
      this.membershipsCollectionRef,
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => mapDocToMembership(docSnap));
  }

  async findProjectMembers(projectId: string): Promise<ProjectMembership[]> {
    if (!projectId || typeof projectId !== "string") return [];
    const q = query(
      this.membershipsCollectionRef,
      where("projectId", "==", projectId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => mapDocToMembership(docSnap));
  }

  async create(
    data: Omit<ProjectMembership, "id">
  ): Promise<ProjectMembership> {
    if (!data.projectId || !data.userId) {
      throw new Error(
        "projectId and userId are required to create a project membership."
      );
    }
    const docRef = await addDoc(this.membershipsCollectionRef, data);
    const newDocSnap = await getDoc(docRef);
    if (!newDocSnap.exists()) {
      throw new Error(
        "Failed to create project membership or retrieve it after creation."
      );
    }
    return mapDocToMembership(newDocSnap);
  }

  async update(
    membershipId: string,
    data: Partial<
      Omit<
        ProjectMembership,
        "id" | "projectId" | "userId" | "joinedAt" | "invitedBy"
      >
    >
  ): Promise<ProjectMembership | null> {
    if (!membershipId) return null;
    const docRef = doc(db, MEMBERSHIPS_COLLECTION, membershipId);
    await updateDoc(docRef, data);
    const updatedDocSnap = await getDoc(docRef);
    return updatedDocSnap.exists() ? mapDocToMembership(updatedDocSnap) : null;
  }

  async delete(membershipId: string): Promise<void> {
    if (!membershipId) return;
    const docRef = doc(db, MEMBERSHIPS_COLLECTION, membershipId);
    await deleteDoc(docRef);
  }
}
