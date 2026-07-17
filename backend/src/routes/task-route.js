import { Router } from "express";
import { verifyJWT } from "../middleware/auth-middleware.js";
import {
  createTaskValidator,
  createSubTaskValidator,
  updateTaskValidator,
  updateSubTaskValidator,
} from "../validators/index.js";
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskDetails,
  getTaskById,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task-controller.js";
import { validateProjectPerms } from "../middleware/auth-middleware.js";
import { validate } from "../middleware/validator-middleware.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";
import { upload } from "../middleware/multer-middleware.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/:projectId")
  .get(validateProjectPerms(AvailableUserRole), getTaskDetails)
  .post(
    validateProjectPerms([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    upload.array("attachments", 5),
    createTaskValidator(),
    validate,
    createTask,
  );

router
  .route("/:projectId/t/:taskId")
  .get(validateProjectPerms(AvailableUserRole), getTaskById)
  .put(
    validateProjectPerms(AvailableUserRole),
    updateTaskValidator(),
    validate,
    updateTask,
  )
  .delete(
    validateProjectPerms([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteTask,
  );

router
  .route("/:projectId/t/:taskId/subtasks")
  .post(
    validateProjectPerms([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    upload.array("attachments", 5),
    createSubTaskValidator(),
    validate,
    createSubTask,
  );

router
  .route("/:projectId/t/:taskId/subtasks/:subTaskId")
  .put(
    validateProjectPerms(AvailableUserRole),
    updateSubTaskValidator(),
    validate,
    updateSubTask,
  )
  .delete(
    validateProjectPerms([UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN]),
    deleteSubTask,
  );

export default router;
