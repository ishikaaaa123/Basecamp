import { validationResult } from "express-validator";
import { ApiError } from "../utils/apierror.js";

// middleware-> u will get a file, process it and find out errors from it
// middleware -> validation ->routes

export const validate = (req,res,next)=>{
    const errors =  validationResult(req);
    if (errors.isEmpty()){
        return next();
    }else{
        const extractedErrors = [];
        errors.array().map( (err)=> extractedErrors.push({
            [err.path] : err.msg
        })
    );
    throw new ApiError(422,"Received data is invalid", extractedErrors);
    } 
}