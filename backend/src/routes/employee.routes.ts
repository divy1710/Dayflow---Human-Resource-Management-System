import { Router } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from '../controllers/employee.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeByIdSchema,
} from '../validators/employee.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Employee statistics
router.get('/stats', getEmployeeStats);

// CRUD operations
router.post('/', validate(createEmployeeSchema), createEmployee);
router.get('/', getAllEmployees);
router.get('/:id', validate(getEmployeeByIdSchema), getEmployeeById);
router.put('/:id', validate(getEmployeeByIdSchema), validate(updateEmployeeSchema), updateEmployee);
router.delete('/:id', validate(getEmployeeByIdSchema), deleteEmployee);

export default router;
