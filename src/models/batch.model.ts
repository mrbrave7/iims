import mongoose, { model, Schema, Types, Document } from "mongoose";


// Batch Interface
export interface I_Batch extends Document {
  batchName: string;
  batchInstructors: Types.ObjectId[];
  totalStudentCount: number;
  batchStartDate:Date;
  batchStudents: Types.ObjectId[];
  completedModules: Types.ObjectId[];
  weeklyAssignments: Types.ObjectId[];
  schedule: { day: string; startTime: string; endTime: string }[];
  holidays: Date[];
  courseId: Types.ObjectId;
  batchStatus: "Upcoming" | "Active" | "Completed";
  maxStudentCount: number;
  enrollmentStartDate: Date;
  enrollmentEndDate: Date;
  progressPercentage: number;
  address: {
    city: string;
    state: string;
    street: string;
    country: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<I_Batch>(
  {
    batchName: {
      type: String,
      required: [true, "Batch name is required"],
      trim: true,
      minlength: [3, "Batch name must be at least 3 characters"],
      maxlength: [50, "Batch name cannot exceed 50 characters"],
      index: true,
    },
    batchInstructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Admin",
        required: [true, "At least one instructor is required"],
      },
    ],
    totalStudentCount: {
      type: Number,
      default: 0,
      min: [0, "Student count cannot be negative"],
    },
    batchStartDate:{
      type: Date,
      required: [true, "Batch start time is required"],
    },
    batchStudents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Enrollment",
        default: [],
        validate: {
          validator: async function (enrollments: Types.ObjectId[]) {
            const Enrollment = mongoose.model("Enrollment");
            const validEnrollments = await Enrollment.find({
              _id: { $in: enrollments },
              enrolledCourse: this.courseId,
            });
            return validEnrollments.length === enrollments.length;
          },
          message: "All batch students must be enrolled in the course",
        },
      },
    ],
    completedModules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
        default: [],
        validate: {
          validator: async function (modules: Types.ObjectId[]) {
            const Course = mongoose.model("Course");
            const course = await Course.findById(this.courseId).select("courseModules");
            if (!course || !course.courseModules) return false;
            const courseModuleIds = course.courseModules.map((id:any) => id.toString());
            return modules.every((id) => courseModuleIds.includes(id.toString()));
          },
          message: "Completed modules must belong to the course",
        },
      },
    ],
    weeklyAssignments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Assignment",
        default: [],
      },
    ],
    schedule: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format"],
        },
        endTime: {
          type: String,
          required: true,
          match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format"],
          validate: {
            validator: function (this: { startTime: string }, v: string) {
              return v > this.startTime;
            },
            message: "End time must be after start time",
          },
        },
        _id: false,
      },
    ],
    holidays: [{ type: Date }],
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    batchStatus: {
      type: String,
      enum: ["Upcoming", "Active", "Completed"],
      default: "Upcoming",
      index: true,
    },
    maxStudentCount: {
      type: Number,
      required: [true, "Maximum student count is required"],
      min: [1, "Maximum student count must be at least 1"],
    },
    enrollmentStartDate: {
      type: Date,
      required: [true, "Enrollment start date is required"],
    },
    enrollmentEndDate: {
      type: Date,
      required: [true, "Enrollment end date is required"],
      validate: {
        validator: function (this: I_Batch, v: Date) {
          return v > this.enrollmentStartDate;
        },
        message: "Enrollment end date must be after start date",
      },
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      zipCode: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{5}(-\d{4})?$/, "Invalid zip code format"],
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Middleware
BatchSchema.pre("save", async function (next) {
  this.totalStudentCount = this.batchStudents.length;
  if (this.totalStudentCount > this.maxStudentCount) {
    return next(new Error("Total student count exceeds maximum capacity"));
  }
  // Update batchStatus
  next();
});
const Batch = mongoose.models.Batch || model<I_Batch>("Batch", BatchSchema);
export default Batch