import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true, index: true },
    country: { type: String, trim: true, default: "Algeria" },
    taxId: { type: String, trim: true },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

ClientSchema.index({ name: "text", city: "text" });

export type ClientDoc = InferSchemaType<typeof ClientSchema> & { _id: mongoose.Types.ObjectId };

export const Client =
  (mongoose.models.Client as mongoose.Model<ClientDoc>) ||
  mongoose.model<ClientDoc>("Client", ClientSchema);

