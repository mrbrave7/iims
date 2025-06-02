import mongoose, { Schema, Document, Model, models } from 'mongoose';

// TypeScript interface for Offer Details
interface IOfferDetails extends Document {
    offerCode: string;
    offerDescription: string;
    offerSlogan: string;
    discountPercentage: number;
    offerSeatsAvailable: number;
    offerValidity: Date;
    isActive: boolean;
    courseId: mongoose.Types.ObjectId;
    // Instance methods
    isOfferValid(): boolean;
    decreaseSeats(amount: number): Promise<IOfferDetails>;
}

// Interface for static methods
interface IOfferDetailsModel extends Model<IOfferDetails> {
    findActiveOffers(): Promise<IOfferDetails[]>;
    findExpiredOffers(): Promise<IOfferDetails[]>;
    findByOfferCode(code: string): Promise<IOfferDetails | null>;
}

const offerDetailsSchema = new Schema<IOfferDetails, IOfferDetailsModel>({
    offerCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        match: /^[A-Z0-9_-]{3,20}$/, // Enforce format for offer codes
        index: true
    },
    offerDescription: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    offerSlogan: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        validate: {
            validator: Number.isInteger,
            message: 'Discount percentage must be an integer'
        }
    },
    offerSeatsAvailable: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Seats available must be an integer'
        }
    },
    offerValidity: {
        type: Date,
        required: true,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        required: true
    },
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true
    }
}, {
    timestamps: true,
});

// Instance Methods
offerDetailsSchema.methods.isOfferValid = function (): boolean {
    return this.isActive && this.offerSeatsAvailable > 0 && this.offerValidity >= new Date();
};

offerDetailsSchema.methods.decreaseSeats = async function (amount: number): Promise<IOfferDetails> {
    if (amount < 0) throw new Error('Amount must be positive');
    if (this.offerSeatsAvailable < amount) throw new Error('Not enough seats available');
    this.offerSeatsAvailable -= amount;
    if (this.offerSeatsAvailable === 0) this.isActive = false;
    return await this.save();
};

// Static Methods
offerDetailsSchema.statics.findActiveOffers = async function (): Promise<IOfferDetails[]> {
    return this.find({
        isActive: true,
        offerSeatsAvailable: { $gt: 0 },
        offerValidity: { $gte: new Date() }
    }).populate('courseId');
};

offerDetailsSchema.statics.findExpiredOffers = async function (): Promise<IOfferDetails[]> {
    return this.find({
        $or: [
            { isActive: false },
            { offerSeatsAvailable: { $lte: 0 } },
            { offerValidity: { $lt: new Date() } }
        ]
    }).populate('courseId');
};

offerDetailsSchema.statics.findByOfferCode = async function (code: string): Promise<IOfferDetails | null> {
    return this.findOne({ offerCode: code.toUpperCase() }).populate('courseId');
};

const OfferDetails = models.OfferDetails || mongoose.model<IOfferDetails, IOfferDetailsModel>('OfferDetails', offerDetailsSchema);

export default OfferDetails;