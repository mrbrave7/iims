import { Document, Model, Schema, Types, model, models } from 'mongoose';
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';

// ====================== ENUMS ======================
export enum CourseType {
    ONLINE = 'online',
    OFFLINE = 'offline',
    FREE = 'free'
}

export enum CourseStatus {
    DRAFT = 'draft',
    AVAILABLE = 'available',
    UNAVAILABLE = 'unavailable',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
    DELETED = 'deleted'
}

export enum CourseLevel {
    BEGINNER = 'Beginner',
    INTERMEDIATE = 'Intermediate',
    ADVANCED = 'Advanced',
    ACADEMIC = 'Academic'
}

export enum EnrollmentStatus {
    OPEN = 'Open',
    CLOSED = 'Closed',
    IN_PROGRESS = 'In Progress'
}

// ====================== INTERFACES ======================
interface IFAQ {
    question: string;
    answer: string;
}

interface IRefundPolicy {
    isRefundable: boolean;
    refundPeriodDays: number;
    conditions?: string[];
}

interface IRating {
    average: number;
    count: number;
    lastUpdated: Date;
}

interface IContactDetails {
    email: string;
    phone: string;
}

interface IDiscussionGroup {
    groupName: string;
    groupUrl: string;
}

interface IPaymentPlan {
    planName: string;
    amount: number;
    duration: string;
}

interface ICoreDetails {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseGoals: string[];
    courseLevel: CourseLevel;
    syllabusOutline: string[];
    preRequisites?: string[];
    courseDurationInHours?: number;
    courseDurationInDays?: number;
    courseClassDurationInMin?: number;
    courseValidityInMonths?: number;
}

interface ICourseMetadata {
    courseType: CourseType;
    courseCategories?: string[];
    courseSubCategories?: string[];
    targetAudience: string[];
    availableLanguages: string[];
    tags: string[];
    trendingScore: number;
    lastTrendingUpdate: Date;
}

interface ICoursePricing {
    currency?: string;
    basePrice?: number;
    paymentPlans?: IPaymentPlan[];
    isCourseOnOffer: boolean;
    offerDetails?: Types.ObjectId;
    termsAndConditions?: string[];
}


interface ICourseContent {
    courseInstructors?: Types.ObjectId[];
    courseModules: Types.ObjectId[];
    materialsProvided?: string[];
    equipmentRequired?: string[];
}

interface ICourseEnrollment {
    courseStatus: CourseStatus;
    enrollmentStatus?: EnrollmentStatus;
    enrollments?: Types.ObjectId[];
    batches?: Types.ObjectId[];
}

interface ICourseSEO {
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    seoKeywords?: string[];
    promoVideoUrl?: string;
    courseBannerUrl?: string;
}

interface ICourseAdditionalFeatures {
    ratings: IRating;
    reviews: Types.ObjectId[];
    faqs?: IFAQ[];
    refundPolicy?: IRefundPolicy;
    certificateTemplateUrl?: string;
    accessibilityFeatures?: string[];
    discussionGroups?: IDiscussionGroup[];
    contactDetails?: IContactDetails;
}

interface ICourseAdministrative {
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    schemaVersion: string;
    createdBy?: Types.ObjectId; // Added for ownership tracking
}

export interface IUnifiedCourse extends Document {
    coreDetails: ICoreDetails;
    courseContent: ICourseContent;
    courseMetadata: ICourseMetadata;
    coursePricing?: ICoursePricing;
    courseEnrollment: ICourseEnrollment;
    courseSEO: ICourseSEO;
    courseAdditionalFeatures: ICourseAdditionalFeatures;
    courseAdministrative: ICourseAdministrative;

    // Instance Methods
    addReview(reviewId: Types.ObjectId): Promise<this>;
    addModule(moduleId: Types.ObjectId): Promise<this>;
    removeModule(moduleId: Types.ObjectId): Promise<this>;
    enrollStudent(studentId: Types.ObjectId, batchId?: Types.ObjectId): Promise<this>;
    addEnrollment(enrollmentId: Types.ObjectId): Promise<this>;
    updateEnrollmentStatus(status: EnrollmentStatus): Promise<this>;
    addBatch(
        batchId: Types.ObjectId,
        maxStudentsSeats: number,
        enrollmentDeadline: Date,
        startDate: Date,
        endDate: Date
    ): Promise<this>;
    removeBatch(batchId: Types.ObjectId): Promise<this>;
    calculateTrendingScore(): Promise<number>;
    changeStatus(newStatus: CourseStatus): Promise<this>;
    softDelete(): Promise<this>;
    updateCoreDetails(updates: Partial<ICoreDetails>): Promise<this>;
    updateContent(updates: Partial<ICourseContent>): Promise<this>;
    updateMetadata(updates: Partial<ICourseMetadata>): Promise<this>;
    updateEnrollmentData(updates: Partial<ICourseEnrollment>): Promise<this>;
    updateSEO(updates: Partial<ICourseSEO>): Promise<this>;
    updateAdditionalFeatures(updates: Partial<ICourseAdditionalFeatures>): Promise<this>;
    updateCategory(updates: { courseCategory?: string; courseSubCategory?: string }): Promise<this>;
}

export interface IUnifiedCourseModel extends Model<IUnifiedCourse> {
    findCourses(query: any, limit?: number, skip?: number, sort?: any): Promise<IUnifiedCourse[]>;
    findByType(courseType: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByCategory(category: string, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByLevel(level: CourseLevel, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByLanguage(language: string, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByStatus(status: CourseStatus, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findAvailableCourses(courseType?: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByInstructor(instructorId: Types.ObjectId, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByBatch(batchId: Types.ObjectId, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findPopularCourses(courseType?: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByRatings(minRating: number, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    updateCourseTrendingScore(courseId: Types.ObjectId, score: number): Promise<IUnifiedCourse | null>;
    findByPriceRange(minPrice: number, maxPrice: number, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findFreeCourses(limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findCoursesOnOffer(courseType?: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findByDateRange(startDate: Date, endDate: Date, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    findRecentCourses(courseType?: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    searchByName(name: string, courseType?: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    searchByText(query: string, courseType?: CourseType, limit?: number, skip?: number): Promise<IUnifiedCourse[]>;
    bulkUpdateStatus(courseIds: Types.ObjectId[], newStatus: CourseStatus): Promise<any>;
    bulkUpdateTrendingScores(updates: Array<{ courseId: Types.ObjectId, score: number }>): Promise<any>;
}

// ====================== SCHEMA DEFINITION ======================
const CourseSchema = new Schema<IUnifiedCourse, IUnifiedCourseModel>(
    {
        coreDetails: {
            courseName: {
                type: String,
                required: [true, 'Course name is required'],
                trim: true,
                index: true,
                minlength: [5, 'Course name must be at least 5 characters'],
                maxlength: [100, 'Course name cannot exceed 100 characters']
            },
            courseSlug: {
                type: String,
                required: [true, 'Course slug is required'],
                unique: true,
                index: true,
                trim: true,
                lowercase: true,
                minlength: [5, 'Course slug must be at least 5 characters'],
                maxlength: [100, 'Course slug cannot exceed 100 characters'],
                validate: {
                    validator: (value: string) => /^[a-z0-9-]+$/.test(value),
                    message: 'Course slug can only contain lowercase letters, numbers, and hyphens'
                }
            },
            courseDescription: {
                type: String,
                required: [true, 'Course description is required'],
                trim: true,
                minlength: [10, 'Description must be at least 10 characters'],
                maxlength: [3000, 'Description cannot exceed 3000 characters']
            },
            courseGoals: [{
                type: String,
                required: [true, 'Course goal is required'],
                trim: true,
                minlength: [5, 'Goal must be at least 5 characters'],
                maxlength: [500, 'Goal cannot exceed 500 characters']
            }],
            courseLevel: {
                type: String,
                required: [true, 'Course level is required'],
                enum: {
                    values: Object.values(CourseLevel),
                    message: 'Invalid course level'
                },
                index: true
            },
            syllabusOutline: [{
                type: String,
                required: [true, 'Syllabus outline is required'],
                trim: true,
                minlength: [5, 'Outline must be at least 5 characters'],
                maxlength: [500, 'Outline cannot exceed 500 characters']
            }],
            preRequisites: [{
                type: String,
                trim: true,
                minlength: [5, 'Prerequisite must be at least 5 characters'],
                maxlength: [500, 'Prerequisite cannot exceed 500 characters']
            }],
            courseDurationInHours: {
                type: Number,
                min: [0, 'Duration cannot be negative']
            },
            courseDurationInDays: {
                type: Number,
                min: [0, 'Duration cannot be negative']
            },
            courseClassDurationInMin: {
                type: Number,
                min: [0, 'Duration cannot be negative']
            },
            courseValidityInMonths: {
                type: Number,
                min: [0, 'Validity cannot be negative']
            }
        },
        courseContent: {
            courseInstructors: [{
                type: Schema.Types.ObjectId,
                ref: 'Instructor'
            }],
            courseModules: [{
                type: Schema.Types.ObjectId,
                ref: 'Module',
                required: [true, 'At least one module is required']
            }],
            materialsProvided: [{ type: String, trim: true }],
            equipmentRequired: [{ type: String, trim: true }]
        },
        courseMetadata: {
            courseType: {
                type: String,
                required: [true, 'Course type is required'],
                enum: {
                    values: Object.values(CourseType),
                    message: 'Invalid course type'
                },
                index: true
            },
            courseCategories: [{ type: String, trim: true, index: true }],
            courseSubCategories: [{ type: String, trim: true, index: true }],
            targetAudience: [{
                type: String,
                trim: true,
                minlength: [3, 'Target audience must be at least 3 characters'],
                maxlength: [100, 'Target audience cannot exceed 100 characters']
            }],
            availableLanguages: [{
                type: String,
                trim: true,
                required: [true, 'At least one language is required'],
                match: [/^[a-zA-Z]{2,}$/, 'Invalid language code']
            }],
            tags: [{
                type: String,
                trim: true,
                minlength: [2, 'Tag must be at least 2 characters'],
                maxlength: [50, 'Tag cannot exceed 50 characters']
            }],
            trendingScore: {
                type: Number,
                default: 0,
                min: [0, 'Trending score cannot be negative']
            },
            lastTrendingUpdate: {
                type: Date,
                default: Date.now
            }
        },
        coursePricing: {
            currency: {
                type: String,
                trim: true,
                match: [/^[A-Z]{3}$/, 'Invalid currency code']
            },
            basePrice: {
                type: Number,
                min: [0, 'Price cannot be negative']
            },
            paymentPlans: [{
                planName: {
                    type: String,
                    required: [true, 'Plan name is required'],
                    trim: true,
                    minlength: [3, 'Plan name must be at least 3 characters']
                },
                amount: {
                    type: Number,
                    required: [true, 'Plan amount is required'],
                    min: [0, 'Plan amount cannot be negative']
                },
                duration: {
                    type: String,
                    required: [true, 'Plan duration is required'],
                    trim: true
                }
            }],
            isCourseOnOffer: {
                type: Boolean,
                default: false
            },
            offerDetails: {
                type: Schema.Types.ObjectId,
                ref: 'Offer'
            },
            termsAndConditions: [{
                type: String,
                trim: true,
                maxlength: [5000, 'Terms cannot exceed 5000 characters']
            }]
        },
        courseEnrollment: {
            courseStatus: {
                type: String,
                required: [true, 'Course status is required'],
                enum: {
                    values: Object.values(CourseStatus),
                    message: 'Invalid course status'
                },
                default: CourseStatus.DRAFT
            },
            enrollmentStatus: {
                type: String,
                enum: {
                    values: Object.values(EnrollmentStatus),
                    message: 'Invalid enrollment status'
                }
            },
            enrollments: [{
                type: Schema.Types.ObjectId,
                ref: 'Enrollment'
            }],
            batches: [{
                type: Schema.Types.ObjectId,
                ref: 'Batch'
            }]
        },
        courseSEO: {
            seoMetaTitle: {
                type: String,
                trim: true,
                maxlength: [70, 'SEO meta title cannot exceed 70 characters']
            },
            seoMetaDescription: {
                type: String,
                trim: true,
                maxlength: [160, 'SEO meta description cannot exceed 160 characters']
            },
            seoKeywords: [{
                type: String,
                trim: true,
                maxlength: [50, 'Keyword cannot exceed 50 characters']
            }],
            promoVideoUrl: {
                type: String,
                trim: true,
                validate: {
                    validator: (value: string) => !value || validator.isURL(value),
                    message: 'Invalid URL format for promo video'
                }
            },
            courseBannerUrl: {
                type: String,
                trim: true,
                validate: {
                    validator: (value: string) => !value || validator.isURL(value),
                    message: 'Invalid URL format for course banner'
                }
            }
        },
        courseAdditionalFeatures: {
            ratings: {
                average: {
                    type: Number,
                    default: 0,
                    min: [0, 'Rating cannot be negative'],
                    max: [5, 'Rating cannot exceed 5']
                },
                count: {
                    type: Number,
                    default: 0,
                    min: [0, 'Rating count cannot be negative']
                },
                lastUpdated: {
                    type: Date,
                    default: Date.now
                }
            },
            reviews: [{
                type: Schema.Types.ObjectId,
                ref: 'Review'
            }],
            faqs: [{
                question: {
                    type: String,
                    required: [true, 'FAQ question is required'],
                    trim: true,
                    minlength: [5, 'Question must be at least 5 characters']
                },
                answer: {
                    type: String,
                    required: [true, 'FAQ answer is required'],
                    trim: true,
                    minlength: [5, 'Answer must be at least 5 characters']
                }
            }],
            refundPolicy: {
                isRefundable: {
                    type: Boolean,
                    default: false
                },
                refundPeriodDays: {
                    type: Number,
                    min: [0, 'Refund period cannot be negative']
                },
                conditions: [{
                    type: String,
                    trim: true,
                    maxlength: [1000, 'Conditions cannot exceed 1000 characters']
                }]
            },
            certificateTemplateUrl: {
                type: String,
                trim: true,
                validate: {
                    validator: (value: string) => !value || validator.isURL(value),
                    message: 'Invalid URL format for certificate template'
                }
            },
            accessibilityFeatures: [{ type: String, trim: true }],
            discussionGroups: [{
                groupName: {
                    type: String,
                    required: [true, 'Group name is required'],
                    trim: true
                },
                groupUrl: {
                    type: String,
                    required: [true, 'Group URL is required'],
                    trim: true,
                    validate: {
                        validator: (value: string) => validator.isURL(value),
                        message: 'Invalid URL format for group URL'
                    }
                }
            }],
            contactDetails: {
                email: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: (value: string) => !value || validator.isEmail(value),
                        message: 'Invalid email format'
                    }
                },
                phone: {
                    type: String,
                    trim: true,
                    validate: {
                        validator: (value: string) => !value || validator.isMobilePhone(value),
                        message: 'Invalid phone number format'
                    }
                }
            }
        },
        courseAdministrative: {
            createdAt: {
                type: Date,
                default: Date.now
            },
            updatedAt: {
                type: Date,
                default: Date.now
            },
            deletedAt: {
                type: Date,
                default: null
            },
            schemaVersion: {
                type: String,
                required: [true, 'Schema version is required'],
                default: '1.0.0'
            },
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// ====================== INDEXES ======================
CourseSchema.index({
    'coreDetails.courseName': 'text',
    'coreDetails.courseDescription': 'text',
    'courseMetadata.tags': 'text'
}, { weights: { 'coreDetails.courseName': 10, 'coreDetails.courseDescription': 5, 'courseMetadata.tags': 3 } });

CourseSchema.index({
    'courseMetadata.trendingScore': -1,
    'courseAdditionalFeatures.ratings.average': -1
});

CourseSchema.index({ 'courseMetadata.courseType': 1 });
CourseSchema.index({ 'courseEnrollment.courseStatus': 1 });
CourseSchema.index({ 'courseContent.courseInstructors': 1 });
CourseSchema.index({ 'courseEnrollment.batches': 1 });

// ====================== VIRTUALS ======================
CourseSchema.virtual('isFreeCourse').get(function (this: IUnifiedCourse) {
    return this.courseMetadata.courseType === CourseType.FREE;
});

// ====================== MIDDLEWARE ======================
CourseSchema.pre<IUnifiedCourse>('save', async function (next) {
    // Sanitize string fields to prevent XSS
    if (this.coreDetails.courseName) {
        this.coreDetails.courseName = sanitizeHtml(this.coreDetails.courseName);
    }
    if (this.coreDetails.courseDescription) {
        this.coreDetails.courseDescription = sanitizeHtml(this.coreDetails.courseDescription);
    }
    if (this.courseMetadata.tags) {
        this.courseMetadata.tags = this.courseMetadata.tags.map(tag => sanitizeHtml(tag));
    }

    // Auto-generate slug if not provided
    if (!this.coreDetails.courseSlug && this.coreDetails.courseName) {
        this.coreDetails.courseSlug = generateSlug(this.coreDetails.courseName);
    }


    if (this.courseMetadata.courseType === CourseType.ONLINE) {
        if (!this.coreDetails.courseDurationInHours) {
            return next(new Error('Course duration in hours is required for online courses'));
        }
        if (!this.coreDetails.courseValidityInMonths) {
            return next(new Error('Course validity period is required for online courses'));
        }
    }

    if (this.courseMetadata.courseType === CourseType.OFFLINE) {
        if (!this.coreDetails.courseDurationInDays) {
            return next(new Error('Course duration in days is required for offline courses'));
        }
        if (!this.coreDetails.courseClassDurationInMin) {
            return next(new Error('Daily class duration is required for offline courses'));
        }
    }

    next();
});

// Handle index creation errors
CourseSchema.on('index', (error) => {
    console.error('Index creation failed:', error); // Replace with proper logging in production
});

// ====================== METHODS ======================
CourseSchema.methods.addReview = async function (this: IUnifiedCourse, reviewId: Types.ObjectId): Promise<IUnifiedCourse> {
    if (!this.courseAdditionalFeatures.reviews.includes(reviewId)) {
        this.courseAdditionalFeatures.reviews.push(reviewId);
    }
    return this.save();
};


CourseSchema.methods.addModule = async function (this: IUnifiedCourse, moduleId: Types.ObjectId): Promise<IUnifiedCourse> {
    if (!this.courseContent.courseModules.includes(moduleId)) {
        this.courseContent.courseModules.push(moduleId);
    }
    return this.save();
};

CourseSchema.methods.removeModule = async function (this: IUnifiedCourse, moduleId: Types.ObjectId): Promise<IUnifiedCourse> {
    this.courseContent.courseModules = this.courseContent.courseModules.filter(id => !id.equals(moduleId));
    return this.save();
};

CourseSchema.methods.addEnrollment = async function (this: IUnifiedCourse, enrollmentId: Types.ObjectId): Promise<IUnifiedCourse> {
    if (!this.courseEnrollment.enrollments?.includes(enrollmentId)) {
        this.courseEnrollment.enrollments = this.courseEnrollment.enrollments || [];
        this.courseEnrollment.enrollments.push(enrollmentId);
    }
    return this.save();
};

CourseSchema.methods.updateEnrollmentStatus = async function (this: IUnifiedCourse, status: EnrollmentStatus): Promise<IUnifiedCourse> {
    this.courseEnrollment.enrollmentStatus = status;
    return this.save();
};

CourseSchema.methods.addBatch = async function (
    this: IUnifiedCourse,
    batchId: Types.ObjectId,
    maxStudentsSeats: number,
    enrollmentDeadline: Date,
    startDate: Date,
    endDate: Date
): Promise<IUnifiedCourse> {
    if (this.courseMetadata.courseType !== CourseType.OFFLINE) {
        throw new Error('Batches are only applicable to offline courses');
    }
    if (!this.courseEnrollment.batches?.includes(batchId)) {
        this.courseEnrollment.batches = this.courseEnrollment.batches || [];
        this.courseEnrollment.batches.push(batchId);
    }
    return this.save();
};

CourseSchema.methods.removeBatch = async function (this: IUnifiedCourse, batchId: Types.ObjectId): Promise<IUnifiedCourse> {
    this.courseEnrollment.batches = this.courseEnrollment.batches?.filter(id => !id.equals(batchId)) || [];
    return this.save();
};

CourseSchema.methods.calculateTrendingScore = async function (this: IUnifiedCourse): Promise<number> {
    const enrollmentCount = this.courseEnrollment.enrollments?.length || 0;
    const reviewCount = this.courseAdditionalFeatures.reviews.length;
    const rating = this.courseAdditionalFeatures.ratings.average;

    // Configurable trending score calculation
    const score = (enrollmentCount * 0.4) + (reviewCount * 0.3) + (rating * 20);

    this.courseMetadata.trendingScore = score;
    this.courseMetadata.lastTrendingUpdate = new Date();
    await this.save();

    return score;
};

CourseSchema.methods.changeStatus = async function (this: IUnifiedCourse, newStatus: CourseStatus): Promise<IUnifiedCourse> {
    this.courseEnrollment.courseStatus = newStatus;
    return this.save();
};

CourseSchema.methods.softDelete = async function (this: IUnifiedCourse): Promise<IUnifiedCourse> {
    this.courseEnrollment.courseStatus = CourseStatus.DELETED;
    this.courseAdministrative.deletedAt = new Date();
    return this.save();
};

CourseSchema.methods.updateCoreDetails = async function (this: IUnifiedCourse, updates: Partial<ICoreDetails>): Promise<IUnifiedCourse> {
    this.coreDetails = { ...this.coreDetails, ...updates };
    return this.save();
};

CourseSchema.methods.updateContent = async function (this: IUnifiedCourse, updates: Partial<ICourseContent>): Promise<IUnifiedCourse> {
    this.courseContent = { ...this.courseContent, ...updates };
    return this.save();
};

CourseSchema.methods.updateMetadata = async function (this: IUnifiedCourse, updates: Partial<ICourseMetadata>): Promise<IUnifiedCourse> {
    this.courseMetadata = { ...this.courseMetadata, ...updates };
    return this.save();
};


CourseSchema.methods.updateEnrollmentData = async function (this: IUnifiedCourse, updates: Partial<ICourseEnrollment>): Promise<IUnifiedCourse> {
    this.courseEnrollment = { ...this.courseEnrollment, ...updates };
    return this.save();
};

CourseSchema.methods.updateSEO = async function (this: IUnifiedCourse, updates: Partial<ICourseSEO>): Promise<IUnifiedCourse> {
    this.courseSEO = { ...this.courseSEO, ...updates };
    return this.save();
};

CourseSchema.methods.updateAdditionalFeatures = async function (this: IUnifiedCourse, updates: Partial<ICourseAdditionalFeatures>): Promise<IUnifiedCourse> {
    this.courseAdditionalFeatures = { ...this.courseAdditionalFeatures, ...updates };
    return this.save();
};

CourseSchema.methods.updateCategory = async function (
    this: IUnifiedCourse,
    updates: { courseCategory?: string; courseSubCategory?: string }
): Promise<IUnifiedCourse> {
    if (updates.courseCategory) {
        this.courseMetadata.courseCategories = this.courseMetadata.courseCategories || [];
        if (!this.courseMetadata.courseCategories.includes(updates.courseCategory)) {
            this.courseMetadata.courseCategories.push(updates.courseCategory);
        }
    }
    if (updates.courseSubCategory) {
        this.courseMetadata.courseSubCategories = this.courseMetadata.courseSubCategories || [];
        if (!this.courseMetadata.courseSubCategories.includes(updates.courseSubCategory)) {
            this.courseMetadata.courseSubCategories.push(updates.courseSubCategory);
        }
    }
    return this.save();
};

// ====================== STATICS ======================
CourseSchema.statics.findCourses = function (
    query: any,
    limit: number = 10,
    skip: number = 0,
    sort: any = { 'courseMetadata.trendingScore': -1 }
): Promise<IUnifiedCourse[]> {
    return this.find({ ...query, 'courseEnrollment.courseStatus': { $ne: CourseStatus.DELETED } })
        .limit(limit)
        .skip(skip)
        .sort(sort)
        .exec();
};

CourseSchema.statics.findByType = function (courseType: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseMetadata.courseType': courseType }, limit, skip);
};

CourseSchema.statics.findByCategory = function (category: string, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseMetadata.courseCategories': category }, limit, skip);
};

CourseSchema.statics.findByLevel = function (level: CourseLevel, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'coreDetails.courseLevel': level }, limit, skip);
};

CourseSchema.statics.findByLanguage = function (language: string, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseMetadata.availableLanguages': language }, limit, skip);
};

CourseSchema.statics.findByStatus = function (status: CourseStatus, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseEnrollment.courseStatus': status }, limit, skip);
};

CourseSchema.statics.findAvailableCourses = function (courseType?: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    const query: any = { 'courseEnrollment.courseStatus': { $in: [CourseStatus.AVAILABLE, CourseStatus.PUBLISHED] } };
    if (courseType) query['courseMetadata.courseType'] = courseType;
    return this.findCourses(query, limit, skip);
};

CourseSchema.statics.findByInstructor = function (instructorId: Types.ObjectId, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseContent.courseInstructors': instructorId }, limit, skip);
};

CourseSchema.statics.findByBatch = function (batchId: Types.ObjectId, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseEnrollment.batches': batchId }, limit, skip);
};

CourseSchema.statics.findPopularCourses = function (courseType?: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    const query: any = {
        'courseEnrollment.courseStatus': CourseStatus.PUBLISHED,
        'courseMetadata.trendingScore': { $gt: 0 }
    };
    if (courseType) query['courseMetadata.courseType'] = courseType;
    return this.findCourses(query, limit, skip);
};

CourseSchema.statics.findByRatings = function (minRating: number, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses(
        { 'courseAdditionalFeatures.ratings.average': { $gte: minRating } },
        limit,
        skip,
        { 'courseAdditionalFeatures.ratings.average': -1 }
    );
};

CourseSchema.statics.updateCourseTrendingScore = async function (courseId: Types.ObjectId, score: number): Promise<IUnifiedCourse | null> {
    return this.findByIdAndUpdate(
        courseId,
        {
            $set: {
                'courseMetadata.trendingScore': score,
                'courseMetadata.lastTrendingUpdate': new Date()
            }
        },
        { new: true }
    ).exec();
};

CourseSchema.statics.findByPriceRange = function (minPrice: number, maxPrice: number, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses(
        {
            'coursePricing.basePrice': { $gte: minPrice, $lte: maxPrice },
            'courseMetadata.courseType': { $ne: CourseType.FREE }
        },
        limit,
        skip
    );
};

CourseSchema.statics.findFreeCourses = function (limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses({ 'courseMetadata.courseType': CourseType.FREE }, limit, skip);
};

CourseSchema.statics.findCoursesOnOffer = function (courseType?: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    const query: any = { 'coursePricing.isCourseOnOffer': true };
    if (courseType) query['courseMetadata.courseType'] = courseType;
    return this.findCourses(query, limit, skip);
};

CourseSchema.statics.findByDateRange = function (startDate: Date, endDate: Date, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    return this.findCourses(
        { 'courseAdministrative.createdAt': { $gte: startDate, $lte: endDate } },
        limit,
        skip,
        { 'courseAdministrative.createdAt': -1 }
    );
};

CourseSchema.statics.findRecentCourses = function (courseType?: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    const query: any = { 'courseEnrollment.courseStatus': CourseStatus.PUBLISHED };
    if (courseType) query['courseMetadata.courseType'] = courseType;
    return this.findCourses(query, limit, skip, { 'courseAdministrative.createdAt': -1 });
};

CourseSchema.statics.searchByName = function (name: string, courseType?: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    const query: any = { $text: { $search: name } };
    if (courseType) query['courseMetadata.courseType'] = courseType;
    return this.findCourses(query, limit, skip, { score: { $meta: 'textScore' } });
};

CourseSchema.statics.searchByText = function (query: string, courseType?: CourseType, limit: number = 10, skip: number = 0): Promise<IUnifiedCourse[]> {
    const searchQuery: any = { $text: { $search: query } };
    if (courseType) searchQuery['courseMetadata.courseType'] = courseType;
    return this.findCourses(searchQuery, limit, skip, { score: { $meta: 'textScore' } });
};

CourseSchema.statics.bulkUpdateStatus = async function (courseIds: Types.ObjectId[], newStatus: CourseStatus): Promise<any> {
    return this.updateMany(
        { _id: { $in: courseIds } },
        { $set: { 'courseEnrollment.courseStatus': newStatus } }
    ).exec();
};

CourseSchema.statics.bulkUpdateTrendingScores = async function (updates: Array<{ courseId: Types.ObjectId, score: number }>): Promise<any> {
    const bulkOps = updates.map(update => ({
        updateOne: {
            filter: { _id: update.courseId },
            update: {
                $set: {
                    'courseMetadata.trendingScore': update.score,
                    'courseMetadata.lastTrendingUpdate': new Date()
                }
            }
        }
    }));
    return this.bulkWrite(bulkOps);
};

// ====================== HELPER FUNCTIONS ======================
export const generateSlug = (name: string): string => {
    return sanitizeHtml(name)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

// ====================== MODEL EXPORT ======================
export const CourseModel = models.Course || model<IUnifiedCourse, IUnifiedCourseModel>('Course', CourseSchema);