import mongoose, { model, Schema, Types } from "mongoose";

// Assignment Interface
export interface I_Assignment extends Document {
    assignmentName: string;
    assignmentQuestions: {
      questionText: string;
      type: "text" | "mcq" | "file";
      options?: string[];
      maxScore: number;
    }[];
    dueDate?: Date;
    instructions?: string;
    courseId: Types.ObjectId;
    batchId?: Types.ObjectId; // New: Link to batch
    submissionSettings?: {
      allowedFormats: string[]; // e.g., ["pdf", "jpg"]
      latePenaltyPercentage?: number; // e.g., 10% per day
      gracePeriodHours?: number; // e.g., 24 hours
    };
    gradingStatus: "Pending" | "Graded" | "Overdue"; // New: Track grading
    weightage: number; // New: Contribution to course grade
    createdAt: Date;
    updatedAt: Date;
  }

  const AssignmentSchema = new Schema<I_Assignment>(
    {
      assignmentName: {
        type: String,
        required: [true, "Assignment name is required"],
        trim: true,
        maxlength: [100, "Assignment name cannot exceed 100 characters"],
      },
      assignmentQuestions: [
        {
          questionText: {
            type: String,
            required: [true, "Question text is required"],
            trim: true,
          },
          type: {
            type: String,
            enum: ["text", "mcq", "file"],
            default: "text",
          },
          options: {
            type: [String],
            default: undefined,
            validate: {
              validator: function (this: { type: string }, v: string[] | undefined) {
                return this.type === "mcq" ? v && v.length > 0 : !v;
              },
              message: "Options are required for MCQ questions and not allowed for others",
            },
          },
          maxScore: {
            type: Number,
            required: [true, "Maximum score is required"],
            min: [0, "Maximum score cannot be negative"],
          },
        },
      ],
      dueDate: {
        type: Date,
        validate: {
          validator: (v: Date | undefined) => !v || v > new Date(),
          message: "Due date must be in the future",
        },
      },
      instructions: {
        type: String,
        trim: true,
        maxlength: [1000, "Instructions cannot exceed 1000 characters"],
      },
      courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: [true, "Course ID is required"],
        index: true,
      },
      batchId: {
        type: Schema.Types.ObjectId,
        ref: "Batch",
        index: true,
      },
      submissionSettings: {
        allowedFormats: {
          type: [String],
          default: ["pdf"],
          validate: {
            validator: (v: string[]) => v.length > 0,
            message: "At least one submission format is required",
          },
        },
        latePenaltyPercentage: {
          type: Number,
          min: [0, "Penalty cannot be negative"],
          max: [100, "Penalty cannot exceed 100%"],
          default: 0,
        },
        gracePeriodHours: {
          type: Number,
          min: [0, "Grace period cannot be negative"],
          default: 0,
        },
      },
      gradingStatus: {
        type: String,
        enum: ["Pending", "Graded", "Overdue"],
        default: "Pending",
        index: true,
      },
      weightage: {
        type: Number,
        required: [true, "Weightage is required"],
        min: [0, "Weightage cannot be negative"],
        max: [100, "Weightage cannot exceed 100%"],
      },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
  );
  AssignmentSchema.index({ courseId: 1, batchId: 1 });
const Assignment = mongoose.models.Assignment || model<I_Assignment>("Assignment", AssignmentSchema);
export default Assignment