import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// TypeScript Interfaces
interface COURSE_CARD_INSTRUCTOR {
    fullName: string;
    avatar: string;
}

interface COURSE_CARD_COMPONENT {
    courseId: Types.ObjectId;
    courseName: string;
    coursePrice: number;
    courseCategry: string;
    courseBannerUrl: string;
    courseType: string;
    courseLevel: string;
    courseInstructor: COURSE_CARD_INSTRUCTOR;
    isCourseOnOffer?: boolean;
    offerPercent?: number;
}

// Mongoose Document Interface
interface CourseCardComponentDocument extends COURSE_CARD_COMPONENT, Document {
    // Instance Methods
    getDiscountedPrice(): number;
    isOnSale(): boolean;
    updateOfferStatus(isOnOffer: boolean, offerPercent: number): Promise<CourseCardComponentDocument>;
}

// Mongoose Model Interface
interface CourseCardComponentModel extends Model<CourseCardComponentDocument> {
    // Static Methods
    findByCategory(category: string): Promise<CourseCardComponentDocument[]>;
    findByLevel(level: string): Promise<CourseCardComponentDocument[]>;
    getFeaturedCourses(limit?: number): Promise<CourseCardComponentDocument[]>;
}

// Helper Function: Validate URL
const isValidUrl = (url: string): boolean => {
    return /^(https?:\/\/[^\s$.?#].[^\s]*)$/.test(url);
};

// Helper Function: Calculate Discounted Price
const calculateDiscountedPrice = (price: number, offerPercent: number): number => {
    if (offerPercent < 0 || offerPercent > 100) {
        throw new Error('Offer percentage must be between 0 and 100');
    }
    return price * (1 - offerPercent / 100);
};

// Mongoose Schema
const CourseCardComponentSchema = new Schema<CourseCardComponentDocument, CourseCardComponentModel>({
    courseId:{
        type:Schema.Types.ObjectId,
        required:true,
        enum: ['FreeCourse', 'OnlineCourse', 'OfflineCourse'],
    },
    courseName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    coursePrice: {
        type: Number,
        required: true,
        min: 0
    },
    courseCategry: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        index: true // Index for faster category queries
    },
    courseBannerUrl: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: isValidUrl,
            message: (props: { value: string }) => `${props.value} is not a valid URL!`
        }
    },
    courseType: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    courseLevel: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        index: true // Index for faster level queries
    },
    courseInstructor: {
        type: {
            fullName: {
                type: String,
                required: true,
                trim: true,
                minlength: 1
            },
            avatar: {
                type: String,
                required: true,
                trim: true,
                validate: {
                    validator: isValidUrl,
                    message: (props: { value: string }) => `${props.value} is not a valid URL!`
                }
            },
        },
        required: true
    },
    isCourseOnOffer: {
        type: Boolean,
        required: true,
        default: false
    },
    offerPercent: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

CourseCardComponentSchema.methods.updateOfferStatus = async function (
    this: CourseCardComponentDocument,
    isOnOffer: boolean,
    offerPercent: number
): Promise<CourseCardComponentDocument> {
    this.isCourseOnOffer = isOnOffer;
    this.offerPercent = isOnOffer ? Math.min(Math.max(offerPercent, 0), 100) : 0;
    return await this.save();
};

// Static Methods
CourseCardComponentSchema.statics.findByCategory = async function (
    category: string
): Promise<CourseCardComponentDocument[]> {
    return this.find({ courseCategry: new RegExp(category, 'i') }).exec();
};

CourseCardComponentSchema.statics.findByLevel = async function (
    level: string
): Promise<CourseCardComponentDocument[]> {
    return this.find({ courseLevel: new RegExp(level, 'i') }).exec();
};

CourseCardComponentSchema.statics.getFeaturedCourses = async function (
    limit: number = 10
): Promise<CourseCardComponentDocument[]> {
    return this.find({ isCourseOnOffer: true })
        .sort({ offerPercent: -1, coursePrice: 1 })
        .limit(limit)
        .exec();
};

// Create and export the model
const CourseCardComponent = mongoose.model<CourseCardComponentDocument, CourseCardComponentModel>(
    'CourseCardComponent',
    CourseCardComponentSchema
);

export default CourseCardComponent;