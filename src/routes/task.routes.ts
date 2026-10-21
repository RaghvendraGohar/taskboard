import { Router } from 'express';
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from '../controllers/task.controller';
import { validateBody, validateQuery } from '../middleware/validate.middleware';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../shared/schemas';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect); // Protect all task endpoints

router.post('/', validateBody(createTaskSchema), createTask);
router.get('/', validateQuery(taskQuerySchema), getTasks);
router.get('/:id', getTaskById);
router.patch('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;