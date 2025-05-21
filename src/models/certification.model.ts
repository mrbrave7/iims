import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript interface
export interface I_Certifications extends Document {
  recipientName: string;
  certificationTitle: string;
  issuedOrganization: string;
  certificateId: string;
  durationOfTrainingInWeeks: number;
  certificationScore: number;
  certificateFileUrl: string;
  issuedDate: Date;
  specialMessage: string;
  adminId?: mongoose.Types.ObjectId; // Added to link to admin
  isValid?: boolean; // Virtual: Indicates if certificate is still valid
}

// Mongoose schema
const certificationSchema = new Schema<I_Certifications>(
  {
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      index: true,
      trim: true,
      maxlength: [100, 'Recipient name cannot exceed 100 characters'],
    },
    certificationTitle: {
      type: String,
      required: [true, 'Certification title is required'],
      index: true,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    issuedOrganization: {
      type: String,
      required: [true, 'Issuing organization is required'],
      index: true,
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      index: true,
      immutable: true,
      trim: true,
      match: /^[a-zA-Z0-9-]+$/, // Alphanumeric with dashes
    },
    durationOfTrainingInWeeks: {
      type: Number,
      required: [true, 'Training duration is required'],
      min: [1, 'Duration must be at least 1 week'],
      default: 1,
    },
    certificationScore: {
      type: Number,
      required: [true, 'Certification score is required'],
      min: [0, 'Score cannot be negative'],
      max: [100, 'Score cannot exceed 100'],
    },
    certificateFileUrl: {
      type: String,
      required: [true, 'Certificate file URL is required'],
      match: [/^https?:\/\/.+/, 'Invalid URL format'],
      trim: true,
    },
    issuedDate: {
      type: Date,
      required: [true, 'Issued date is required'],
      index: true,
    },
    specialMessage: {
      type: String,
      required: [true, 'Special message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    collection:"certifications"
  }
);


// Middleware: Ensure certificateId uniqueness
certificationSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existing = await Certification.findOne({ certificateId: this.certificateId });
    if (existing) {
      return next(new Error(`Certificate ID ${this.certificateId} already exists`));
    }
  }
  next();
});

// Model creation
const Certification =
  mongoose.models.Certification || mongoose.model<I_Certifications>('Certification', certificationSchema);

export default Certification;