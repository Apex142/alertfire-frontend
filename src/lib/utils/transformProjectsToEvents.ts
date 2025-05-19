import { Project } from '@/types/project';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string;
  status: string;
  project: Project;
}

export function transformProjectsToEvents(projects: Project[]): CalendarEvent[] {
  return projects.map(project => ({
    id: project.id,
    title: project.name,
    start: project.startDate.toDate(),
    end: project.endDate.toDate(),
    color: project.color,
    status: project.status,
    project
  }));
} 