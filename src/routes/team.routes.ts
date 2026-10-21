import { Router } from 'express';
import { createTeam, getMyTeams, addTeamMember, createTeamSchema, addMemberSchema } from '../controllers/team.controller';
import { protect } from '../middleware/auth.middleware';
import { verifyTeamAccess } from '../middleware/rbac.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(protect); // Require authentication for all team routes

router.post('/', validateBody(createTeamSchema), createTeam);
router.get('/', getMyTeams);
router.post('/:teamId/members', verifyTeamAccess(['ADMIN', 'MANAGER']), validateBody(addMemberSchema), addTeamMember);

export default router;