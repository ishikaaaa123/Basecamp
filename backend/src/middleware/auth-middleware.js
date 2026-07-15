import { User } from "../models/usermodels.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import { ProjectMember } from "../models/project-members-models.js";
import { Project } from "../models/projectmodels.js";
import mongoose, { Mongoose } from "mongoose";

export const verifyJWT = asyncHandler(async(req,res,next) =>{
    const token =  req.cookies?.accessToken || 
            req.header("Authorization")?.replace("Bearer ","");

    if (!token){
        throw new ApiError(401,"unauthorized request!!");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken  -emailVerificationExpiry");
        if (!user){
            throw new ApiError(401,"Invalid AT");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error.message);
    }
})

export const validateProjectPerms = (roles = [])=>{
    return asyncHandler(async(req,res,next)=>{
        const {projectId} = req.params;

        if (!projectId){
            throw new ApiError(404,"no such project id found")
        }

        const project = await ProjectMember.findOne(
            {
                project: new mongoose.Types.ObjectId(projectId),
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        )

        if (!project){
            throw new ApiError(404,"no such project found")
        }

        let givenRole = project?.role;
        req.user.role = givenRole;

        if (!roles.includes(givenRole)){
            throw new ApiError(403,"you dont have perms to access this action")
        }
        
        next();

    })
}   
