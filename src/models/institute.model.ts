import { Schema, Types, model, Document, models } from "mongoose";
import validator from "validator";

interface IInstituteAddress {
  city?: string;
  street?: string;
  state?: string;
  country?: string;
  postalCode?: number;
  specialIdentity?: string;
}

interface IInstituteContact {
  phone: string[];
  email: string[];
  website: string;
}

interface IAccreditation {
  accreditingBody: string;
  accreditationStatus: string;
  accreditedUntil: Date;
}

interface A_Institute extends Document {
  instituteName: string;
  instituteType: "Online" | "Offline" | "Hybrid";
  instituteAddress?: IInstituteAddress;
  instituteBio: string;
  instituteLogo: string;
  founderOrSuperAdmin: Types.ObjectId;
  coursesProvided: Types.ObjectId[];
  instructors: Types.ObjectId[];
  otherEmployees: Types.ObjectId[];
  certifications: string;
  instituteContact: IInstituteContact;
  students: Types.ObjectId[];
  status: "active" | "inactive" | "pending";
  accreditation: IAccreditation;
  createdAt?: Date;
  updatedAt?: Date;
}

const instituteSchema = new Schema<A_Institute>(
  {
    instituteName: {
      type: String,
      required: [true, "Institute name is required"],
      trim: true,
      maxlength: [100, "Institute name cannot exceed 100 characters"],
      index: true,
    },
    instituteType: {
      type: String,
      enum: {
        values: ["Online", "Offline", "Hybrid"],
        message: "{VALUE} is not a valid institute type",
      },
      required: [true, "Institute type is required"],
    },
    instituteAddress: {
      city: { type: String, trim: true },
      street: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      postalCode: { type: Number },
      specialIdentity: { type: String, trim: true },
    },
    instituteBio: {
      type: String,
      required: [true, "Institute bio is required"],
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    instituteLogo: {
      type: String,
      required: [true, "Institute logo is required"],
      validate: {
        validator: (v: string) => validator.isURL(v),
        message: "Logo must be a valid URL",
      },
    },
    founderOrSuperAdmin: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Founder or super admin is required"],
      index: true,
    },
    coursesProvided: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    instructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],
    otherEmployees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Admin",
      },
    ],
    certifications: {
      type: String,
    },
    instituteContact: {
      phone: [
        {
          type: String,
          validate: {
            validator: (v: string) => validator.isMobilePhone(v, "any", { strictMode: false }),
            message: "Invalid phone number",
          },
        },
      ],
      email: [
        {
          type: String,
          validate: {
            validator: (v: string) => validator.isEmail(v),
            message: "Invalid email address",
          },
        },
      ],
      website: {
        type: String,
        validate: {
          validator: (v: string) => validator.isURL(v),
          message: "Invalid website URL",
        },
      },
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "pending"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    accreditation: {
      accreditingBody: { type: String, required: true },
      accreditationStatus: { type: String, required: true },
      accreditedUntil: { type: Date, required: true },
    },
  },
  {
    timestamps: true,
  }
);

// Method to add a course to the institute
instituteSchema.methods.addCourse = function (courseId: Types.ObjectId) {
  if (!this.coursesProvided.includes(courseId)) {
    this.coursesProvided.push(courseId);
  }
  return this.save();
};

// Method to remove a course from the institute
instituteSchema.methods.removeCourse = function (courseId: Types.ObjectId) {
  this.coursesProvided = this.coursesProvided.filter(
    (id: Types.ObjectId) => !id.equals(courseId)
  );
  return this.save();
};

// Method to add an instructor
instituteSchema.methods.addInstructor = function (instructorId: Types.ObjectId) {
  if (!this.instructors.includes(instructorId)) {
    this.instructors.push(instructorId);
  }
  return this.save();
};

// Method to remove an instructor
instituteSchema.methods.removeInstructor = function (instructorId: Types.ObjectId) {
  this.instructors = this.instructors.filter(
    (id: Types.ObjectId) => !id.equals(instructorId)
  );
  return this.save();
};

// Method to check if the institute is accredited
instituteSchema.methods.isAccredited = function () {
  return (
    this.accreditation.accreditationStatus === "active" &&
    this.accreditation.accreditedUntil > new Date()
  );
};

// Static method to find institutes by status
instituteSchema.statics.findByStatus = function (status: "active" | "inactive" | "pending") {
  return this.find({ status });
};

// Static method to find institutes by type
instituteSchema.statics.findByType = function (type: "Online" | "Offline" | "Hybrid") {
  return this.find({ instituteType: type });
};

const Institute = models.Institute || model<A_Institute>("Institute", instituteSchema);
export default Institute;