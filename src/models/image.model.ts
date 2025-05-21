import { Schema, model, Document, Types, models } from 'mongoose';

// Interface for the A_Image document
interface A_Image extends Document {
  uploadedBy: Types.ObjectId;
  imageUrl: string;
  imagePublicId: string;
  imageName: string;
  imageType: 'thumbnail' | 'avatar' | 'documents' | 'banner';
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean
}

// Mongoose schema for A_Image
const ImageSchema = new Schema<A_Image>(
  {
    uploadedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Admin',
      index: true
    },
    imageUrl: {
      type: String,
      required: true,
      index: true
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    imageName: {
      type: String,
      required: true,
    },
    imageType: {
      type: String,
      required: true,
      enum: ['thumbnail', 'avatar', 'documents', 'banner'],
    },
    isDeleted: {
      type: Boolean,
    }
  },
  {
    timestamps: true,
  }
);

// Create and export the Mongoose model
const Image = models.Image || model<A_Image>('Image', ImageSchema);

export default Image;