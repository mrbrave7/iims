import mongoose, { model, Schema, Document, Types, Model } from "mongoose";
import validator from 'validator';

// Custom Error Classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}


// Course Details Interface
interface I_Offline_Course_Details_Model {
  courseName: string;
  courseSlug: string;
  courseGoals: string[];
  courseLevel: "Beginner" | "Intermediate" | "Advanced" | "Academic";
  syllabusOutline: string[];
  courseDescription: string;
  courseDurationInDays: number;
  courseDailyClassDurationInMinutes: number;
}


// Pricing and Offers Interface
interface I_Offline_Course_Pricing_And_Offer {
  currency: string;
  courseFeeStructure: number;
  paymentPlans: {
    planName: string;
    amount: number;
    duration: string;
  }[];
  isCourseOnOffer: boolean;
  offerDetail?: Types.ObjectId;
  
}

// Enrollment and Status Interface
interface I_Offline_Course_Enrollment_Status {
  enrolledStudents: Types.ObjectId[];
  enrollmentStatus: "Open" | "Closed" | "In Progress";
  courseStatus: "Available" | "Unavailable" | "Archived" | "Draft";
}

// SEO and Marketing Interface
interface I_Offline_Course_SEO_And_Marketing {
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  promoVideoUrl?: string;
  courseBannerUrl?: string;
  tags: string[];
  seoKeywords?: string[];
}

// Additional Features Interface
interface I_Offline_Course_Additional_Features {
  ratings: {
    average: number;
    count: number;
    lastUpdated: Date;
  };
  reviews: Types.ObjectId[];
  faqs?: { question: string; answer: string }[];
  refundPolicy: {
    isRefundable: boolean;
    refundPeriodDays: number;
    conditions?: string;
  };
  targetAudience: string[];
  availableLanguages: string[];
  certificateTemplateUrl?: string;
  materialsProvided: string[];
  equipmentRequired: string[];
  accessibilityFeatures: string[];
  contactDetails: {
    email: string;
    phone: string;
  };
  termsAndCondition: string;
}

// Categorization Interface
interface I_Offline_Course_Category {
  courseCategory: string;
  courseSubCategory: string;
  trendingScore: number;
  lastTrendingUpdate: Date;
}


// Main Interface
export interface I_Offline_Course_Model extends Document {
  course: I_Offline_Course_Details_Model;
  courseCategories: I_Offline_Course_Category;
  courseModules: Types.ObjectId[];
  courseInstructors: Types.ObjectId[];
  batches: Types.ObjectId[];
  enrollmentStatus: I_Offline_Course_Enrollment_Status;
  courseSEOAndMarketing: I_Offline_Course_SEO_And_Marketing;
  coursePricingAndOffers: I_Offline_Course_Pricing_And_Offer;
  courseAdditionalFeatures: I_Offline_Course_Additional_Features;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  schemaVersion: string;

  // Instance methods
  enrollStudent(studentId: Types.ObjectId, batchId?: Types.ObjectId, session?: any): Promise<this>;
  updateEnrollmentStatus(): Promise<this>;
  addBatch(
    batchId: Types.ObjectId,
    maxStudentsSeats: number,
    enrollmentDeadline: Date,
    startDate: Date,
    endDate: Date,
    session?: any
  ): Promise<this>;
  removeBatch(batchId: Types.ObjectId, session?: any): Promise<this>;
  updateCourseDetails(updates: Partial<I_Offline_Course_Details_Model>): Promise<this>;
  updateCategory(updates: Partial<I_Offline_Course_Category>): Promise<this>;
  updatePricing(updates: Partial<I_Offline_Course_Pricing_And_Offer>): Promise<this>;
  updateAdditionalFeatures(updates: Partial<I_Offline_Course_Additional_Features>): Promise<this>;
  updateSEO(updates: Partial<I_Offline_Course_SEO_And_Marketing>): Promise<this>;
  calculateTrendingScore(): Promise<number>;
  softDelete(): Promise<this>;
  updateRating(): Promise<this>;
}

// Static methods interface
interface I_Offline_Course_Model_Static extends Model<I_Offline_Course_Model> {
  findByCategory(category: string, limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  findByStatus(status: "Available" | "Unavailable" | "Archived" | "Draft", limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  findPopularCourses(limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  findByDateRange(startDate: Date, endDate: Date, limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  findByBatch(batchId: Types.ObjectId, limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  findByInstructor(instructorId: Types.ObjectId, limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  findByLevel(level: "Beginner" | "Intermediate" | "Advanced", limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  searchByName(name: string, limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  searchByText(query: string, limit?: number, skip?: number): Promise<I_Offline_Course_Model[]>;
  getTrendingCoursesFromCache(): Promise<I_Offline_Course_Model[] | null>;
}

// Helper function to generate slug
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

// Schema Definition
const offlineCourseSchema = new Schema<I_Offline_Course_Model, I_Offline_Course_Model_Static>(
  {
    course: {
      courseName: {
        type: String,
        required: [true, "Course name is required"],
        index: true,
        unique: true,
        trim: true,
        minlength: [3, "Course name must be at least 3 characters"],
        maxlength: [100, "Course name cannot exceed 100 characters"],
        validate: {
          validator: (value: string) => value.trim().length > 0,
          message: "Course name cannot be empty",
        },
      },
      courseSlug: {
        type: String,
        required: [true, "Course slug is required"],
        unique: true,
        index: true,
        trim: true
      },
      courseGoals: [
        {
          type: String,
          required: [true, "Course goal is required"],
          trim: true,
          minlength: [5, "Goal must be at least 5 characters"],
        },
      ],
      courseLevel: {
        type: String,
        required: [true, "Course level is required"],
        enum: ["Beginner", "Intermediate", "Advanced","Academic"],
        index: true,
      },
      syllabusOutline: [
        {
          type: String,
          required: [true, "Syllabus outline is required"],
          trim: true,
          minlength: [5, "Outline must be at least 5 characters"],
        },
      ],
      courseDescription: {
        type: String,
        required: [true, "Course description is required"],
        trim: true,
        minlength: [10, "Description must be at least 10 characters"],
        maxlength: [3000, "Description cannot exceed 3000 characters"],
      },
      courseDurationInDays: {
        type: Number,
        required: [true, "Course duration is required"],
        min: [1, "Duration must be at least 1 day"],
      },
      courseDailyClassDurationInMinutes: {
        type: Number,
        required: [true, "Daily class duration is required"],
        min: [15, "Daily duration must be at least 15 minutes"],
      },
    },
    courseCategories: {
      courseCategory: {
        type: String,
        required: [true, "Course category is required"],
        index: true,
        trim: true,
        lowercase: true,
      },
      courseSubCategory: {
        type: String,
        required: [true, "Course subcategory is required"],
        index: true,
        trim: true,
        lowercase: true,
      },
      trendingScore: {
        type: Number,
        required: [true, "Trending score is required"],
        min: [0, "Trending score cannot be negative"],
        default: 0,
      },
      lastTrendingUpdate: {
        type: Date,
        default: null
      }
    },
    courseModules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Module",
        validate: {
          validator: async (id: Types.ObjectId) => {
            const module = await mongoose.models.Module.findById(id);
            return !!module;
          },
          message: "Invalid module ID",
        },
      },
    ],
    courseInstructors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Profile",
        required: [true, "Course instructor is required"],
        index: true
      }
    ],
    batches: [
      {
        type: Schema.Types.ObjectId,
        ref: "Batch",
        index: true
      }
    ],
    enrollmentStatus: {
      enrolledStudents: [
        {
          type: Schema.Types.ObjectId,
          ref: "Student",
          index: true
        },
      ],
      enrollmentStatus: {
        type: String,
        required: true,
        enum: ["Open", "Closed", "In Progress"],
        default: "Open",
        index: true
      },
      courseStatus: {
        type: String,
        required: true,
        enum: ["Available", "Unavailable", "Archived", "Draft"],
        default: "Draft",
        index: true
      },
    },
    courseSEOAndMarketing: {
      seoMetaTitle: {
        type: String,
        trim: true,
        maxlength: [60, "SEO title cannot exceed 60 characters"],
      },
      seoMetaDescription: {
        type: String,
        trim: true,
        maxlength: [160, "SEO description cannot exceed 160 characters"],
      },
      promoVideoUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
          message: 'Invalid promo video URL',
        },
      },
      courseBannerUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
          message: 'Invalid banner URL',
        },
      },
      tags: [
        {
          type: String,
          lowercase: true,
          index: true,
          trim: true
        }
      ],
      seoKeywords: [
        {
          type: String,
          lowercase: true,
          trim: true
        }
      ]
    },
    coursePricingAndOffers: {
      currency: {
        type: String,
        required: true,
        default: "USD",
        enum: ["USD", "EUR", "GBP"],
      },
      courseFeeStructure: {
        type: Number,
        required: true,
        min: [0, "Course fee cannot be negative"],
        index: true
      },
      paymentPlans: [
        {
          planName: { type: String, required: true, trim: true },
          amount: { type: Number, required: true, min: 0 },
          duration: { type: String, required: true, trim: true },
        },
      ],
      isCourseOnOffer: {
        type: Boolean,
        required: true,
        default: false,
      },
      offerDetail:{
        type:Schema.Types.ObjectId,
        ref:"Offer"
      },
      
    },
    courseAdditionalFeatures: {
      ratings: {
        average: {
          type: Number,
          default: 0,
          min: [0, "Rating cannot be negative"],
          max: [5, "Rating cannot exceed 5"],
        },
        count: {
          type: Number,
          default: 0,
          min: [0, "Rating count cannot be negative"]
        },
        lastUpdated: {
          type: Date,
          default: Date.now
        }
      },
      reviews: [
        {
          type: Schema.Types.ObjectId,
          ref: "Review",
        },
      ],
      faqs: [
        {
          question: {
            type: String,
            required: true,
            trim: true,
            minlength: [5, "Question must be at least 5 characters"],
          },
          answer: {
            type: String,
            required: true,
            trim: true,
            minlength: [5, "Answer must be at least 5 characters"],
          },
        },
      ],
      refundPolicy: {
        isRefundable: { type: Boolean, required: true, default: false },
        refundPeriodDays: {
          type: Number,
          required: true,
          min: [0, "Refund period cannot be negative"],
          default: 0,
        },
        conditions: { type: String, trim: true },
      },
      targetAudience: [
        {
          type: String,
          required: true,
          trim: true,
          minlength: [3, "Target audience must be at least 3 characters"],
        },
      ],
      availableLanguages: [
        {
          type: String,
          required: true,
          trim: true,
        },
      ],
      certificateTemplateUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
          message: 'Invalid certificate URL',
        },
      },
      materialsProvided: [
        {
          type: String,
          trim: true,
        },
      ],
      equipmentRequired: [
        {
          type: String,
          trim: true,
        },
      ],
      accessibilityFeatures: [
        {
          type: String,
          trim: true,
        },
      ],
      contactDetails: {
        email: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: (email: string) => validator.isEmail(email),
            message: 'Invalid email format',
          },
        },
        phone: {
          type: String,
          required: true,
          trim: true,
          validate: {
            validator: (phone: string) => validator.isMobilePhone(phone, 'any'),
            message: 'Invalid phone number',
          },
        },
      },
      termsAndCondition: {
        type: String,
        required: true,
        trim: true
      }
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    },
    schemaVersion: {
      type: String,
      default: '1.0.0'
    }
  },
  {
    timestamps: true,
    collection: "offline_courses",
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text Index for search
offlineCourseSchema.index({
  'course.courseName': 'text',
  'course.courseDescription': 'text',
  'course.syllabusOutline': 'text',
  'courseSEOAndMarketing.tags': 'text',
  'courseSEOAndMarketing.seoKeywords': 'text'
}, {
  weights: {
    'course.courseName': 10,
    'courseSEOAndMarketing.tags': 5,
    'course.courseDescription': 3,
    'course.syllabusOutline': 2,
    'courseSEOAndMarketing.seoKeywords': 1
  },
  name: 'offline_course_text_search'
});

// Compound Indexes
offlineCourseSchema.index({
  'enrollmentStatus.courseStatus': 1,
  'courseCategory.trendingScore': -1
});

offlineCourseSchema.index({
  'enrollmentStatus.courseStatus': 1,
  'coursePricingAndOffers.courseFeeStructure': 1
});

offlineCourseSchema.index({
  'enrollmentStatus.courseStatus': 1,
  'course.courseLevel': 1
});


// Middleware for auto-generating slug and SEO fields
offlineCourseSchema.pre<I_Offline_Course_Model>('save', function (next) {
  if (this.isModified('course.courseName')) {
    this.course.courseSlug = generateSlug(this.course.courseName);

    if (!this.courseSEOAndMarketing.seoMetaTitle) {
      this.courseSEOAndMarketing.seoMetaTitle = `Learn ${this.course.courseName} | Offline Course`;
    }

    if (!this.courseSEOAndMarketing.seoMetaDescription && this.course.courseDescription) {
      this.courseSEOAndMarketing.seoMetaDescription =
        this.course.courseDescription.substring(0, 150) + '...';
    }
  }
  next();
});

// Middleware to exclude deleted courses from queries
offlineCourseSchema.pre(/^find/, function (this: any, next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

// Static Methods with Redis Caching
offlineCourseSchema.statics.findPopularCourses = async function (
  limit: number = 10,
  skip: number = 0
): Promise<I_Offline_Course_Model[]> {

  try {

    // If not in cache, query database
    const courses = await this.find({
      'enrollmentStatus.courseStatus': 'Available',
      deletedAt: null
    })
      .sort({ 'courseCategory.trendingScore': -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    return courses;
  } catch (error) {
    throw new DatabaseError(`Failed to find popular courses: ${error}`);
  }
};

offlineCourseSchema.statics.searchByText = async function (
  query: string,
  limit: number = 10,
  skip: number = 0
): Promise<I_Offline_Course_Model[]> {
  if (!query || typeof query !== 'string') {
    throw new ValidationError('Invalid search query');
  }

  try {
    return await this.find(
      { $text: { $search: query }, deletedAt: null },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .skip(skip)
      .lean();
  } catch (error) {
    throw new DatabaseError(`Failed to search courses: ${error}`);
  }
};

// Other Static Methods (optimized with error handling)
offlineCourseSchema.statics.findByCategory = async function (
  category: string,
  limit: number = 10,
  skip: number = 0
): Promise<I_Offline_Course_Model[]> {
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Invalid category');
  }

  try {
    return await this.find({
      'courseCategory.courseCategory': category.toLowerCase(),
      'enrollmentStatus.courseStatus': 'Available',
      deletedAt: null
    })
      .sort({ 'courseCategory.trendingScore': -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  } catch (error) {
    throw new DatabaseError(`Failed to find courses by category: ${error}`);
  }
};

offlineCourseSchema.statics.findByInstructor = async function (
  instructorId: Types.ObjectId,
  limit: number = 10,
  skip: number = 0
): Promise<I_Offline_Course_Model[]> {
  if (!Types.ObjectId.isValid(instructorId)) {
    throw new ValidationError('Invalid instructor ID');
  }

  try {
    return await this.find({
      courseInstructor: instructorId,
      'enrollmentStatus.courseStatus': 'Available',
      deletedAt: null
    })
      .sort({ 'courseCategory.trendingScore': -1 })
      .limit(limit)
      .skip(skip)
      .lean();
  } catch (error) {
    throw new DatabaseError(`Failed to find courses by instructor: ${error}`);
  }
};

// Instance Methods with Transactions and Error Handling
offlineCourseSchema.methods.enrollStudent = async function (
  studentId: Types.ObjectId,
  batchId?: Types.ObjectId,
  session?: any
): Promise<I_Offline_Course_Model> {
  try {
    if (this.enrollmentStatus.enrollmentStatus !== "Open") {
      throw new ValidationError("Enrollment is not open");
    }

    if (batchId) {
      const batch = this.courseLogistics.find((b: any) => b.batchId.equals(batchId));
      if (!batch) {
        throw new NotFoundError("Invalid batch ID");
      }
      if (batch.isFull) {
        throw new ValidationError("Batch is full");
      }
    }

    if (!this.enrollmentStatus.enrolledStudents.some((id: any) => id.equals(studentId))) {
      this.enrollmentStatus.enrolledStudents.push(studentId);
      await this.save({ session });

      // Update batch status if needed
      if (batchId) {
        const batch = this.courseLogistics.find((b: any) => b.batchId.equals(batchId));
        if (batch && this.enrollmentStatus.enrolledStudents.length >= batch.maxStudentsSeats) {
          batch.isFull = true;
          await this.save({ session });
        }
      }

      // Update trending score
      await this.calculateTrendingScore();
    }

    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to enroll student: ${error}`);
  }
};

offlineCourseSchema.methods.updateEnrollmentStatus = async function (): Promise<I_Offline_Course_Model> {
  try {
    const now = new Date();
    let isClosed = false;

    for (const batch of this.courseLogistics) {
      if (
        now >= batch.enrollmentDeadline ||
        now >= batch.courseEndDate ||
        batch.isFull
      ) {
        isClosed = true;
      }
    }

    this.enrollmentStatus.enrollmentStatus = isClosed
      ? "Closed"
      : now < this.courseLogistics[0]?.courseStartDate
        ? "Open"
        : "In Progress";

    await this.save();
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to update enrollment status: ${error}`);
  }
};

offlineCourseSchema.methods.addBatch = async function (
  batchId: Types.ObjectId,
  maxStudentsSeats: number,
  enrollmentDeadline: Date,
  startDate: Date,
  endDate: Date,
  session?: any
): Promise<I_Offline_Course_Model> {
  try {
    if (!this.courseLogistics.some((b: any) => b.batchId.equals(batchId))) {
      this.courseLogistics.push({
        batchId,
        maxStudentsSeats,
        enrollmentDeadline,
        courseStartDate: startDate,
        courseEndDate: endDate,
        isFull: false
      });
      await this.save({ session });
    }
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to add batch: ${error}`);
  }
};

offlineCourseSchema.methods.removeBatch = async function (
  batchId: Types.ObjectId,
  session?: any
): Promise<I_Offline_Course_Model> {
  try {
    this.courseLogistics = this.courseLogistics.filter((b: any) => !b.batchId.equals(batchId));
    await this.save({ session });
    return this as any;
  } catch (error) {
    throw new DatabaseError(`Failed to remove batch: ${error}`);
  }
};

offlineCourseSchema.methods.updateCourseDetails = async function (
  updates: Partial<I_Offline_Course_Details_Model>
): Promise<I_Offline_Course_Model> {
  try {
    Object.assign(this.course, updates);
    await this.save();
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to update course details: ${error}`);
  }
};

offlineCourseSchema.methods.updateCategory = async function (
  updates: Partial<I_Offline_Course_Category>
): Promise<I_Offline_Course_Model> {
  try {
    Object.assign(this.courseCategory, updates);
    await this.save();
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to update course category: ${error}`);
  }
};

offlineCourseSchema.methods.updatePricing = async function (
  updates: Partial<I_Offline_Course_Pricing_And_Offer>
): Promise<I_Offline_Course_Model> {
  try {
    Object.assign(this.coursePricingAndOffers, updates);
    await this.save();
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to update pricing: ${error}`);
  }
};

offlineCourseSchema.methods.updateAdditionalFeatures = async function (
  updates: Partial<I_Offline_Course_Additional_Features>
): Promise<I_Offline_Course_Model> {
  try {
    Object.assign(this.courseAdditionalFeatures, updates);
    await this.save();
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to update additional features: ${error}`);
  }
};

offlineCourseSchema.methods.updateSEO = async function (
  updates: Partial<I_Offline_Course_SEO_And_Marketing>
): Promise<I_Offline_Course_Model> {
  try {
    Object.assign(this.courseSEOAndMarketing, updates);
    await this.save();
    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to update SEO: ${error}`);
  }
};

offlineCourseSchema.methods.calculateTrendingScore = async function (): Promise<number> {
  // Only update if it's been more than 6 hours since last update
  const now = new Date();
  const lastUpdate = this.courseCategory.lastTrendingUpdate;
  const hoursSinceLastUpdate = lastUpdate
    ? (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSinceLastUpdate < 6) {
    return this.courseCategory.trendingScore;
  }

  try {
    const enrollmentCount = this.enrollmentStatus.enrolledStudents.length;
    const ratingScore = this.courseAdditionalFeatures.ratings.average * this.courseAdditionalFeatures.ratings.count;

    const recentActivity = await mongoose.models.Enrollment.countDocuments({
      course: this._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const score = enrollmentCount * 0.4 + ratingScore * 0.4 + recentActivity * 0.2;

    this.courseCategory.trendingScore = parseFloat(score.toFixed(2));
    this.courseCategory.lastTrendingUpdate = now;

    await this.save();

    return this.courseCategory.trendingScore;
  } catch (error) {
    throw new DatabaseError(`Failed to calculate trending score: ${error}`);
  }
};

offlineCourseSchema.methods.softDelete = async function (): Promise<I_Offline_Course_Model> {
  try {
    this.deletedAt = new Date();
    await this.save();

    return this as I_Offline_Course_Model;
  } catch (error) {
    throw new DatabaseError(`Failed to soft delete course: ${error}`);
  }
};

offlineCourseSchema.methods.updateRating = async function (): Promise<void> {
  try {
    const reviews = await mongoose.models.Review.find({
      _id: { $in: this.courseAdditionalFeatures.reviews }
    });

    const count = reviews.length;
    const average = count > 0
      ? reviews.reduce((sum, review) => sum + (review.score || 0), 0) / count
      : 0;

    this.courseAdditionalFeatures.ratings = {
      average: parseFloat(average.toFixed(2)),
      count,
      lastUpdated: new Date()
    };

    await this.save();
    await this.calculateTrendingScore();
  } catch (error) {
    throw new DatabaseError(`Failed to update rating: ${error}`);
  }
};

// Middleware for auto-calculating trending score
offlineCourseSchema.pre<I_Offline_Course_Model>("save", function (next) {
  // Only update if enrollments or ratings have changed
  if (this.isModified('enrollmentStatus.enrolledStudents')) {
    const enrolledCount = this.enrollmentStatus.enrolledStudents?.length || 0;
    const rating = this.courseAdditionalFeatures.ratings?.average || 0;
    this.courseCategories.trendingScore = enrolledCount * 0.5 + rating * 0.5;
    this.courseCategories.lastTrendingUpdate = new Date();
  }
  next();
});

// Model Creation
const OfflineCourse = mongoose.models.OfflineCourse ||
  model<I_Offline_Course_Model, I_Offline_Course_Model_Static>("OfflineCourse", offlineCourseSchema);

export default OfflineCourse;