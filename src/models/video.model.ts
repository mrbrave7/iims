import { Schema, model, models, Types } from "mongoose";

// Interface for the Video document
interface Video {
  uploadedBy: Types.ObjectId;
  videoUrl: {
    secureUrl: string;
    playbackUrl: string | null;
  };
  publicId: string;
  videoType: "module" | "promo";
  videoName: string;
  processing: boolean;
  deleted: boolean;
  isPremium: boolean;
  accessMode: "public" | "authenticated";
  type: "upload" | "private";
  duration: number | null;
  format: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
  updatedAt: Date;
  defaultUrl: string; // Virtual field
}

const videoSchema = new Schema<Video>(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Uploaded by is required"],
    },
    videoUrl: {
      secureUrl: {
        type: String,
        required: [true, "Secure URL is required"],
        trim: true,
        match: [/^https?:\/\/.*\..+$/, "Invalid secure URL format"],
      },
      playbackUrl: {
        type: String,
        trim: true,
        default: null,
        match: [/^https?:\/\/.*\..+$|^$/, "Invalid playback URL format"],
      },
    },
    publicId: {
      type: String,
      required: [true, "Public ID is required"],
      unique: true,
      trim: true,
    },
    videoType: {
      type: String,
      enum: {
        values: ["module", "promo"],
        message: "{VALUE} is not a valid video type",
      },
      required: [true, "Video type is required"],
    },
    videoName: {
      type: String,
      required: [true, "Video name is required"],
      trim: true,
      minlength: [1, "Video name cannot be empty"],
      maxlength: [255, "Video name cannot exceed 255 characters"],
    },
    processing: {
      type: Boolean,
      default: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    accessMode: {
      type: String,
      enum: {
        values: ["public", "authenticated"],
        message: "{VALUE} is not a valid access mode",
      },
      default: "public",
    },
    type: {
      type: String,
      enum: {
        values: ["upload", "private"],
        message: "{VALUE} is not a valid upload type",
      },
      default: "upload",
    },
    duration: {
      type: Number,
      default: null,
      min: [0, "Duration cannot be negative"],
    },
    format: {
      type: String,
      trim: true,
      default: null,
      match: [/^[a-zA-Z0-9]+$|^$/, "Invalid format"],
    },
    width: {
      type: Number,
      default: null,
      min: [1, "Width must be positive"],
    },
    height: {
      type: Number,
      default: null,
      min: [1, "Height must be positive"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query performance
videoSchema.index({ uploadedBy: 1 });
videoSchema.index({ videoType: 1 });
videoSchema.index({ uploadedBy: 1, videoType: 1 }); // Compound index for combined queries
videoSchema.index({ publicId: 1 }); // Index for publicId lookups
videoSchema.index({ processing: 1 }); // Index for filtering by processing status
videoSchema.index({ isPremium: 1 }); // Index for filtering premium videos
videoSchema.index({ accessMode: 1 }); // Index for access control queries

// Virtual for default URL (e.g., fallback to secureUrl if playbackUrl is null)
videoSchema.virtual("defaultUrl").get(function (this: Video) {
  return this.videoUrl.playbackUrl || this.videoUrl.secureUrl;
});

// Ensure deleted videos are excluded by default in queries
videoSchema.pre("find", function () {
  this.where({ deleted: false });
});
videoSchema.pre("findOne", function () {
  this.where({ deleted: false });
});

const Video = models.Video || model<Video>("Video", videoSchema);

export default Video;