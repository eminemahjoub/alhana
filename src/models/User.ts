import mongoose, { Schema, type InferSchemaType } from "mongoose";

import { UserRoles } from "@/constants/enums";

const UserSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true, index: true },
    image: { type: String, trim: true },
    role: { type: String, enum: UserRoles, default: "viewer", index: true },
    passwordHash: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const User =
  (mongoose.models.User as mongoose.Model<UserDoc>) ||
  mongoose.model<UserDoc>("User", UserSchema);

