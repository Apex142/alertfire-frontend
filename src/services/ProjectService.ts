import { IProjectMembershipRepository } from "@/repositories/IProjectMembershipRepository";
import { IProjectRepository } from "@/repositories/IProjectRepository";
import { ProjectMembershipRepository } from "@/repositories/ProjectMembershipRepository";
import { ProjectRepository } from "@/repositories/ProjectRepository";
import { Project, ProjectDayPlanning } from "@/types/entities/Project";
import { ProjectMembership } from "@/types/entities/ProjectMembership";
import { ProjectMemberPermission } from "@/types/enums/ProjectMemberPermission";
import { ProjectMemberRole } from "@/types/enums/ProjectMemberRole";
import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";
import { ProjectPrivacy } from "@/types/enums/ProjectPrivacy";
import { ProjectStatus } from "@/types/enums/ProjectStatus";
import { serverTimestamp, Timestamp } from "firebase/firestore";

// Interface UI (mise à jour pour planning)
export interface CreateProjectData {
  projectName: string;
  acronym?: string | null;
  description?: string | null;
  color: string;
  companyId: string;
  startDate: Date;
  endDate?: Date | null;
  privacy: ProjectPrivacy;
  status: ProjectStatus;
  tags?: string[] | null;
  coverImageUrl?: string | null;
  dayPlannings?: ProjectDayPlanning[]; // <-- planning par jour !
}

export class ProjectService {
  private projectRepository: IProjectRepository;
  private projectMembershipRepository: IProjectMembershipRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.projectMembershipRepository = new ProjectMembershipRepository();
  }

  async createProject(
    projectUiData: CreateProjectData,
    createdByUid: string
  ): Promise<Project> {
    const now = serverTimestamp() as Timestamp;

    const newProjectDataToStore: Omit<Project, "id"> = {
      projectName: projectUiData.projectName,
      acronym: projectUiData.acronym || null,
      description: projectUiData.description || null,
      color: projectUiData.color,
      companyId: projectUiData.companyId,
      startDate: Timestamp.fromDate(projectUiData.startDate),
      endDate: projectUiData.endDate
        ? Timestamp.fromDate(projectUiData.endDate)
        : Timestamp.fromDate(projectUiData.startDate),
      privacy: projectUiData.privacy,
      status: projectUiData.status,
      tags: projectUiData.tags || [],
      coverImageUrl: projectUiData.coverImageUrl || null,
      createdBy: createdByUid,
      createdAt: now,
      updatedAt: now,
      archived: false,
      deleted: false,
      membersCount: 1, // Le créateur
      dayPlannings: projectUiData.dayPlannings || [], // <-- Ajout planning ou tableau vide
    };

    const createdProject = await this.projectRepository.create(
      newProjectDataToStore
    );
    console.log("ProjectService: Project document created:", createdProject.id);

    if (createdProject && createdProject.id) {
      // Créer l'appartenance pour le créateur
      const membershipDataForCreator: Omit<ProjectMembership, "id"> = {
        projectId: createdProject.id,
        userId: createdByUid,
        role: ProjectMemberRole.PROJECT_MANAGER,
        permission: ProjectMemberPermission.MANAGER,
        invitedBy: createdByUid,
        status: ProjectMemberStatus.APPROVED,
        joinedAt: now,
        leftAt: null,
      };
      await this.projectMembershipRepository.create(membershipDataForCreator);
      console.log(
        "ProjectService: Creator membership document created for project:",
        createdProject.id
      );
    } else {
      throw new Error(
        "La création du projet a échoué ou n'a pas retourné un projet valide avec un ID."
      );
    }
    return createdProject;
  }

  async getProjectById(projectId: string): Promise<Project | null> {
    if (!projectId) {
      console.warn("ProjectService: getProjectById called with no projectId.");
      return null;
    }
    try {
      const project = await this.projectRepository.findById(projectId);
      if (!project || project.deleted) {
        return null;
      }
      return project;
    } catch (error) {
      console.error(
        `ProjectService: Error fetching project ${projectId}:`,
        error
      );
      throw error;
    }
  }
}

export const projectService = new ProjectService();
