import { Project } from "../models/projectmodels.js";
import { ApiResponse} from "../utils/apiresponse.js";
import { ApiError} from "../utils/apierror.js";
import { asyncHandler} from "../utils/async-handler.js";
import mongoose from "mongoose";
import { Tasks } from "../models/taskmodels.js";
import { subTask } from "../models/subtaskmodels.js";

const createTask = asyncHandler(async(req,res) =>{
    const {title,description,assignedTo,status} = req.body;
    const { projectId} = req.params;

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found!!");
    }

    const files = req.files || [];
    const attatchment =  files.map((file) =>{
        return {
            url : `${process.env.SERVER_URL}/images/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size
        }
    })

    const task = await Tasks.create({
        title,description,status,attatchment,
        assignedTo: assignedTo 
                    ? new mongoose.Types.ObjectId(assignedTo)
                    : undefined,
        assignedBy:new mongoose.Types.ObjectId(req.user._id),
        project:new mongoose.Types.ObjectId(projectId),
    })

    return res.status(200).json(
        new ApiResponse(200, task, "task created successfully!!")
    )
})

const updateTask = asyncHandler(async(req,res) =>{
    const {title,description,assignedTo,status} = req.body;
    const {projectId, taskId} = req.params;

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found!!");
    }

    const task = await Tasks.findOne({
        _id: taskId,
        project: projectId
    });

    if (!task){
        throw new ApiError(404,"task not found!!");
    }

    const updatedTask = await Tasks.findByIdAndUpdate(taskId,
        {
            title: title?? task.title,
            description: description?? task.description,
            assignedTo: assignedTo
                        ? new mongoose.Types.ObjectId(assignedTo)
                        : task.assignedTo,
            status: status?? task.status
        },
        {new:true}
    )

    return res.status(200).json(
        new ApiResponse(200, updatedTask, "task updated successfully!!")
    )

})

const deleteTask = asyncHandler(async(req,res) =>{
    const {projectId,taskId} = req.params;

    const deletedTask = await Tasks.findOneAndDelete({
        _id: taskId,
        project: projectId
    });

    if (!deletedTask){
        throw new ApiError(404,"task not found!!");
    }

    await subTask.deleteMany({
        task: taskId
    });
    
    return res.status(200).json(
        new ApiResponse(200, deletedTask, "task deleted successfully!!")
    )
})

const getTaskDetails = asyncHandler(async(req,res) =>{

    const {projectId} = req.params;
    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found!!");
    }

    const tasks = await Tasks.aggregate([
        {
            $match:{
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"assignedTo",
                foreignField:"_id",
                as:"assignedTo",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:{
                path:"$assignedTo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project:
                {
                    title:1,
                    description:1,
                    status:1,
                    assignedTo:1,
                    attatchment:1
                }
        }
    ])

    if (!tasks.length){
        throw new ApiError(404,"no task found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tasks, "task details fetched successfully"));
})

const getTaskById = asyncHandler(async(req,res) =>{
    const {projectId, taskId} = req.params;

    const task = await Tasks.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(taskId),
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"assignedTo",
                foreignField:"_id",
                as:"assignedTo",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:{
                path:"$assignedTo",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup:{
                from:"subtasks",
                localField:"_id",
                foreignField:"task",
                as:"subtasks",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"assignedTo",
                            foreignField:"_id",
                            as:"assignedTo",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        fullName:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind:{
                            path:"$assignedTo",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project:{
                            title:1,
                            isCompleted:1,
                            assignedTo:1,
                            attatchment:1,
                            createdAt:1,
                            updatedAt:1
                        }
                    }
                ]
            }
        },
        {
            $project:
            {
                title:1,
                description:1,
                status:1,
                assignedTo:1,
                attatchment:1,
                subtasks:1
            }
        }
    ])
    if (!task.length){
        throw new ApiError(404,"task not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200, task[0], "task details fetched successfully"));
})

const createSubTask = asyncHandler(async(req,res)=>{
    const {projectId, taskId} = req.params;
    const {title,assignedTo, isCompleted} = req.body;
    const files = req.files || [];

    const attatchment =  files.map((file) =>{
        return {
            url : `${process.env.SERVER_URL}/images/${file.filename}`,
            mimeType: file.mimetype,
            size: file.size
        }
    })

    const project = await Project.findById(projectId);
    if (!project){
        throw new ApiError(404,"project not found!!");
    }

    const task = await Tasks.findOne({
        _id:taskId,
        project:projectId
    });
    if (!task){
        throw new ApiError(404,"task not found!!");
    }

    const subtask =  await subTask.create({
        title, isCompleted,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        assignedTo: assignedTo
                    ? new mongoose.Types.ObjectId(assignedTo)
                    :undefined,
        task :  new mongoose.Types.ObjectId(taskId),
        attatchment
    })

    return res.status(200).json(
        new ApiResponse(200, subtask, "subTask created successfully!!")
    )
})

const updateSubTask = asyncHandler(async(req,res) =>{
    const {title,assignedTo,isCompleted} = req.body;
    const {subTaskId, projectId, taskId} = req.params;

    const task = await Tasks.findOne({
        _id: taskId,
        project:projectId
    })

    if (!task){
        throw new ApiError(404,"Task not found!");
    }

    const subtask = await subTask.findOne({
        _id: subTaskId,
        task: task._id
    });

    if (!subtask){
        throw new ApiError(404,"subtask not found!!");
    }

    const updatedSubTask = await subTask.findOneAndUpdate({
        _id:subTaskId,
        task:task._id
    },
        {
            title: title ?? subtask.title,
            assignedTo: assignedTo
                        ? new mongoose.Types.ObjectId(assignedTo)
                        : subtask.assignedTo,
            isCompleted : isCompleted?? subtask.isCompleted
        },
        {new:true}
    )

    return res.status(200).json(
        new ApiResponse(200, updatedSubTask, "subtask updated successfully!!")
    )
})

const deleteSubTask = asyncHandler(async(req,res) =>{
    const {projectId, taskId, subTaskId} = req.params;
    const task = await Tasks.findOne({
        _id: taskId,
        project:projectId
    })

    if (!task){
        throw new ApiError(404,"Task not found!");
    }

    const deletedSubtask = await subTask.findOneAndDelete(
        {
            _id:subTaskId,
            task:task._id
        }
    )

    if (!deletedSubtask){
        throw new ApiError(404,"task/subtask may not exist!")
    }

    return res.status(200).json(
        new ApiResponse(200, deletedSubtask, "subTask deleted successfully!!")
    )
})

export {createTask,updateTask,deleteTask,getTaskDetails,getTaskById,createSubTask,updateSubTask,deleteSubTask}
