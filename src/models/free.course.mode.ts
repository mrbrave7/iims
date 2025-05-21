import mongoose, { Schema, Types, Model, Document, model } from "mongoose";
import validator from 'validator';
import sanitizeHtml from 'sanitize-html';

// Custom Error Classes
class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

class DatabaseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DatabaseError';
    }
}

// Modular Interfaces
interface ICoreCourse {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseDurationInHours: number;
    courseStatus: 'Available' | 'Unavailable' | 'Archived' | 'Draft';
}

interface ISEOCourse {
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    promoVideoUrl?: string;
    courseBannerUrl?: string;
}

interface IContentCourse {
    courseInstructor: Types.ObjectId;
    courseGoals: string[];
    syllabusOutline: string[];
    modules: Types.ObjectId[];
}

interface IMetadataCourse {
    courseLevel: "Beginner" | "Intermediate" | "Advanced";
    targetAudience: string[];
    availableLanguages: string[];
    courseCategory: string;
    courseSubCategory: string;
}

interface IAnalyticsCourse {
    ratings: {
        average: number;
        count: number;
        lastUpdated: Date;
    };
    reviews: Types.ObjectId[];
    trendingScore: number;
    lastTrendingUpdate: Date;
}

interface IAdministrativeCourse {
    certificateTemplateUrl: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    schemaVersion: string;
}

// Main Interface
interface IFreeCourse extends Document, ICoreCourse, ISEOCourse, IContentCourse, IMetadataCourse, IAnalyticsCourse, IAdministrativeCourse {
    // Instance methods
    addReview(reviewId: Types.ObjectId, session?: any): Promise<this>;
    updateRating(session?: any): Promise<this>;
    addModule(moduleId: Types.ObjectId, session?: any): Promise<this>;
    calculateTrendingScore(session?: any): Promise<number>;
    softDelete(session?: any): Promise<this>;
    updateCoreDetails(updates: Partial<ICoreCourse>, session?: any): Promise<this>;
    updateSEO(updates: Partial<ISEOCourse>, session?: any): Promise<this>;
    updateContent(updates: Partial<IContentCourse>, session?: any): Promise<this>;
    updateMetadata(updates: Partial<IMetadataCourse>, session?: any): Promise<this>;
    updateCategory(updates: Partial<Pick<IMetadataCourse, 'courseCategory' | 'courseSubCategory'>>, session?: any): Promise<this>;
    changeStatus(newStatus: 'Available' | 'Unavailable' | 'Archived' | 'Draft', session?: any): Promise<this>;
}

// Static methods interface
interface IFreeCourseModel extends Model<IFreeCourse> {
    findByCategory(category: string, limit?: number, skip?: number): Promise<IFreeCourse[]>;
    findByStatus(status: 'Available' | 'Unavailable' | 'Archived' | 'Draft', limit?: number, skip?: number): Promise<IFreeCourse[]>;
    findPopularCourses(limit?: number, skip?: number): Promise<IFreeCourse[]>;
    findByLanguage(language: string, limit?: number, skip?: number): Promise<IFreeCourse[]>;
    findByLevel(level: "Beginner" | "Intermediate" | "Advanced", limit?: number, skip?: number): Promise<IFreeCourse[]>;
    searchByName(name: string, limit?: number, skip?: number): Promise<IFreeCourse[]>;
    searchByText(query: string, limit?: number, skip?: number): Promise<IFreeCourse[]>;
    updateCourseTrendingScore(courseId: Types.ObjectId, score: number, session?: any): Promise<IFreeCourse | null>;
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

// Schema Definition
const FreeCourseSchema = new Schema<IFreeCourse, IFreeCourseModel>(
    {
        // Core Course Fields
        courseName: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true,
            unique: true,
            minlength: [3, 'Course name must be at least 3 characters'],
            maxlength: [100, 'Course name cannot exceed 100 characters'],
            index: true
        },
        courseSlug: {
            type: String,
            required: [true, 'Course slug is required'],
            unique: true,
            trim: true,
            index: true
        },
        courseDescription: {
            type: String,
            required: [true, 'Course description is required'],
            trim: true,
            minlength: [10, 'Description must be at least 10 characters'],
            maxlength: [3000, 'Description cannot exceed 3000 characters']
        },
        courseDurationInHours: {
            type: Number,
            required: [true, 'Course duration is required'],
            min: [0, 'Duration cannot be negative']
        },
        courseStatus: {
            type: String,
            required: [true, 'Course status is required'],
            enum: ['Available', 'Unavailable', 'Archived', 'Draft'],
            default: 'Draft',
            index: true
        },
        // SEO Fields
        seoMetaTitle: {
            type: String,
            trim: true,
            maxlength: [60, 'SEO title cannot exceed 60 characters'],
            minlength: [10, 'SEO title must be at least 10 characters']
        },
        seoMetaDescription: {
            type: String,
            trim: true,
            maxlength: [160, 'SEO description cannot exceed 160 characters'],
            minlength: [50, 'SEO description must be at least 50 characters']
        },
        promoVideoUrl: {
            type: String,
            validate: {
                validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
                message: 'Invalid promo video URL'
            }
        },
        courseBannerUrl: {
            type: String,
            validate: {
                validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
                message: 'Invalid banner URL'
            }
        },
        // Content Fields
        courseInstructor: {
            type: Schema.Types.ObjectId,
            ref: "Profile",
            index: true,
            required: true
        },
        courseGoals: [{
            type: String,
            required: [true, 'Course goal is required'],
            trim: true,
            minlength: [5, 'Goal must be at least 5 characters']
        }],
        syllabusOutline: [{
            type: String,
            required: [true, 'Syllabus outline is required'],
            trim: true,
            minlength: [5, 'Outline must be at least 5 characters']
        }],
        modules: [{
            type: Schema.Types.ObjectId,
            ref: () => 'Module', // Lazy reference
            validate: {
                validator: async (id: Types.ObjectId) => await model('Module').exists({ _id: id }),
                message: 'Invalid module ID'
            }
        }],
        // Metadata Fields
        courseLevel: {
            type: String,
            required: [true, 'Course level is required'],
            enum: ["Beginner", "Intermediate", "Advanced"],
            index: true
        },
        targetAudience: [{
            type: String,
            required: [true, 'Target audience is required'],
            trim: true,
            minlength: [3, 'Target audience must be at least 3 characters']
        }],
        availableLanguages: [{
            type: String,
            required: [true, 'Available language is required'],
            trim: true,
            index: true
        }],
        courseCategory: {
            type: String,
            required: [true, 'Course category is required'],
            trim: true,
            index: true
        },
        courseSubCategory: {
            type: String,
            required: [true, 'Course subcategory is required'],
            trim: true,
            index: true
        },
        // Analytics Fields
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
            ref: () => 'Review', // Lazy reference
            validate: {
                validator: async (id: Types.ObjectId) => await model('Review').exists({ _id: id }),
                message: 'Invalid review ID'
            }
        }],
        trendingScore: {
            type: Number,
            default: 0,
            index: true
        },
        lastTrendingUpdate: {
            type: Date,
            default: null
        },
        // Administrative Fields
        certificateTemplateUrl: {
            type: String,
            validate: {
                validator: (url: string) => !url || validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true }),
                message: 'Invalid certificate URL'
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
        collection: "free_courses",
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

// Text Index for search
FreeCourseSchema.index({
    'courseName': 'text',
    'courseDescription': 'text',
    'syllabusOutline': 'text',
    'targetAudience': 'text'
}, {
    weights: {
        'courseName': 10,
        'courseDescription': 5,
        'syllabusOutline': 3,
        'targetAudience': 2
    },
    name: 'free_course_text_search'
});

// Compound Indexes
FreeCourseSchema.index({
    courseStatus: 1,
    trendingScore: -1
});

FreeCourseSchema.index({
    courseStatus: 1,
    'ratings.average': -1
});

FreeCourseSchema.index({
    courseStatus: 1,
    courseLevel: 1
});

// Virtuals
FreeCourseSchema.virtual('enrollmentCount', {
    ref: 'Enrollment',
    localField: '_id',
    foreignField: 'course',
    count: true
});

FreeCourseSchema.virtual('totalModules').get(function () {
    return this.modules.length;
});

// Middleware for auto-generating slug and SEO fields with sanitization
FreeCourseSchema.pre<IFreeCourse>('save', function (next) {
    try {
        if (this.isModified('courseName')) {
            this.courseName = sanitizeHtml(this.courseName, { allowedTags: [], allowedAttributes: {} });
            this.courseSlug = generateSlug(this.courseName);

            if (!this.seoMetaTitle) {
                this.seoMetaTitle = sanitizeHtml(`${this.courseName} | Free Online Course`, { allowedTags: [], allowedAttributes: {} }).substring(0, 60);
            }
        }

        if (this.isModified('courseDescription')) {
            this.courseDescription = sanitizeHtml(this.courseDescription, {
                allowedTags: ['p', 'strong', 'em'],
                allowedAttributes: {}
            });
        }

        if (this.isModified('seoMetaDescription') && this.seoMetaDescription) {
            this.seoMetaDescription = sanitizeHtml(this.seoMetaDescription, { allowedTags: [], allowedAttributes: {} });
        }

        next();
    } catch (error) {
        next(new DatabaseError(`Pre-save middleware failed: ${error}`));
    }
});

// Middleware to exclude deleted courses from queries
FreeCourseSchema.pre(/^find/, function (this: any, next) {
    try {
        if (this.getFilter().deletedAt === undefined) {
            this.where({ deletedAt: null });
        }
        next();
    } catch (error) {
        next(new DatabaseError(`Pre-query middleware failed: ${error}`));
    }
});

// Static Methods
FreeCourseSchema.statics.findPopularCourses = async function (
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
    try {
        // TODO: Implement Redis caching if needed
        return await this.find({
            courseStatus: 'Available',
            deletedAt: null
        })
            .sort({ trendingScore: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
    } catch (error) {
        throw new DatabaseError(`Failed to find popular courses: ${error}`);
    }
};

FreeCourseSchema.statics.searchByText = async function (
    query: string,
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
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

FreeCourseSchema.statics.findByCategory = async function (
    category: string,
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
    if (!category || typeof category !== 'string') {
        throw new ValidationError('Invalid category');
    }

    try {
        return await this.find({
            courseCategory: category,
            courseStatus: 'Available',
            deletedAt: null
        })
            .sort({ trendingScore: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
    } catch (error) {
        throw new DatabaseError(`Failed to find courses by category: ${error}`);
    }
};

FreeCourseSchema.statics.findByStatus = async function (
    status: 'Available' | 'Unavailable' | 'Archived' | 'Draft',
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
    if (!['Available', 'Unavailable', 'Archived', 'Draft'].includes(status)) {
        throw new ValidationError('Invalid status');
    }

    try {
        return await this.find({
            courseStatus: status,
            deletedAt: null
        })
            .sort({ trendingScore: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
    } catch (error) {
        throw new DatabaseError(`Failed to find courses by status: ${error}`);
    }
};

FreeCourseSchema.statics.findByLanguage = async function (
    language: string,
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
    if (!language || typeof language !== 'string') {
        throw new ValidationError('Invalid language');
    }

    try {
        return await this.find({
            availableLanguages: language,
            courseStatus: 'Available',
            deletedAt: null
        })
            .sort({ trendingScore: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
    } catch (error) {
        throw new DatabaseError(`Failed to find courses by language: ${error}`);
    }
};

FreeCourseSchema.statics.findByLevel = async function (
    level: "Beginner" | "Intermediate" | "Advanced",
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
    if (!["Beginner", "Intermediate", "Advanced"].includes(level)) {
        throw new ValidationError('Invalid course level');
    }

    try {
        return await this.find({
            courseLevel: level,
            courseStatus: 'Available',
            deletedAt: null
        })
            .sort({ trendingScore: -1 })
            .limit(limit)
            .skip(skip)
            .lean();
    } catch (error) {
        throw new DatabaseError(`Failed to find courses by level: ${error}`);
    }
};

FreeCourseSchema.statics.searchByName = async function (
    name: string,
    limit: number = 10,
    skip: number = 0
): Promise<IFreeCourse[]> {
    if (!name || typeof name !== 'string') {
        throw new ValidationError('Invalid course name');
    }

    try {
        return await this.find({
            courseName: { $regex: name, $options: 'i' },
            courseStatus: 'Available',
            deletedAt: null
        })
            .limit(limit)
            .skip(skip)
            .lean();
    } catch (error) {
        throw new DatabaseError(`Failed to search courses by name: ${error}`);
    }
};

FreeCourseSchema.statics.updateCourseTrendingScore = async function (
    courseId: Types.ObjectId,
    score: number,
    session?: any
): Promise<IFreeCourse | null> {
    try {
        return await this.findOneAndUpdate(
            { _id: courseId, deletedAt: null },
            { trendingScore: score, lastTrendingUpdate: new Date() },
            { new: true, session }
        ).lean();
    } catch (error) {
        throw new DatabaseError(`Failed to update trending score: ${error}`);
    }
};

// Instance Methods
FreeCourseSchema.methods.addReview = async function (
    reviewId: Types.ObjectId,
    session?: any
): Promise<IFreeCourse> {
    try {
        if (!this.reviews.includes(reviewId)) {
            this.reviews.push(reviewId);
            await this.save({ session });
            await this.updateRating(session);
        }
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to add review: ${error}`);
    }
};

FreeCourseSchema.methods.updateRating = async function (session?: any): Promise<IFreeCourse> {
    try {
        const reviews = await model('Review').find({
            _id: { $in: this.reviews }
        });

        const count = reviews.length;
        const average = count > 0
            ? reviews.reduce((sum, review) => sum + (review.score || 0), 0) / count
            : 0;

        this.ratings = {
            average: parseFloat(average.toFixed(1)),
            count,
            lastUpdated: new Date()
        };

        await this.save({ session });
        await this.calculateTrendingScore(session);
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to update rating: ${error}`);
    }
};

FreeCourseSchema.methods.addModule = async function (
    moduleId: Types.ObjectId,
    session?: any
): Promise<IFreeCourse> {
    try {
        if (!this.modules.includes(moduleId)) {
            this.modules.push(moduleId);
            await this.save({ session });
        }
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to add module: ${error}`);
    }
};

FreeCourseSchema.methods.calculateTrendingScore = async function (session?: any): Promise<number> {
    const now = new Date();
    const lastUpdate = this.lastTrendingUpdate;
    const hoursSinceLastUpdate = lastUpdate
        ? (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
        : Infinity;

    if (hoursSinceLastUpdate < 6) {
        return this.trendingScore;
    }

    try {
        const enrollmentCount = await model('Enrollment').countDocuments({
            course: this._id
        });
        const ratingScore = this.ratings.average * this.ratings.count;

        const recentActivity = await model('Enrollment').countDocuments({
            course: this._id,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const score = enrollmentCount * 0.4 + ratingScore * 0.4 + recentActivity * 0.2;

        this.trendingScore = parseFloat(score.toFixed(2));
        this.lastTrendingUpdate = now;

        await this.save({ session });
        return this.trendingScore;
    } catch (error) {
        throw new DatabaseError(`Failed to calculate trending score: ${error}`);
    }
};

FreeCourseSchema.methods.softDelete = async function (session?: any): Promise<IFreeCourse> {
    try {
        this.deletedAt = new Date();
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to soft delete course: ${error}`);
    }
};

FreeCourseSchema.methods.updateCoreDetails = async function (
    updates: Partial<ICoreCourse>,
    session?: any
): Promise<IFreeCourse> {
    try {
        Object.assign(this, updates);
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to update core details: ${error}`);
    }
};

FreeCourseSchema.methods.updateSEO = async function (
    updates: Partial<ISEOCourse>,
    session?: any
): Promise<IFreeCourse> {
    try {
        Object.assign(this, updates);
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to update SEO: ${error}`);
    }
};

FreeCourseSchema.methods.updateContent = async function (
    updates: Partial<IContentCourse>,
    session?: any
): Promise<IFreeCourse> {
    try {
        Object.assign(this, updates);
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to update content: ${error}`);
    }
};

FreeCourseSchema.methods.updateMetadata = async function (
    updates: Partial<IMetadataCourse>,
    session?: any
): Promise<IFreeCourse> {
    try {
        Object.assign(this, updates);
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to update metadata: ${error}`);
    }
};

FreeCourseSchema.methods.updateCategory = async function (
    updates: Partial<Pick<IMetadataCourse, 'courseCategory' | 'courseSubCategory'>>,
    session?: any
): Promise<IFreeCourse> {
    try {
        Object.assign(this, updates);
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to update category: ${error}`);
    }
};

FreeCourseSchema.methods.changeStatus = async function (
    newStatus: 'Available' | 'Unavailable' | 'Archived' | 'Draft',
    session?: any
): Promise<IFreeCourse> {
    try {
        if (!['Available', 'Unavailable', 'Archived', 'Draft'].includes(newStatus)) {
            throw new ValidationError('Invalid status value');
        }

        if (newStatus === 'Available') {
            if (!this.courseDescription || !this.modules.length) {
                throw new ValidationError('Cannot publish - Missing required fields');
            }
        }

        this.courseStatus = newStatus;
        await this.save({ session });
        return this as IFreeCourse;
    } catch (error) {
        throw new DatabaseError(`Failed to change status: ${error}`);
    }
};

// Model Creation
const FreeCourse = mongoose.models.FreeCourse || model<IFreeCourse, IFreeCourseModel>(
    "FreeCourse",
    FreeCourseSchema
);

export default FreeCourse;