import mongoose, {Schema} from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";

const subTaskSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    task:{
        type: Schema.Types.ObjectId,
        ref:"Tasks",
        required:true
    },
    isCompleted:{
        type:Boolean,
        default:false
    },
    assignedBy:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    assignedTo:{
        type: Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
   
    attachments:{
        type:[
            {
                url:String,
                mimeType: String,
                size: Number
            }
        ],
        default:[]
    }

},{timestamps:true})

export const subTask = mongoose.model("subTask",subTaskSchema);
