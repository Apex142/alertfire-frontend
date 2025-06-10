import { ProjectMemberStatus } from "@/types/enums/ProjectMemberStatus";
import { z } from "zod";

export const InvitationSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  technicianUid: z.string().min(1),
  invitedByUid: z.string().min(1),
  role: z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    icon: z.string().optional(),
    category: z.string().optional(),
    priority: z.number().optional(),
  }),
  linkType: z.enum(["project", "events"]),
  selectedEvents: z.array(z.string()).optional(),
  status: z.nativeEnum(ProjectMemberStatus),
});

export type InvitationDto = z.infer<typeof InvitationSchema>;
