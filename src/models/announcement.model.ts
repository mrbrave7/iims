import { Schema, model, Document, Types } from "mongoose";

interface IAnnouncement extends Document {
  // Basic Information
  subject: string;
  title: string;
  content: string;
  slug?: string;
  
  // Timing and Validity
  announcementStart: Date;
  announcementValidity: Date;
  
  // Author and Management
  createdBy: Types.ObjectId; // Reference to User model
  status: "draft" | "published" | "archived" | "scheduled";
  
  // Marketing Elements
  coreMessages: string;
  emotionalAppeal: string;
  scarcity: string;
  scarcityDeadline?: Date;
  targetedAudience: string;
  audienceSegments?: string[];
  callToAction: string;
  ctaLink?: string;
  
  // Event Details
  keyDetails: {
    when: Date;
    endTime?: Date; // For events with duration
    timezone?: string; // Important for global audiences
    where: {
      type: "online" | "offline" | "hybrid";
      address: string;
      organizer: string;
      locationLink?: string; // Google Maps or venue link
      virtualPlatform?: string; // Zoom, Teams, etc.
      virtualMeetingId?: string; // Meeting ID if applicable
      virtualMeetingPassword?: string; // Meeting password if applicable
    };
  };
  
  // Visual Content
  visuals: {
    type: "image" | "video" | "graphic";
    description: string;
    url: string;
    altText?: string;
    thumbnailUrl?: string; // For videos or large graphics
  }[];  // Changed to array to support multiple visuals
  
  bannerUrl: string;
  bannerAltText?: string;
  
  // Course-Related
  isAboutCourse: boolean;
  courseId?: Types.ObjectId;
  
  // Additional Information
  faqs: {
    question: string;
    answer: string;
  }[];
  moreDescription: string;
  attachments?: {
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize?: number;
  }[]; // For PDF, documents, or other attachments
  
  // Analytics and Tracking
  metrics?: {
    views?: number;
    clicks?: number;
    shares?: number;
    feedback?: {
      positive: number;
      negative: number;
    };
  };
  
  language: string; 
  tags: string[];
  category?: string;

}

const announcementSchema = new Schema<IAnnouncement>(
  {
    // Basic Information
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    
    // Timing and Validity
    announcementStart: {
      type: Date,
      required: true,
    },
    announcementValidity: {
      type: Date,
      required: true,
    },
    
    // Author and Management
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived", "scheduled"],
      default: "draft",
      required: true,
    },
    
    // Marketing Elements
    coreMessages: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    emotionalAppeal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    scarcity: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    scarcityDeadline: {
      type: Date,
    },
    targetedAudience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    audienceSegments: {
      type: [String],
      default: [],
    },
    callToAction: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    ctaLink: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    
    // Event Details
    keyDetails: {
      when: {
        type: Date,
        required: true,
      },
      endTime: {
        type: Date,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
      where: {
        type: {
          type: String,
          enum: ["online", "offline", "hybrid"],
          required: true,
        },
        address: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200,
        },
        organizer: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        locationLink: {
          type: String,
          trim: true,
          maxlength: 500,
        },
        virtualPlatform: {
          type: String,
          trim: true,
          maxlength: 50,
        },
        virtualMeetingId: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        virtualMeetingPassword: {
          type: String,
          trim: true,
          maxlength: 50,
        },
      },
    },
    
    // Visual Content
    visuals: [
      {
        type: {
          type: String,
          enum: ["image", "video", "graphic"],
          required: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200,
        },
        url: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
        altText: {
          type: String,
          trim: true,
          maxlength: 200,
        },
        thumbnailUrl: {
          type: String,
          trim: true,
          maxlength: 500,
        },
      },
    ],
    bannerUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    bannerAltText: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    
    // Course-Related
    isAboutCourse: {
      type: Boolean,
      required: true,
      default: false,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course", 
    },
    
    // Additional Information
    faqs: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
          maxlength: 200,
        },
        answer: {
          type: String,
          required: true,
          trim: true,
          maxlength: 500,
        },
      },
    ],
    moreDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    attachments: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        fileUrl: {
          type: String,
          required: true,
          trim: true,
        },
        fileType: {
          type: String,
          required: true,
          trim: true,
        },
        fileSize: {
          type: Number,
        },
      },
    ],
    
    // Analytics and Tracking
    metrics: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      conversions: {
        type: Number,
        default: 0,
      },
      feedback: {
        positive: {
          type: Number,
          default: 0,
        },
        negative: {
          type: Number,
          default: 0,
        },
      },
    },
    
    // Localization
    language: {
      type: String,
      default: "en",
      required: true,
    },
    
    // Tags and Categories
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      trim: true,
    },

  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Add indexes for common queries
announcementSchema.index({ announcementStart: 1 });
announcementSchema.index({ announcementValidity: 1 });
announcementSchema.index({ isAboutCourse: 1, courseId: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ "keyDetails.when": 1 });
announcementSchema.index({ slug: 1 });
announcementSchema.index({ tags: 1 });
announcementSchema.index({ language: 1 });
announcementSchema.index({ createdBy: 1 });
announcementSchema.index({ priority: 1 });
announcementSchema.index({ scheduledPublishDate: 1 });

// Pre-save hook for creating slugs automatically
announcementSchema.pre("save", function(next) {
  if (this.isNew || this.isModified("title")) {
    // Simple slug generation - in production consider using a library like slugify
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  next();
});

const Announcement = model<IAnnouncement>("Announcement", announcementSchema);

export default Announcement;