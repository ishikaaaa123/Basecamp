import {Router} from "express";
import { verifyJWT } from "../middleware/auth-middleware.js";
import {addMemberstoProjectValidator,createProjectValidator} from "../validators/index.js"
import { createProject , getProjects, getProjectById,
    updateProject,deleteProject,addMemberstoProject,
    getProjectMembers,updateMemberRole,deleteMember
} from "../controllers/project-controller.js";
import {validateProjectPerms} from "../middleware/auth-middleware.js"
import { validate } from "../middleware/validator-middleware.js";
import {AvailableUserRole, UserRolesEnum} from "../utils/constants.js";

const router = Router();
router.use(verifyJWT);

router.route("/")
      .get(getProjects)
      .post(createProjectValidator(),validate,createProject)
                        
router.route("/:projectId")
      .get(validateProjectPerms(AvailableUserRole), getProjectById)
      .put(validateProjectPerms([UserRolesEnum.ADMIN]),
            createProjectValidator(),validate,updateProject)
      .delete(validateProjectPerms([UserRolesEnum.ADMIN]) , deleteProject)

router.route("/:projectId/members")
      .get(validateProjectPerms(AvailableUserRole), getProjectMembers)
      .post(validateProjectPerms([UserRolesEnum.ADMIN]),addMemberstoProjectValidator(),validate,addMemberstoProject)

router.route("/:projectId/members/:userId")
      .put(validateProjectPerms([UserRolesEnum.ADMIN]),updateMemberRole)
      .delete(validateProjectPerms([UserRolesEnum.ADMIN]),deleteMember)
      
export default router;  
