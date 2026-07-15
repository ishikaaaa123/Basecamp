import { User } from "../models/usermodels.js";
import { ApiResponse} from "../utils/apiresponse.js";
import { ApiError} from "../utils/apierror.js";
import { asyncHandler} from "../utils/async-handler.js";
import { sendEmail,emailVerifyMailgenContent } from "../utils/mailgen.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { forgotPassowrdMailgenContent } from "../utils/mailgen.js";

const generateRefreshandAccessToken = async (userId)=>{
    try {
        const user = await User.findById(userId);
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});
        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something is wrong on backened!!!!");
    }        
}
 
const registerUser = asyncHandler( async (req,res)=>{
    const {email,username,password,role} = req.body;
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    //User -> This is like the tool/class used to talk to the users collection.

    if (existedUser){
        throw new ApiError(409,"This user already exists");
    }

    const user = await User.create({
        email,password,username,
        isEmailVerified:false 
    }) 

    const {unHashedToken, HashedToken, TokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = HashedToken;
    user.emailVerificationExpiry = TokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendEmail({
        email: user?.email,
        subject:"Please verify your email",
        mailgenContent : emailVerifyMailgenContent(user.username,  `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`),
    })                                                              //http              localhost                          

    const createdUser =  await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken  -emailVerificationExpiry"
    )

    if (!createdUser){
        throw new ApiError(500,"Smth went wrong in registering the user!!");
    }

    return res.status(200)
              .json(
                new ApiResponse(200,
                    {user:username},
                    "User registered successfully and verification email is sent!!"
                 )
              )
});

const login = asyncHandler(async (req,res)=>{
    const {username, password, email} = req.body;

    if (!email){
        throw new ApiError(400,"email is reqd");
    }
    const user = await User.findOne({email});
    if (!user){
        throw new ApiError(400, "user doesnt exist");
    }

    const pwdvalid  = await user.isPasswordCorrect(password);

    if (!pwdvalid){
        throw new ApiError(400,"pwd incorrect");
    }

    const {accessToken,refreshToken} = await generateRefreshandAccessToken(user._id);

    const loggedInUser =  await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken  -emailVerificationExpiry"
    );

    const options = {
        httpOnly : true,
        secure : true,
    }
    //These are cookie options.
    //  They control how the browser stores and sends the cookie.
    // httpOnly -> dom cant access cookie using document.cookie
    // secure -> allows only cookie transmission via https not http

    return res.status(200)
              .cookie("accessToken",accessToken,options)
              .cookie("refreshToken", refreshToken,options)
              .json(
                new ApiResponse(200,
                    {
                        user:username,
                        accessToken,
                        refreshToken,
                    },"User loggedin successfully"
                )
              )
})

const logout = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true
        }
    )
    const options = {
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
              .json(
                new ApiResponse(200,{},"User logout successfully!!")
              )
})

const currentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,req.user.username,"current user feteched successfully!!")
    )
})

const verifyEmail = asyncHandler(async(req,res)=>{
    const { verificationToken } = req.params;
    if (!verificationToken){
        throw new ApiError(400,"Email ver token is missing!!");
    }

    let HashedToken = crypto.createHash("sha256")
                                  .update(verificationToken)
                                  .digest("hex");
    
    const user = await User.findOne({
        emailVerificationToken: HashedToken,
        emailVerificationExpiry: {$gt:Date.now()}
    })

    if (!user){
        throw new ApiError(400,"Email ver token is invalid or expired!!");
    }

    user.isEmailVerified = true;
    user.emailVerificationToken ="";
    user.emailVerificationExpiry ="";

    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,{isEmailVerified:true},"email verified successfully!")
    )
})

const resendEmailVerification = asyncHandler(async(req,res)=>{
    const user =  await User.findById(req.user?._id);
    if (!user){
        throw new ApiError(404,"user not found!");
    }

    if (user.isEmailVerified){
        throw new ApiError(409,"user already verified!");
    }

    const {unHashedToken, HashedToken, TokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = HashedToken;
    user.emailVerificationExpiry = TokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendEmail({
        email: user?.email,
        subject:"Please verify your email ji",
        mailgenContent : emailVerifyMailgenContent(user.username,  `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`),
    })                                                              //http              localhost                          

    return res.status(200).json(
        new ApiResponse(200,{},"Email resend done")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.body.refreshToken;
    if (!incomingRefreshToken){
        throw new ApiError(404,"refresh token not found!");
    }

   try {
       const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
       const user =  await User.findById(decodedToken?._id);
       if (!user){
        throw new ApiError(404,"user not found!");
       }
       const dbRT = user.refreshToken;
       if (dbRT !== incomingRefreshToken){
            throw new ApiError(401,"refresh token expired too");
       }

       const options = {
        httpOnly:true,
        secure:true
       }

       const {accessToken, refreshToken : newRefreshToken} = await generateRefreshandAccessToken(user._id);
       user.refreshToken = newRefreshToken;
       await user.save();

       return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options)
                 .json(
        new ApiResponse(200,{},"access token regenerated successfully!!")
       )

   } catch (error) {
        throw new ApiError(401,"invalid refresh token");
   }
})

const forgotPassword = asyncHandler(async(req,res)=>{
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    const {unHashedToken, HashedToken, TokenExpiry} = user.generateTemporaryToken();

    user.forgotPasswordToken = HashedToken;
    user.forgotPasswordexpiry = TokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendEmail({
        email: user?.email,
        subject:"Please reset your password ji",
        mailgenContent : forgotPassowrdMailgenContent(user.username,`${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`),
    })                                                              //http              localhost                          

    return res.status(200).json(
        new ApiResponse(200,{},"Password reset email has been sent successfully!!")
    )
})

const resetForgotPassword = asyncHandler(async(req,res)=>{
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken:hashedToken,
        forgotPasswordexpiry: {$gt:Date.now()}
    })

    if (!user){
        throw new ApiError(404,"user not found as maybe token expired or invalid!!");
    }

    user.forgotPasswordToken = undefined;
    user.forgotPasswordexpiry = undefined;
    user.password = newPassword;

    await user.save({validateBeforeSave:false});

    return res.status(200).json(
        new ApiResponse(200,{newPassword},"password reset successfully!")
    )
})
 
const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user?._id);
    if (!user){
        throw new ApiError(404,"user not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid){
        throw new ApiError(402,"password is incorrect!");
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json(
        new ApiResponse(200,{newPassword},"password changed successfully!!")
    )
})

export {resetForgotPassword,changeCurrentPassword,forgotPassword,registerUser, resendEmailVerification,login, logout,currentUser, verifyEmail,refreshAccessToken};











