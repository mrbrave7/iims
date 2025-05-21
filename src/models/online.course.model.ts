import mongoose, { Schema, Document, Types, model, Model, Error } from 'mongoose';
import validator from 'validator';
import redis from 'redis';
import util from 'util';
import { redisClient } from '@/lib/redis';
import { Type } from '@upstash/redis';

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
;

// Sub-interfaces for logical sections
interface IRefundPolicy {
  isRefundable: boolean;
  refundPeriodDays: number;
  conditions?: string;
}

interface IRating {
  courseSlug: string;
  average: number;
  count: number;
  lastUpdated: Date;
}

interface IFAQ {
  question: string;
  answer: string;
}

interface IDiscussionGroup {
  groupName: string;
  groupUrl: string;
}

// Basic Info Section
interface IBasicInfo {
  courseName: string;
  courseGoals: string[];
  courseLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Academic';
  syllabusOutline: string[];
  courseDescription: string;
  courseDurationInHours: number;
  courseCategories: string[];
  courseSubCategories: string[];
  preRequisites: string[];
  courseBannerUrl: string;
  trendingScore: number;
  lastTrendingUpdate: Date;
}

// Pricing & Offers Section
interface IPricingAndOffers {
  currency: string;
  basePrice: number;
  isCourseOnOffer: boolean;
  offerDetails?: Types.ObjectId;
  termsAndConditions: string;
  courseValidityInMonths: number;
}

// Additional Information Section
interface IAdditionalInformation {
  faqs: IFAQ[];
  refundPolicy: IRefundPolicy;
  targetAudience: string[];
  availableLanguages: string[];
  rating: IRating;
  reviews: Types.ObjectId[];
  enrollments: Types.ObjectId[];
  discussionGroups: IDiscussionGroup[];
  certificateTemplateUrl: string;
  contactDetails: {
    email: string;
    phone: string;
  };
}

// SEO & Marketing Section
interface ISeoMarketing {
  seoMetaTitle?: string;
  seoMetaDescription?: string;
  tags: string[];
  promoVideoUrl?: string;
  seoKeywords?: string[];
}

// Course Status Enum
export enum CourseStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
  Deleted = 'deleted'
}

// Main interface
interface IOnlineCourse extends Document {
  basicInfo: IBasicInfo;
  courseInstructor: Types.ObjectId;
  courseModules: Types.ObjectId[];
  pricingAndOffers: IPricingAndOffers;
  additionalInformation: IAdditionalInformation;
  seoMarketing: ISeoMarketing;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  schemaVersion: string;

  // Instance methods
  updateRating(session?: any): Promise<void>;
  addEnrollment(enrollmentId: Types.ObjectId, session?: any): Promise<void>;
  calculateTrendingScore(): Promise<number>;
  softDelete(): Promise<void>;
  updateBasicInfo(updates: Partial<IBasicInfo>): Promise<IOnlineCourse>;
  updatePricing(updates: Partial<IPricingAndOffers>): Promise<IOnlineCourse>;
  updateAdditionalInfo(updates: Partial<IAdditionalInformation>): Promise<IOnlineCourse>;
  updateSeoFields(updates: Partial<ISeoMarketing>): Promise<IOnlineCourse>;
  changeStatus(newStatus: CourseStatus): Promise<IOnlineCourse>;
}

// Static methods interface
interface IOnlineCourseModel extends Model<IOnlineCourse> {
  findByCategory(category: string, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findByStatus(status: CourseStatus, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findPopularCourses(limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findByInstructor(instructorId: Types.ObjectId | string, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findByRatings(minRating: number, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findByPriceRange(minPrice: number, maxPrice: number, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findByLanguage(language: string, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findRecentCourses(limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  findByLevel(level: 'Beginner' | 'Intermediate' | 'Advanced', limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  searchByName(name: string, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  searchByText(query: string, limit?: number, skip?: number): Promise<IOnlineCourse[]>;
  getTrendingCoursesFromCache(): Promise<IOnlineCourse[] | null>;
}

// Helper function to generate slug
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

// Mongoose Schema
const OnlineCourseSchema = new Schema<IOnlineCourse, IOnlineCourseModel>(
  {
    basicInfo: {
      courseName: {
        type: String,
        required: [true, 'Course name is required'],
        trim: true,
        unique: true,
        index: true
      },
      courseSlug: {
        type: String,
        required: [true, 'Course slug is required'],
        trim: true,
        unique: true,
        index: true
      },
      courseGoals: {
        type: [String],
        validate: {
          validator: (arr: string[]) => arr.length > 0,
          message: 'At least one course goal is required',
        },
        default: [],
      },
      courseLevel: {
        type: String,
        enum: {
          values: ['Beginner', 'Intermediate', 'Advanced', 'Academic'],
          message: 'Invalid course level',
        },
        required: [true, 'Course level is required'],
      },
      syllabusOutline: {
        type: [String],
        validate: {
          validator: (arr: string[]) => arr.length > 0,
          message: 'At least one syllabus topic is required',
        },
        default: [],
      },
      courseDescription: {
        type: String,
        required: [true, 'Course description is required'],
        trim: true,
      },
      courseDurationInHours: {
        type: Number,
        required: [true, 'Course duration is required'],
        min: [0, 'Course duration cannot be negative'],
      },
      courseCategories: {
        type: [String],
        required: [true, 'At least one category is required'],
        default: [],
        index: true
      },
      courseSubCategories: {
        type: [String],
        default: [],
      },
      courseBannerUrl: {
        type: String,
        required: [true, 'Course banner URL is required'],
        validate: {
          validator: (url: string) => validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
          message: 'Invalid banner URL',
        },
      },
      preRequisites: {
        type: [String],
        default: [],
        validate: {
          validator: (arr: string[]) => arr.every((item) => item.trim().length > 0),
          message: 'Pre-requisites must not contain empty strings',
        },
        set: (arr: string[]) => arr.map((item) => item.trim()),
      },
      trendingScore: {
        type: Number,
        default: 0,
        min: [0, 'Trending score cannot be negative'],
        index: true
      },
      lastTrendingUpdate: {
        type: Date,
        default: null
      }
    },
    courseInstructor: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: [true, 'Course instructor is required'],
      index: true
    },
    courseModules: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        validate: {
          validator: async (id: Types.ObjectId) => await model('Module').exists({ _id: id }),
          message: 'Invalid module ID',
        },
      },
    ],
    pricingAndOffers: {
      currency: {
        type: String,
        required: [true, 'Currency is required'],
        enum: {
          values: ["USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "INR", "NPR", "NZD",
            "SGD", "HKD", "KRW", "ZAR", "BRL", "MXN", "RUB", "SEK", "NOK", "DKK", "AED",
            "ARS", "CLP", "EGP", "ILS", "MYR", "PHP", "SAR", "THB", "TRY"],
          message: 'Invalid currency code',
        },
      },
      basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative'],
        index: true
      },
      courseValidityInMonths: {
        type: Number,
        required: [true, 'Course validity is required'],
        min: [0, 'Course validity cannot be negative'],
      },
      isCourseOnOffer: {
        type: Boolean,
        required: true,
        default: false,
      },
      offerDetails: {
        type: Schema.Types.ObjectId,
        ref: "Offer"
      },
      termsAndConditions: {
        type: String,
        required: [true, 'Terms and conditions are required'],
        trim: true,
      },
    },
    additionalInformation: {
      certificateTemplateUrl: {
        type: String,
        required: [true, 'Certificate template URL is required'],
        trim: true,
        validate: {
          validator: (url: string) => validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
          message: 'Invalid certificate template URL',
        },
      },
      refundPolicy: {
        isRefundable: { type: Boolean, required: true, default: false },
        refundPeriodDays: {
          type: Number,
          min: [0, 'Refund period cannot be negative'],
          default: 0,
        },
        conditions: { type: String, trim: true },
      },
      availableLanguages: {
        type: [String],
        trim: true,
        default: [],
        index: true
      },
      rating: {
        courseSlug: {
          type: String,
          required: [true, 'Course slug is required'],
          unique: true,
          trim: true,
        },
        average: {
          type: Number,
          required: true,
          min: [0, 'Rating average cannot be negative'],
          max: [5, 'Rating average cannot exceed 5'],
          default: 0,
          index: true
        },
        count: {
          type: Number,
          required: true,
          min: [0, 'Rating count cannot be negative'],
          default: 0,
        },
        lastUpdated: {
          type: Date,
          default: Date.now
        }
      },
      reviews: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Review',
          validate: {
            validator: async (id: Types.ObjectId) => await model('Review').exists({ _id: id }),
            message: 'Invalid review ID',
          },
        },
      ],
      faqs: {
        type: [
          {
            question: { type: String, required: [true, 'FAQ question is required'], trim: true },
            answer: { type: String, required: [true, 'FAQ answer is required'], trim: true },
          },
        ],
        validate: {
          validator: (arr: IFAQ[]) => arr.length > 0,
          message: 'At least one FAQ is required',
        },
      },
      targetAudience: {
        type: [String],
        validate: {
          validator: (arr: string[]) => arr.length > 0,
          message: 'At least one target audience is required',
        },
        default: [],
      },
      enrollments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Enrollment',
          validate: {
            validator: async (id: Types.ObjectId) => await model('Enrollment').exists({ _id: id }),
            message: 'Invalid enrollment ID',
          },
        },
      ],
      discussionGroups: [
        {
          groupName: { type: String, required: [true, 'Group name is required'], trim: true },
          groupUrl: {
            type: String,
            required: [true, 'Group URL is required'],
            validate: {
              validator: (url: string) => validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
              message: 'Invalid group URL',
            },
          },
        },
      ],
      contactDetails: {
        email: {
          type: String,
          required: [true, 'Contact email is required'],
          validate: {
            validator: (email: string) => validator.isEmail(email),
            message: 'Invalid email format',
          },
        },
        phone: {
          type: String,
          required: [true, 'Contact phone is required'],
          validate: {
            validator: (phone: string) => validator.isMobilePhone(phone, 'any'),
            message: 'Invalid phone number',
          },
        },
      },
    },
    seoMarketing: {
      seoMetaTitle: { type: String, trim: true },
      seoMetaDescription: { type: String, trim: true },
      tags: {
        type: [String],
        trim: true,
        default: [],
        index: true
      },
      seoKeywords: {
        type: [String],
        trim: true,
        default: []
      },
      promoVideoUrl: {
        type: String,
        validate: {
          validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
          message: 'Invalid promo video URL',
        },
      },
    },
    status: {
      type: String,
      enum: {
        values: Object.values(CourseStatus),
        message: 'Invalid status',
      },
      required: [true, 'Status is required'],
      default: CourseStatus.Draft,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    },
    schemaVersion: {
      type: String,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
    collection: 'online_courses',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text Index for search
OnlineCourseSchema.index({
  'basicInfo.courseName': 'text',
  'basicInfo.courseDescription': 'text',
  'basicInfo.syllabusOutline': 'text',
  'seoMarketing.tags': 'text',
  'seoMarketing.seoKeywords': 'text'
}, {
  weights: {
    'basicInfo.courseName': 10,
    'seoMarketing.tags': 5,
    'basicInfo.courseDescription': 3,
    'basicInfo.syllabusOutline': 2,
    'seoMarketing.seoKeywords': 1
  },
  name: 'course_text_search'
});

// Compound Indexes
OnlineCourseSchema.index({
  status: 1,
  'basicInfo.trendingScore': -1
});

OnlineCourseSchema.index({
  status: 1,
  'pricingAndOffers.basePrice': 1
});

OnlineCourseSchema.index({
  status: 1,
  'basicInfo.courseLevel': 1
});

// Middleware for auto-generating slug and SEO fields
OnlineCourseSchema.pre<IOnlineCourse>('save', function (next) {
  if (this.isModified('basicInfo.courseName')) {

    if (!this.seoMarketing.seoMetaTitle) {
      this.seoMarketing.seoMetaTitle = `Learn ${this.basicInfo.courseName} | Online Course`;
    }

    if (!this.seoMarketing.seoMetaDescription && this.basicInfo.courseDescription) {
      this.seoMarketing.seoMetaDescription =
        this.basicInfo.courseDescription.substring(0, 150) + '...';
    }
  }
  next();
});

// Middleware to exclude deleted courses from queries
OnlineCourseSchema.pre(/^find/, function (this: any, next) {
  if (this.getFilter().deletedAt === undefined) {
    this.where({ deletedAt: null });
  }
  next();
});

// Static Methods with Redis Caching
OnlineCourseSchema.statics.findPopularCourses = async function (
  limit: number = 10,
  skip: number = 0
): Promise<IOnlineCourse[]> {

  try {
    // If not in cache, query database
    const courses = await this.find({
      status: CourseStatus.Published,
      deletedAt: null
    })
      .sort({ 'basicInfo.trendingScore': -1 })
      .limit(limit)
      .skip(skip)
      .lean();
    return courses;
  } catch (error) {
    throw new DatabaseError(`Failed to find popular courses: ${error}`);
  }
};


OnlineCourseSchema.statics.searchByText = async function (
  query: string,
  limit: number = 10,
  skip: number = 0
): Promise<IOnlineCourse[]> {
  if (!query || typeof query !== 'string') {
    throw new ValidationError('Invalid search query');
  }

  try {
    return await this.find(
      { $text: { $search: query } },
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
OnlineCourseSchema.statics.findByCategory = async function (
  category: string,
  limit: number = 10,
  skip: number = 0
): Promise<IOnlineCourse[]> {
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Invalid category');
  }

  try {
    return await this.find({
      'basicInfo.courseCategories': { $in: [category] },
      status: CourseStatus.Published,
      deletedAt: null
    })
      .limit(limit)
      .skip(skip)
      .lean();
  } catch (error) {
    throw new DatabaseError(`Failed to find courses by category: ${error}`);
  }
};

// Instance Methods with Transactions and Error Handling
OnlineCourseSchema.methods.updateRating = async function (session?: any): Promise<void> {
  try {
    const reviews = await model('Review')
      .find({ _id: { $in: this.additionalInformation.reviews } })
      .session(session || null);

    const count = reviews.length;
    const average = count > 0
      ? reviews.reduce((sum, review) => sum + (review.score || 0), 0) / count
      : 0;

    this.additionalInformation.rating = {
      ...this.additionalInformation.rating,
      count,
      average: parseFloat(average.toFixed(2)),
      lastUpdated: new Date()
    };

    await this.save({ session });
  } catch (error) {
    throw new DatabaseError(`Failed to update rating: ${error}`);
  }
};

OnlineCourseSchema.methods.addEnrollment = async function (
  enrollmentId: Types.ObjectId,
  session?: any
): Promise<void> {
  try {
    if (!this.additionalInformation.enrollments.includes(enrollmentId)) {
      this.additionalInformation.enrollments.push(enrollmentId);
      await this.save({ session });

      // Update trending score after adding enrollment
      await this.calculateTrendingScore();
    }
  } catch (error) {
    throw new DatabaseError(`Failed to add enrollment: ${error}`);
  }
};

OnlineCourseSchema.methods.calculateTrendingScore = async function (): Promise<number> {
  // Only update if it's been more than 6 hours since last update
  const now = new Date();
  const lastUpdate = this.basicInfo.lastTrendingUpdate;
  const hoursSinceLastUpdate = lastUpdate
    ? (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSinceLastUpdate < 6) {
    return this.basicInfo.trendingScore;
  }

  try {
    const enrollmentCount = this.additionalInformation.enrollments.length;
    const ratingScore = this.additionalInformation.rating.average * this.additionalInformation.rating.count;

    const recentActivity = await model('Enrollment').countDocuments({
      course: this._id,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const score = enrollmentCount * 0.4 + ratingScore * 0.4 + recentActivity * 0.2;

    this.basicInfo.trendingScore = parseFloat(score.toFixed(2));
    this.basicInfo.lastTrendingUpdate = now;

    await this.save();

    return this.basicInfo.trendingScore;
  } catch (error) {
    throw new DatabaseError(`Failed to calculate trending score: ${error}`);
  }
};

// Create and export the model
const OnlineCourse = mongoose.models.OnlineCourse || model<IOnlineCourse, IOnlineCourseModel>('OnlineCourse', OnlineCourseSchema);
export default OnlineCourse;