import { Document, Model, Schema, Types, model, models } from 'mongoose';
import sanitizeHtml from 'sanitize-html';

// ====================== ENUMS ======================
export enum ReviewStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    DELETED = 'deleted'
}

// ====================== INTERFACES ======================

interface IReviewMetadata {
    helpfulVotes: number;
    unhelpfulVotes: number;
    lastUpdated: Date;
}

interface IReviewAdministrative {
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    createdBy: Types.ObjectId;
    schemaVersion: string;
}

export interface IReview extends Document {
    courseId: Types.ObjectId;
    studentId: Types.ObjectId;
    rating: number;
    comment: string;
    status: ReviewStatus;
    metadata: IReviewMetadata;
    administrative: IReviewAdministrative;

    // Instance Methods
    addReply(userId: Types.ObjectId, comment: string): Promise<this>;
    updateStatus(newStatus: ReviewStatus): Promise<this>;
    softDelete(): Promise<this>;
    incrementHelpfulVote(): Promise<this>;
    incrementUnhelpfulVote(): Promise<this>;
    updateComment(newComment: string): Promise<this>;
}

export interface IReviewModel extends Model<IReview> {
    findByCourse(courseId: Types.ObjectId, limit?: number, skip?: number): Promise<IReview[]>;
    findByUser(userId: Types.ObjectId, limit?: number, skip?: number): Promise<IReview[]>;
    findByStatus(status: ReviewStatus, limit?: number, skip?: number): Promise<IReview[]>;
    findTopRated(courseId: Types.ObjectId, limit?: number, skip?: number): Promise<IReview[]>;
    calculateAverageRating(courseId: Types.ObjectId): Promise<number>;
    bulkUpdateStatus(reviewIds: Types.ObjectId[], newStatus: ReviewStatus): Promise<any>;
}

// ====================== SCHEMA DEFINITION ======================
const ReviewSchema = new Schema<IReview, IReviewModel>(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course ID is required'],
            index: true
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true
        },
        rating: {
            type: Number,
            required: [true, 'Rating is required'],
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
            index: true
        },
        comment: {
            type: String,
            required: [true, 'Comment is required'],
            trim: true,
            minlength: [5, 'Comment must be at least 5 characters'],
            maxlength: [1000, 'Comment cannot exceed 1000 characters']
        },
        status: {
            type: String,
            required: [true, 'Review status is required'],
            enum: {
                values: Object.values(ReviewStatus),
                message: 'Invalid review status'
            },
            default: ReviewStatus.PENDING,
            index: true
        },
        metadata: {
            helpfulVotes: {
                type: Number,
                default: 0,
                min: [0, 'Helpful votes cannot be negative']
            },
            unhelpfulVotes: {
                type: Number,
                default: 0,
                min: [0, 'Unhelpful votes cannot be negative']
            },
            lastUpdated: {
                type: Date,
                default: Date.now
            }
        },
        administrative: {
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
            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'Admin',
                required: [true, 'Created by user ID is required']
            },
            schemaVersion: {
                type: String,
                required: [true, 'Schema version is required'],
                default: '1.0.0'
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
ReviewSchema.index({ courseId: 1, rating: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ 'comment': 'text' });

// ====================== MIDDLEWARE ======================
ReviewSchema.pre<IReview>('save', async function (next) {
    // Sanitize comment and replies
    if (this.comment) {
        this.comment = sanitizeHtml(this.comment);
    }

    // Ensure unique review per user per course
    if (this.isNew) {
        const existingReview = await this.model('Review').findOne({
            courseId: this.courseId,
            userId: this.studentId,
            status: { $ne: ReviewStatus.DELETED }
        });
        if (existingReview) {
            return next(new Error('User has already reviewed this course'));
        }
    }

    next();
});

// Handle index creation errors
ReviewSchema.on('index', (error) => {
    console.error('Index creation failed:', error); // Replace with proper logging
});

// ====================== METHODS ======================

ReviewSchema.methods.updateStatus = async function (this: IReview, newStatus: ReviewStatus): Promise<IReview> {
    this.status = newStatus;
    return this.save();
};

ReviewSchema.methods.softDelete = async function (this: IReview): Promise<IReview> {
    this.status = ReviewStatus.DELETED;
    this.administrative.deletedAt = new Date();
    return this.save();
};

ReviewSchema.methods.incrementHelpfulVote = async function (this: IReview): Promise<IReview> {
    this.metadata.helpfulVotes += 1;
    this.metadata.lastUpdated = new Date();
    return this.save();
};

ReviewSchema.methods.incrementUnhelpfulVote = async function (this: IReview): Promise<IReview> {
    this.metadata.unhelpfulVotes += 1;
    this.metadata.lastUpdated = new Date();
    return this.save();
};

ReviewSchema.methods.updateComment = async function (this: IReview, newComment: string): Promise<IReview> {
    this.comment = sanitizeHtml(newComment);
    this.administrative.updatedAt = new Date();
    return this.save();
};

// ====================== STATICS ======================
ReviewSchema.statics.findByCourse = function (courseId: Types.ObjectId, limit: number = 10, skip: number = 0): Promise<IReview[]> {
    return this.find({ courseId, status: { $ne: ReviewStatus.DELETED } })
        .limit(limit)
        .skip(skip)
        .sort({ rating: -1, 'administrative.createdAt': -1 })
        .exec();
};

ReviewSchema.statics.findByUser = function (userId: Types.ObjectId, limit: number = 10, skip: number = 0): Promise<IReview[]> {
    return this.find({ userId, status: { $ne: ReviewStatus.DELETED } })
        .limit(limit)
        .skip(skip)
        .sort({ 'administrative.createdAt': -1 })
        .exec();
};

ReviewSchema.statics.findByStatus = function (status: ReviewStatus, limit: number = 10, skip: number = 0): Promise<IReview[]> {
    return this.find({ status })
        .limit(limit)
        .skip(skip)
        .sort({ 'administrative.createdAt': -1 })
        .exec();
};

ReviewSchema.statics.findTopRated = function (courseId: Types.ObjectId, limit: number = 10, skip: number = 0): Promise<IReview[]> {
    return this.find({ courseId, status: ReviewStatus.APPROVED, rating: { $gte: 4 } })
        .limit(limit)
        .skip(skip)
        .sort({ rating: -1, 'administrative.createdAt': -1 })
        .exec();
};

ReviewSchema.statics.calculateAverageRating = async function (courseId: Types.ObjectId): Promise<number> {
    const reviews = await this.find({ courseId, status: ReviewStatus.APPROVED }).select('rating').exec();
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return reviews.length > 0 ? totalRating / reviews.length : 0;
};

ReviewSchema.statics.bulkUpdateStatus = async function (reviewIds: Types.ObjectId[], newStatus: ReviewStatus): Promise<any> {
    return this.updateMany(
        { _id: { $in: reviewIds } },
        { $set: { status: newStatus, 'administrative.updatedAt': new Date() } }
    ).exec();
};

// ====================== MODEL EXPORT ======================
export const ReviewModel = models.Review || model<IReview, IReviewModel>('Review', ReviewSchema);