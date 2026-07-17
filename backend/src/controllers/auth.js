import { User } from "../models/usermodels.js";
import { ApiResponse} from "../utils/apiresponse.js";
import { ApiError} from "../utils/apierror.js";
import { asyncHandler} from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

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
    const {email,username,password,fullName} = req.body;
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    //User -> This is like the tool/class used to talk to the users collection.

    if (existedUser){
        throw new ApiError(409,"This user already exists");
    }

    const user = await User.create({ email, username, fullName, password });
    const { accessToken, refreshToken } = await generateRefreshandAccessToken(user._id);
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res.status(200)
              .cookie("accessToken", accessToken, options)
              .cookie("refreshToken", refreshToken, options)
              .json(
                new ApiResponse(200,
                    { _id: user._id, email: user.email, accessToken, refreshToken },
                    "Account created successfully."
                 )
              )
});

const login = asyncHandler(async (req,res)=>{
    const { password, email } = req.body;

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
                        user:user.username,
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
        new ApiResponse(200,{
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            fullName: req.user.fullName,
            avatar: req.user.avatar,
        },"current user fetched successfully!!")
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

export {changeCurrentPassword,registerUser,login, logout,currentUser,refreshAccessToken};


