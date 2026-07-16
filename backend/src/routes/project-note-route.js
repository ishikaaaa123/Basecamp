import {Router} from "express";
import { verifyJWT } from "../middleware/auth-middleware.js";
import {createNoteValidator} from "../validators/index.js"
import { getProjectNotes,createProjectNotes,updateProjectNotes,deleteProjectNotes,getProjectNotesById} from "../controllers/project-notes-controller.js";
import {validateProjectPerms} from "../middleware/auth-middleware.js"
import { validate } from "../middleware/validator-middleware.js";
import {AvailableUserRole, UserRolesEnum} from "../utils/constants.js";


const router = Router();
router.use(verifyJWT);

router.route("/:projectId")
      .get(validateProjectPerms(AvailableUserRole),getProjectNotes)
      .post(validateProjectPerms(AvailableUserRole), createNoteValidator(), validate, createProjectNotes);

router.route("/:projectId/n/:noteId")
      .get(validateProjectPerms(AvailableUserRole), getProjectNotesById)
      .put(validateProjectPerms(AvailableUserRole), createNoteValidator(), validate, updateProjectNotes)
      .delete(validateProjectPerms(AvailableUserRole), deleteProjectNotes);

export default router;
