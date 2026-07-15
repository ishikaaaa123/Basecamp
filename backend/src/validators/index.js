import { body } from "express-validator";
import {AvailableUserRole, AvailableTaskStatus} from "../utils/constants.js";

const userRegValidator = ()=>{
    return  [
        body("email").trim().notEmpty().withMessage("Email is reqd").isEmail().withMessage("Email is invalid!") ,
        body("username").trim().notEmpty().withMessage("username is reqd").withMessage("username must be in lowercase!!").isLength({min:3}).withMessage("username must be >3 length") ,
        body("password").trim().notEmpty().withMessage("pwd is reqd") ,
        body("fullName").optional().trim()
    ]
}

const userLoginValidator = ()=>{
    return [
        body("email").optional().isEmail().withMessage("email mot valid"),
        body("password").notEmpty().withMessage("pwd is empty!!!")
    ]
}

const userChangeCurrentValidator = ()=>{
    return [
        body("oldPassword").notEmpty().withMessage("password must not be empty!"),
        body("newPassword").notEmpty().withMessage("password must not be empty!")
    ]
}
const userForgotPasswordValidator = ()=>{
    return  [
        body("email").trim().notEmpty().withMessage("Email is reqd").isEmail().withMessage("Email is invalid!") ,
    ]
}

const userResetForgotPasswordValidator = ()=>{
    return [
        body("newPassword").notEmpty().withMessage("password must not be empty!")
    ]
}

const createProjectValidator = ()=>{
    return [
        body("name").trim().notEmpty().withMessage("Project must have a name!!"),
        body("description").optional().trim()
    ]
}

const addMemberstoProjectValidator = ()=>{
    return [
        body("role").trim().notEmpty().withMessage("member must have a role!!").isIn(AvailableUserRole).withMessage("role is invalid"),
        body("email").trim().notEmpty().withMessage("Email is reqd").isEmail().withMessage("Email is invalid!") ,
    ]
}

const createTaskValidator = ()=>{
    return [
        body("title").trim().notEmpty().withMessage("task must have a title!!"),
        body("description").optional().trim(),
        body("assignedTo").notEmpty().withMessage("task must have an assignee!!"),
        body("status").optional().isIn(AvailableTaskStatus).withMessage("status is invalid")

    ]    
}

const updateTaskValidator = ()=>{
    return [
        body("title").optional().trim().notEmpty().withMessage("task title cannot be empty!!"),
        body("description").optional().trim(),
        body("assignedTo").optional().notEmpty().withMessage("assignedTo cannot be empty!!"),
        body("status").optional().isIn(AvailableTaskStatus).withMessage("status is invalid")
    ]
}

const createSubTaskValidator = ()=>{
    return [
        body("title").trim().notEmpty().withMessage("subtask must have a title!!"),
        body("isCompleted").optional().isBoolean().withMessage("subtask status must be boolean"),
        body("assignedTo").notEmpty().withMessage("subtask must have an assignee!!"),
    ]

}

const updateSubTaskValidator = ()=>{
    return [
        body("title").optional().trim().notEmpty().withMessage("subtask title cannot be empty!!"),
        body("isCompleted").optional().isBoolean().withMessage("subtask status must be boolean"),
        body("assignedTo").optional().notEmpty().withMessage("assignedTo cannot be empty!!"),
    ]
}

const createNoteValidator = ()=>{
    return [
        body("content").trim().notEmpty().withMessage("note must have content!!"),
    ]
}

export {createNoteValidator,updateTaskValidator, updateSubTaskValidator, createTaskValidator, createSubTaskValidator,addMemberstoProjectValidator,createProjectValidator, userResetForgotPasswordValidator,userForgotPasswordValidator,userChangeCurrentValidator,userRegValidator, userLoginValidator}; 
