import { Project } from "../models/projectmodels.js";
import { projectNotes } from "../models/project-notes-model.js";
import { ApiResponse} from "../utils/apiresponse.js";
import { ApiError} from "../utils/apierror.js";
import { asyncHandler} from "../utils/async-handler.js";
import mongoose from "mongoose";

const getProjectNotes = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;

    const notes = await projectNotes.aggregate([
        {
        $match:{
            project:new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"createdBy",
                foreignField:"_id",
                as:"createdBy",
                pipeline:[{
                    $project:{
                        username:1,
                        email:1
                    }
            }]
            }
        },
        {
            $unwind:"$createdBy"
        },
        {
            $project:{
                project:1,
                createdBy:1,
                content:1,
                _id:0
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,notes,"Project notes fetched successfully!")
    );
})

const createProjectNotes = asyncHandler(async(req,res)=>{
    const {projectId} = req.params;
    const {content} = req.body;

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found")
    }
    
    const note = await projectNotes.create({
        content , 
        project:projectId,
        createdBy:  new mongoose.Types.ObjectId(req.user._id)
    }) 

    return res.status(200).json(
        new ApiResponse(200, note, "project note created successfully")
    )
})

const updateProjectNotes = asyncHandler(async(req,res)=>{
    const {content} = req.body;
    const {projectId, noteId} = req.params;

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found")
    }

    const note = await projectNotes.findOneAndUpdate({
            _id: noteId,
            project: projectId
        },
        {
            content:content
        },{new:true}
    )

    if (!note){
        throw new ApiError(404,"note not found")
    }
    
    return res.status(200).json(
        new ApiResponse(200, note, "project note updated successfully")
    )
})

const deleteProjectNotes = asyncHandler(async(req,res)=>{
    const {projectId,noteId} = req.params;

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found")
    }

    const note = await projectNotes.findOneAndDelete({
        _id: noteId,
        project: projectId
    });

    if (!note){
        throw new ApiError(404,"note not found")
    }

    return res.status(200).json(
        new ApiResponse(200, note, "project note deleted successfully")
    )
})

const getProjectNotesById = asyncHandler(async(req,res)=>{
    const {projectId, noteId} = req.params;

    const note = await projectNotes.findOne(
        {
            project:projectId,
            _id:noteId
        }
    )
    
    if (!note){
        throw new ApiError(404,"note not found")
    }

    return res.status(200).json(
        new ApiResponse(200, note, "project note fetched successfully!!")
    )
})

export {getProjectNotes,createProjectNotes,updateProjectNotes,deleteProjectNotes,getProjectNotesById}
