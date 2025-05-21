import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface
export interface I_Experiences extends Document {
    workedOrganization: string;
    workDurationInMonths: number;
    organizationJoiningDate: Date;
    organizationLeaveDate: Date;
    role: string;
    workDescription: string;
}

// Mongoose schema
const experienceSchema = new Schema<I_Experiences>(
    {
        workedOrganization: {
            type: String,
            required: true,
            trim: true,
            index: true 
        },
        workDurationInMonths: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger, 
                message: "Work duration must be a whole number"
            }
        },
        organizationJoiningDate: {
            type: Date,
            required: true,
            index: true // Index for date-based queries
        },
        organizationLeaveDate: {
            type: Date,
            required: true,
            validate: {
                validator: function(this: I_Experiences, value: Date) {
                    return value > this.organizationJoiningDate;
                },
                message: "Leave date must be after joining date"
            }
        },
        role: {
            type: String,
            required: true,
            trim: true,
            index: true 
        },
        workDescription: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true, 
        toJSON: {
            transform: (doc, ret) => {
                ret.organizationJoiningDate = ret.organizationJoiningDate.toISOString();
                ret.organizationLeaveDate = ret.organizationLeaveDate.toISOString();
                return ret;
            }
        }
    }
);

// Compound index for queries combining organization and role
experienceSchema.index({ workedOrganization: 1, role: 1 });

// Virtual field to check if experience is current
experienceSchema.virtual('isCurrent').get(function(this: I_Experiences) {
    const now = new Date();
    return this.organizationJoiningDate <= now && this.organizationLeaveDate >= now;
});

// Model creation
const Experience =mongoose.models.Experience || mongoose.model<I_Experiences>('Experience', experienceSchema);

export default Experience;