import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config({
  path: "./.env",
});

// Load the Express app only after environment variables are available.
const { default: app } = await import("./app.js");
 
const port = process.env.PORT || 3000;
console.log("index.js started");
console.log("Calling connectDB...");
connectDB()
        .then(()=>{
          app.listen(port, () => {
            console.log(`API server listening on port ${port}`)
          })
        })
        .catch((err) =>{
          console.error("mongodb error",err);
          process.exit(1); 
        })
