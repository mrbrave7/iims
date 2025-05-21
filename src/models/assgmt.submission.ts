import mongoose, { Model, Schema, Types } from "mongoose";
import { I_Assignment } from "./assignment.model";

// Submission Interface
export interface Submission extends Document {
    assignmentId: Types.ObjectId | I_Assignment;
    studentId: Types.ObjectId;
    submittedAt: Date;
    answers: string[];
    grade?: number;
    feedback?: string;
    isGraded: boolean; // Virtual
}
// Submission Schema with Methods
interface SubmissionModel extends Model<Submission> {
    findByStudentAndAssignment(studentId: Types.ObjectId, assignmentId: Types.ObjectId): Promise<Submission | null>;
    getUngradedSubmissions(): Promise<Submission[]>;
}

const submissionSchema = new Schema<Submission, SubmissionModel>({
    assignmentId: {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
        required: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    submittedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    answers: [{
        type: String,
        required: true
    }],
    grade: {
        type: Number,
        min: 0
    },
    feedback: {
        type: String
    }
}, {
    _id:false,
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true }, // Include virtuals in object output
    collection:"submissions"
});

// Indexes for Submission
submissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true }); // Prevent duplicate submissions
submissionSchema.index({ submittedAt: -1 }); // For sorting by submission date
submissionSchema.index({ grade: 1 }); // For finding ungraded submissions

// Submission Virtual
submissionSchema.virtual('isGraded').get(function(this: Submission) {
    return this.grade !== undefined && this.grade !== null;
});

// Submission Methods
submissionSchema.statics.findByStudentAndAssignment = async function(studentId: Types.ObjectId, assignmentId: Types.ObjectId) {
    return this.findOne({ studentId, assignmentId });
};

submissionSchema.statics.getUngradedSubmissions = async function() {
    return this.find({ grade: { $exists: false } }).sort({ submittedAt: 1 });
};

const Submission = mongoose.models.Submission || mongoose.model("Submission",submissionSchema)

export default Submission