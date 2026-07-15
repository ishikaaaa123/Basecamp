import { ApiResponse } from "../utils/apiresponse.js";

// const healthCheck = (req,res,next)=>{
//     try {

//         res.status(200)
//         .json(new ApiResponse(200,{message:"Server running jii"}));
//     }catch (error) {
//         next(error);
//     }
// } 

import { asyncHandler } from "../utils/async-handler.js";

const myController = async (req, res) => {
    res.status(200).json({ message: "OK" });
  };
  
const healthCheck = asyncHandler(myController);

export {healthCheck};