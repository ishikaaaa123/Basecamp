import express from "express";
import cors from "cors";
const app = express();
import cookieParser from "cookie-parser";
//middleware config
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// CORS config: allow the frontend dev-server origins listed in CORS_ORIGIN.
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials:true,
    methods: ["GET","POST","DELETE","PUT","PATCH","OPTIONS"],
    allowedHeaders:["Authorization","Content-Type"],
}))

import healthCheckRouter from "./routes/healthcheck-route.js";
import userAuthRouter from "./routes/authroute.js";
import projectRouter from "./routes/project-route.js";
import taskRouter from "./routes/task-route.js";
import notesRouter from "./routes/project-note-route.js"

app.use("/api/v1/healthcheck",healthCheckRouter);
app.use("/api/v1/auth",userAuthRouter);
app.use("/api/v1/projects",projectRouter);
app.use("/api/v1/tasks",taskRouter);
app.use("/api/v1/notes",notesRouter);

app.get("/", (req,res)=>{
    res.send("hello from main page")
})

app.use((err, req, res, next)=>{
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        statusCode,
        data: err.data || null,
        message: err.message || "Something went wrong",
        success: false,
        errors: err.errors || []
    })
})

export default app; 
