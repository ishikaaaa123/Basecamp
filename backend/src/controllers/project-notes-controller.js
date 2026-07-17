import { Project } from "../models/projectmodels.js";
import { projectNotes } from "../models/project-notes-model.js";
import { ApiResponse } from "../utils/apiresponse.js";
import { ApiError } from "../utils/apierror.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";
import { UserRolesEnum } from "../utils/constants.js";

const canManageNote = (note, req) =>
  note.createdBy.equals(new mongoose.Types.ObjectId(req.user._id)) ||
  [UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN].includes(req.user.role);

const getProjectNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const notes = await projectNotes.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        _id: 1,
        project: 1,
        createdBy: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Project notes fetched successfully!"));
});

const createProjectNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { content } = req.body;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const note = await projectNotes.create({
    content,
    project: projectId,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, note, "project note created successfully"));
});

const updateProjectNotes = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { projectId, noteId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const existingNote = await projectNotes.findOne({
    _id: noteId,
    project: projectId,
  });

  if (!existingNote) {
    throw new ApiError(404, "note not found");
  }
  if (!canManageNote(existingNote, req)) {
    throw new ApiError(403, "You can only edit your own notes.");
  }

  const note = await projectNotes.findByIdAndUpdate(
    noteId,
    { content },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, note, "project note updated successfully"));
});

const deleteProjectNotes = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "project not found");
  }

  const note = await projectNotes.findOne({ _id: noteId, project: projectId });

  if (!note) {
    throw new ApiError(404, "note not found");
  }
  if (!canManageNote(note, req)) {
    throw new ApiError(403, "You can only delete your own notes.");
  }

  await note.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, note, "project note deleted successfully"));
});

const getProjectNotesById = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const note = await projectNotes.findOne({
    project: projectId,
    _id: noteId,
  });

  if (!note) {
    throw new ApiError(404, "note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "project note fetched successfully!!"));
});

export {
  getProjectNotes,
  createProjectNotes,
  updateProjectNotes,
  deleteProjectNotes,
  getProjectNotesById,
};
