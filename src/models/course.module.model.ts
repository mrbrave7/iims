import mongoose, { Schema, model, Types, Document } from "mongoose";

// Module Interface
export interface I_Module extends Document {
  moduleTitle: string;
  moduleDescription?: string;
  moduleDurationInDays: number;
  moduleVideoUrl?: string;
  notes?: string[];
  articleLinks?: string[];
  moduleBannerUrl?: string;
  isCompleted: boolean;
  isContentPublished: boolean;
  learningObjectives?: string[];
  moduleAssignments: Types.ObjectId[];
  order: number;
}

// Module Schema
const moduleSchema = new Schema<I_Module>(
  {
    moduleTitle: {
      type: String,
      required: true,
    },
    moduleDescription: {
      type: String,
      required: false,
    },
    moduleDurationInDays: {
      type: Number,
      required: true,
    },
    moduleVideoUrl: {
      type: String,
      required: false,
    },
    notes: {
      type: [{ type: String }],
      required: false,
      default: [],
      validate: {
        validator: (links: string[]) => links.every((link) => !link || /^(https?:\/\/)/.test(link)),
        message: "All notes must be valid URLs or empty",
      },
    },
    articleLinks: {
      type: [{ type: String }],
      required: false,
      default: [],
      validate: {
        validator: (links: string[]) => links.every((link) => !link || /^(https?:\/\/)/.test(link)),
        message: "All article links must be valid URLs or empty",
      },
    },
    moduleBannerUrl: {
      type: String,
      required: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isContentPublished: {
      type: Boolean,
      default: false,
    },
    learningObjectives: {
      type: [{ type: String }],
      required: false,
      default: [],
    },
    moduleAssignments: [
      {
        type: Types.ObjectId,
        ref: "Assignment",
      },
    ],
    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } // For createdAt/updatedAt
);

// Create model
const Module =mongoose.models.Module || model<I_Module>("Module", moduleSchema);
export default Module