import mongoose, { Schema, model, Model, Document, Types } from "mongoose";
import { I_Certifications } from "./certification.model";
import { I_Experiences } from "./experience.model";

// Updated Interface
 export interface I_Social_Media {
    siteName: string;
    siteUrl: string;
  }
  
   interface I_Profile_Rating {
    studentId: Types.ObjectId;
    comments: string;
    stars: number; // Corrected typo from "start" to "stars"
  }
  
   export interface I_Profile {
    adminId: Types.ObjectId ; // Reference to Admin schema
    fullName: string;
    dateOfBirth: Date;
    avatarUrl: string;
    ShortBio: string;
    socialMediaAccounts: I_Social_Media[] ;
    certifications: Types.ObjectId[] ;
    experiences: Types.ObjectId[] ;
    otherAssignedCourses: Types.ObjectId[];
    ratings: I_Profile_Rating[];
    specialization: string[];
  }

// Sub-schema for Social Media
const SocialMediaSchema = new Schema<I_Social_Media>({
  siteName: {
    type: String,
    required: [true, "Social media site name is required"],
    trim: true,
    lowercase: true,
    enum: {
      values: ["twitter", "linkedin", "github", "facebook", "instagram", "website"],
      message: "{VALUE} is not a supported social media site",
    },
  },
  siteUrl: {
    type: String,
    required: [true, "Social media URL is required"],
    trim: true,
    match: [/^https?:\/\/[^\s/$.?#].[^\s]*$/, "Please provide a valid URL"],
  },
});

// Sub-schema for Instructor Rating
const InstructorRatingSchema = new Schema<I_Profile_Rating>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student", // Assuming a Student model exists
    required: [true, "Student ID is required"],
  },
  comments: {
    type: String,
    trim: true,
    maxlength: [500, "Comments cannot exceed 500 characters"],
  },
  stars: { // Corrected typo from "start" to "stars"
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1 star"],
    max: [5, "Rating cannot exceed 5 stars"],
  },
});

// Main Instructor Schema
const ProfileSchema = new Schema<I_Profile>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Admin ID is required"],
      unique: true, 
    },
    fullName: {
      type: String,
      required: [true, "Instructor full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: (value: Date) => {
          const today = new Date();
          const age = today.getFullYear() - value.getFullYear();
          return age >= 18 && value <= today;
        },
        message: "Instructor must be at least 18 years old and DOB cannot be in the future",
      },
    },
    avatarUrl: {
      type: String,
      required: [true, "Avatar URL is required"],
      trim: true,
      match: [/^https?:\/\/[^\s/$.?#].[^\s]*$/, "Please provide a valid URL"],
    },
    ShortBio: {
      type: String,
      required: [true, "Short bio is required"],
      trim: true,
      minlength: [10, "Bio must be at least 10 characters"],
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    socialMediaAccounts: {
      type: [SocialMediaSchema],
      default: [],
    },
    certifications: [{
      type: Schema.Types.ObjectId,
      ref: "Certification", 
    }],
    experiences: [{
      type: Schema.Types.ObjectId,
      ref: "Experience",
    }],
    otherAssignedCourses: [{
      type: Schema.Types.ObjectId,
      ref: "Course",
    }],
    ratings: {
      type: [InstructorRatingSchema],
      default: [],
    },
    specialization: {
      type: [String],
      required: [true, "Specialization is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "profiles",
    toJSON: { virtuals: true }, // Enable virtuals for population
  }
);

// Virtual to populate Admin details
ProfileSchema.virtual("adminDetails", {
  ref: "Admin",
  localField: "adminId",
  foreignField: "_id",
  justOne: true,
});

// Create the model
const Profile: Model<I_Profile> =
  (mongoose.models.Profile as Model<I_Profile>) || model<I_Profile>("Profile", ProfileSchema);

export default Profile;

