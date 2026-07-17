import {Router} from "express";
import { changeCurrentPassword, currentUser, login, logout, refreshAccessToken, registerUser } from "../controllers/auth.js";
import { validate } from "../middleware/validator-middleware.js";
import { userLoginValidator, userRegValidator,userChangeCurrentValidator } from "../validators/index.js";
import { verifyJWT } from "../middleware/auth-middleware.js";
const router = Router();

//unsecure routes
router.route("/register").post(userRegValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(),validate, login);
router.route("/refresh-token").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJWT,logout);
router.route("/current-user").get(verifyJWT,currentUser);
router.route("/currentUser").post(verifyJWT,currentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentValidator(),validate,changeCurrentPassword);

export default router;  
