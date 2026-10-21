import { Request } from 'express';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface AuthUserPayload {
  userId: string;
  email: string;
}

export interface TeamMembershipPayload {
  teamId: string;
  role: UserRole;
}

// Extended Request type with optional membership context
export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
  membership?: TeamMembershipPayload;
}