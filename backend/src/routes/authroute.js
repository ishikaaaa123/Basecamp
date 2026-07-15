import {Router} from "express";
import { changeCurrentPassword, forgotPassword, registerUser } from "../controllers/auth.js";
import { validate } from "../middleware/validator-middleware.js";
import { userLoginValidator, userRegValidator,userResetForgotPasswordValidator,userForgotPasswordValidator,userChangeCurrentValidator } from "../validators/index.js";
import { login } from "../controllers/auth.js";
import { verifyJWT } from "../middleware/auth-middleware.js";
import {resetForgotPassword, logout,currentUser,verifyEmail,resendEmailVerification,refreshAccessToken} from "../controllers/auth.js";
const router = Router();

//unsecure routes
router.route("/register").post(userRegValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(),validate, login);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPassword);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,resetForgotPassword);

//secure routes
router.route("/logout").post(verifyJWT,logout);
router.route("/current-user").get(verifyJWT,currentUser);
router.route("/currentUser").post(verifyJWT,currentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentValidator(),validate,changeCurrentPassword);
router.route("/resend-email-verification").post(resendEmailVerification);

export default router;  
