import mongoose, { Schema, model, Document } from "mongoose";
import { AddressSchema, I_Address } from "./student.model";

// Interface
export interface I_Students_Education extends Document {
    qualification: string;
    fieldOfQualification: string;
    institutionName: string;
    institutionLocation: I_Address;
    currentlyStudying: boolean;
    startDate: Date;
    endDate?: Date;
    grade?: number | string;
    educationMode?: "Online" | "Offline" | "Hybrid";
}

// Schema
const StudentsEducationSchema = new Schema<I_Students_Education>(
    {
        qualification: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        fieldOfQualification: {
            type: String,
            required: true,
            trim: true,
        },
        institutionName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        institutionLocation: {
            type: AddressSchema,
            required: true,
        },
        currentlyStudying: {
            type: Boolean,
            required: true,
            default: false,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            validate: {
                validator: function (this: I_Students_Education, value: Date) {
                    if (this.currentlyStudying) return true;
                    return value ? value >= this.startDate : true;
                },
                message: "End date must be after start date",
            },
        },
        grade: {
            type: Schema.Types.Mixed, // Number or String
        },
        educationMode: {
            type: String,
            enum: ["Online", "Offline", "Hybrid"],
            index: true,
        },
    },
    { timestamps: true }
);

// Export model
const StudentsEducation = mongoose.models.StudentsEducation || model<I_Students_Education>(
    "StudentsEducation",
    StudentsEducationSchema
);
export default StudentsEducation
