import { User } from "../models/usermodels.js";
import { Project } from "../models/projectmodels.js";
import { ProjectMember } from "../models/project-members-models.js";
import { Tasks } from "../models/taskmodels.js";
import { subTask } from "../models/subtaskmodels.js";
import { projectNotes } from "../models/project-notes-model.js";
import { ApiResponse} from "../utils/apiresponse.js";
import { ApiError} from "../utils/apierror.js";
import { asyncHandler} from "../utils/async-handler.js";
import mongoose, { Mongoose } from "mongoose";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const createProject = asyncHandler(async(req,res)=>{
    const {name, description} = req.body;

    const project = await Project.create({
        name:name,
        description: description,
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    });

    await ProjectMember.create({
        user : new mongoose.Types.ObjectId(req.user._id),
        project : new mongoose.Types.ObjectId(project._id),
        role: UserRolesEnum.ADMIN
    })

    return res.status(201).json(
        new ApiResponse(201, project, "Project created successfully!!")
    )
})

const updateProject = asyncHandler(async(req,res)=>{
    const {name, description} = req.body;
    const {projectId} = req.params;

    const project = await Project.findByIdAndUpdate(projectId,{
        name,description
    },{new:true})

    if (!project){
        throw new ApiError(404,"project not found!!")
    }

    return res.status(200).json(
        new ApiResponse(200, project,"project updated successfully!!")
    )

})

const deleteProject = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;

    const project = await Project.findByIdAndDelete(projectId
        ,{new:true}
    )

    if (!project){
        throw new ApiError(404,"project not found!!")
    }

    const taskIds = await Tasks.find({ project: projectId }).distinct("_id");
    await Promise.all([
        subTask.deleteMany({ task: { $in: taskIds } }),
        Tasks.deleteMany({ project: projectId }),
        projectNotes.deleteMany({ project: projectId }),
        ProjectMember.deleteMany({ project: projectId }),
    ]);

    return res.status(200).json(
        new ApiResponse(200, project,"project deleted successfully!!")
    )
})

const getProjects = asyncHandler(async(req,res)=>{
    const projects = await ProjectMember.aggregate([
        {
            $match:{
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
               from: "projects",
               localField: "project",
               foreignField:"_id",
               as:"projects",
               pipeline:[
                {
                    $lookup: {
                        from:"projectmembers",
                        localField:"_id",
                        foreignField:"project",
                        as:"projectmembers"
                    }
                },
                {
                    $addFields:{
                        members:{
                            $size:"$projectmembers"
                        }
                    }
                }
               ]
            }
        },{
            $unwind: "$projects"
        },{
            $project: {
                projects:{
                    _id:1,
                    name:1,
                    description:1,
                    members:1,
                    createdAt:1,
                    createdBy:1,
                },
                role:1,
                _id:0
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,projects,"Project fetched successfully!")
    );

})

const getProjectMembers = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found!");
    }

    const projectMember = await ProjectMember.aggregate([
        {
            $match:{
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"user",
                foreignField:"_id",
                as:"userInfo",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            username:1,
                            fullName:1,
                            email:1,
                            avatar:1 
                        }
                    }
                ]
            }
        },
        {
            $addFields:{// here addfield doesnt create a new field rather 
                        // it just replaces the old userInfo array with the
                        // first element of userInfo
                userInfo:{
                    $arrayElemAt:["$userInfo",0]
                }
            }
        },
        {
            $project:{
                project:1,
                userInfo:1,
                role:1,
                createdAt:1,
                createdBy:1,
                _id:0
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, projectMember,"projectMembers fetched successdfully!!")
    )
})

const getProjectById = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    const project = await Project.findById(projectId);

    if (!project){
        throw new ApiError(404,"project not found");
    }
    return res.status(200).json(
        new ApiResponse(200, project, "project fetched successfully!!")
    )
})

const addMemberstoProject = asyncHandler(async(req,res)=>{
    const {email,role} = req.body;
    const {projectId} = req.params;

    const user = await User.findOne({email});

    if (!user){
        throw new ApiError(404,"user not found!!")
    }

    const existingProjectMember = await ProjectMember.findOne({
        project:projectId,
        user:user._id
    })

    if (existingProjectMember){
        throw new ApiError(402,"user already member of project!!")
    }

    const projectMember = await ProjectMember.findOneAndUpdate(
        {
            user : new mongoose.Types.ObjectId(user._id),
            project : new mongoose.Types.ObjectId(projectId),
        },
        {
            user : new mongoose.Types.ObjectId(user._id),
            project : new mongoose.Types.ObjectId(projectId),
            role: role || UserRolesEnum.MEMBER
        },
        {   
            new : true,
            upsert:true
        }
    )

    return res.status(201).json(
        new ApiResponse(201,projectMember,"member added successfully!!")
    )
})

const updateMemberRole = asyncHandler(async(req,res)=>{
    const {role} = req.body;
    const {projectId, userId} = req.params; 


    if (!AvailableUserRole.includes(role)){
        throw new ApiError(404,"Role not found!")
    }

    const updatedProjectMember = await ProjectMember.findOneAndUpdate(
        {
            project:new mongoose.Types.ObjectId(projectId),
            user:new mongoose.Types.ObjectId(userId)
        },
        {role:role},
        {new:true}
    )

    if (!updatedProjectMember){
        throw new ApiError(404,"no project member found!");
    }

    return res.status(200).json(
        new ApiResponse(200,updatedProjectMember,"member role updated successfully!!")
    )
})

const deleteMember = asyncHandler(async(req,res)=>{
    const {projectId, userId} = req.params; 

    const deleteProjectMember = await ProjectMember.findOneAndDelete
    ({project:projectId,user: userId})

    if (!deleteProjectMember) {
        throw new ApiError(404, "user is not a member of this project!");
    }

    return res.status(200).json(
        new ApiResponse(200,deleteProjectMember,"member deleted successfully!!")
    )
})

export { createProject , getProjects, getProjectById,
    updateProject,deleteProject,addMemberstoProject,
    getProjectMembers,updateMemberRole,deleteMember
}
