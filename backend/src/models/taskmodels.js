import mongoose, {Schema} from "mongoose";
import { AvailableTaskStatus, TaskStatusEnum } from "../utils/constants.js";

const taskSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    project:{
        type: Schema.Types.ObjectId,
        ref:"Project",
        required:true
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
    status:{
        type:String,
        enum:AvailableTaskStatus,
        default:TaskStatusEnum.TODO
    },
    attatchment:{
        type:[
            {
                url:String,
                mimeType: String,
                size: Number
            }
        ],
        default:[]

    }
})

export const Tasks = mongoose.model("Tasks",taskSchema);
