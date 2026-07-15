import mongoose, { Schema } from "mongoose";

// Registration details are held separately until the email owner proves access
// to the address. This ensures the users collection contains verified accounts only.
const pendingRegistrationSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, lowercase: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        fullName: { type: String, trim: true },
        password: { type: String, required: true },
        emailVerificationToken: { type: String, required: true },
        emailVerificationExpiry: { type: Date, required: true },
    },
    { timestamps: true },
);

export const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema);
