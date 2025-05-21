import mongoose, { Schema, model, Types, Document, Model, CallbackError } from "mongoose";
import { I_Module } from "./course.module.model";
import { IPayment } from "./payment.model";
import { Submission } from "./assgmt.submission";

// Status and Payment Status Enums
export enum EnrollmentStatus {
  ENROLLED = "Enrolled",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Complete",
  DROPPED = "Dropped"
}

export enum PaymentStatus {
  PENDING = "Pending",
  PAID = "Paid",
  WAIVED = "Waived"
}

// Enrollment Interface
export interface I_Enrollment extends Document {
  studentId: Types.ObjectId;
  enrolledCourse: Types.ObjectId;
  completedModules: Types.ObjectId[];
  overallProgress: number;
  status: EnrollmentStatus;
  submittedAssignments: Types.ObjectId[];
  paymentStatus?: PaymentStatus;
  paymentDetail?: Types.ObjectId;
  isEnrolledWithOffer: boolean;
  offerId?: Types.ObjectId;
  enrolledAt: Date;
  lastAccessedAt?: Date;
  courseModules: Types.ObjectId[];
  daysSinceEnrollment: number;
  completedModule?: Types.ObjectId[];
  courseModule?: Types.ObjectId[];
  payment?: Types.ObjectId;
}

// Enrollment Static Methods
interface EnrollmentModel extends Model<I_Enrollment> {
  getStudentProgress(studentId: Types.ObjectId, courseId: Types.ObjectId): Promise<I_Enrollment | null>;
  getActiveEnrollments(studentId: Types.ObjectId): Promise<I_Enrollment[]>;
  updateProgress(enrollmentId: Types.ObjectId, progress: number): Promise<I_Enrollment | null>;
  countCourseEnrollments(courseId: Types.ObjectId): Promise<number>;
  getEnrollmentsByStatus(status: EnrollmentStatus, limit?: number, skip?: number): Promise<I_Enrollment[]>;
}

const enrollmentSchema = new Schema<I_Enrollment, EnrollmentModel>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true
    },
    enrolledCourse: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true
    },
    completedModules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
        default: [],
        validate: {
          validator: async function (this: I_Enrollment, modules: Types.ObjectId[]) {
            // Ensure completedModules is a subset of courseModules
            if (!this.courseModules || this.courseModules.length === 0) return true;
            const courseModuleIds = this.courseModules.map(id => id.toString());
            return modules.every(id => courseModuleIds.includes(id.toString()));
          },
          message: "Completed modules must be a subset of course modules"
        }
      }
    ],
    overallProgress: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Progress cannot be less than 0"],
      max: [100, "Progress cannot exceed 100"],
      validate: {
        validator: function (this: I_Enrollment, value: number) {
          // Optional: Ensure progress aligns with completedModules
          if (!this.courseModules || this.courseModules.length === 0) return true;
          const expectedProgress = (this.completedModules.length / this.courseModules.length) * 100;
          return Math.abs(value - expectedProgress) <= 1; // Allow minor rounding differences
        },
        message: "Progress must align with completed modules"
      }
    },
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      required: true,
      default: EnrollmentStatus.ENROLLED
    },
    submittedAssignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Submission",
        default: []
      }
    ],
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      validate: {
        validator: function (this: I_Enrollment, value?: PaymentStatus) {
          if (value === PaymentStatus.PENDING || value === PaymentStatus.PAID) {
            return !!this.paymentDetail;
          }
          if (this.paymentDetail && !value) {
            return false;
          }
          return true;
        },
        message: "Payment status and payment details must be consistent"
      }
    },
    paymentDetail: {
      type: Schema.Types.ObjectId,
      ref: "Payment"
    },
    isEnrolledWithOffer: {
      type: Boolean,
      required: true,
      default: false
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
      required: function (this: I_Enrollment) {
        return this.isEnrolledWithOffer;
      },
      validate: {
        validator: function (this: I_Enrollment, value?: Types.ObjectId) {
          return this.isEnrolledWithOffer ? !!value : !value;
        },
        message: "Offer ID must be set only when enrolled with an offer"
      }
    },
    enrolledAt: {
      type: Date,
      required: true,
      default: Date.now,
      immutable: true
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now
    },
    courseModules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
        default: []
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals
// Virtual for days since enrollment
enrollmentSchema.virtual("daysSinceEnrollment").get(function (this: I_Enrollment) {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - this.enrolledAt.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for completed modules (optional, for automatic inclusion in toJSON)
enrollmentSchema.virtual("completedModule", {
  ref: "Module",
  localField: "completedModules",
  foreignField: "_id"
});

// Virtual for course modules (optional, for automatic inclusion in toJSON)
enrollmentSchema.virtual("courseModule", {
  ref: "Module",
  localField: "courseModules",
  foreignField: "_id"
});

// Virtual for payment details (optional, for automatic inclusion in toJSON)
enrollmentSchema.virtual("payment", {
  ref: "Payment",
  localField: "paymentDetail",
  foreignField: "_id",
  justOne: true
});

// Middleware
// Auto-populate courseModules from Course document on save
enrollmentSchema.pre("save", async function (next) {
  try {
    if (this.isNew && this.enrolledCourse) {
      const Course = mongoose.model("Course");
      const course = await Course.findById(this.enrolledCourse).select("modules");
      if (course && course.modules) {
        this.courseModules = course.modules;
      }
    }
    next();
  } catch (error:any) {
    next(error);
  }
});

// Static Methods
// Get progress for a specific student and course
enrollmentSchema.statics.getStudentProgress = async function (studentId: Types.ObjectId, courseId: Types.ObjectId) {
  try {
    return await this.findOne({ studentId, enrolledCourse: courseId })
      .populate("completedModules")
      .populate("submittedAssignments")
      .populate("enrolledCourse", "title description duration")
      .populate("paymentDetail")
      .lean();
  } catch (error:any) {
    throw new Error(`Failed to get student progress: ${error.message}`);
  }
};

// Get active enrollments for a student
enrollmentSchema.statics.getActiveEnrollments = async function (studentId: Types.ObjectId) {
  try {
    return await this.find({
      studentId,
      status: { $in: [EnrollmentStatus.ENROLLED, EnrollmentStatus.IN_PROGRESS] }
    })
      .populate("enrolledCourse", "title thumbnail instructor")
      .sort({ lastAccessedAt: -1 })
      .lean();
  } catch (error:any) {
    throw new Error(`Failed to get active enrollments: ${error.message}`);
  }
};

// Update progress and status for an enrollment
enrollmentSchema.statics.updateProgress = async function (enrollmentId: Types.ObjectId, progress: number) {
  try {
    if (progress < 0 || progress > 100) {
      throw new Error("Progress must be between 0 and 100");
    }

    const enrollment = await this.findById(enrollmentId);
    if (!enrollment) {
      return null;
    }

    const status = enrollment.status === EnrollmentStatus.DROPPED
      ? EnrollmentStatus.DROPPED
      : progress === 100
        ? EnrollmentStatus.COMPLETED
        : progress > 0
          ? EnrollmentStatus.IN_PROGRESS
          : EnrollmentStatus.ENROLLED;

    return await this.findByIdAndUpdate(
      enrollmentId,
      {
        $set: {
          overallProgress: progress,
          status,
          lastAccessedAt: new Date()
        }
      },
      { new: true }
    ).lean();
  } catch (error:any) {
    throw new Error(`Failed to update progress: ${error.message}`);
  }
};

// Count non-dropped enrollments for a course
enrollmentSchema.statics.countCourseEnrollments = async function (courseId: Types.ObjectId) {
  try {
    return await this.countDocuments({
      enrolledCourse: courseId,
      status: { $ne: EnrollmentStatus.DROPPED }
    });
  } catch (error:any) {
    throw new Error(`Failed to count course enrollments: ${error.message}`);
  }
};

// Get enrollments by status with pagination
enrollmentSchema.statics.getEnrollmentsByStatus = async function (
  status: EnrollmentStatus,
  limit: number = 10,
  skip: number = 0
) {
  try {
    return await this.find({ status })
      .populate("studentId", "name email")
      .populate("enrolledCourse", "title")
      .limit(limit)
      .skip(skip)
      .sort({ enrolledAt: -1 })
      .lean();
  } catch (error:any) {
    throw new Error(`Failed to get enrollments by status: ${error.message}`);
  }
};

// Indexes
enrollmentSchema.index({ studentId: 1, enrolledCourse: 1 }, { unique: true });
enrollmentSchema.index({ studentId: 1, status: 1 });
enrollmentSchema.index({ enrolledCourse: 1, status: 1 });

// Export Model
const Enrollment = mongoose.models.Enrollment || model<I_Enrollment, EnrollmentModel>("Enrollment", enrollmentSchema);
export default Enrollment