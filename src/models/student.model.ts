import mongoose, { Schema, model, Document, Types, Model } from "mongoose";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";
import { IPayment } from "./payment.model";

// Address Schema
export const AddressSchema = new Schema({
    country: { type: String, required: true, trim: true, maxlength: 50 },
    state: { type: String, required: true, trim: true, lowercase: true, maxlength: 50 },
    city: { type: String, trim: true, lowercase: true },
    postalCode: {
        type: String,
        trim: true,
        match: [/^[A-Za-z0-9\s-]{3,10}$/, "Invalid postal code format"],
    },
}, { _id: false });

// Interfaces
export interface I_Address {
    country: string;
    state: string;
    city: string;
    postalCode: string;
}

export interface I_Students extends Document {
    fullName: string;
    address: I_Address;
    signedUpWith: "phone" | "email";
    email?: string;
    phone?: string;
    password: string;
    isAccountVerified: boolean;
    refreshToken?: string;
    studentStatus: "active" | "inactive";
    gender: "male" | "female" | "others";
    userName: string;
    dateOfBirth: Date;
    avatarUrl: string;
    qualifications: Types.ObjectId[];
    enrolledCourses: Types.ObjectId[];
    purchasedCourses: Types.ObjectId[];
    savedCourses: Types.ObjectId[];
    payments: Types.ObjectId[];
    certificateUrls: string[];
    preferredLanguage: "hindi" | "english" | "nepali";
    lastLogin?: Date;
    isDeleted?: boolean;
    updatedBy?: Types.ObjectId;

    verifyPassword(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
    addPurchasedCourse(courseId: Types.ObjectId, paymentId: Types.ObjectId): Promise<I_Students>;
    addCertificate(certificateUrl: string): Promise<I_Students>;
    getPublicProfile(): Partial<I_Students>;
    updateProfile(data: Partial<I_Students>): Promise<I_Students>;
    revokeRefreshToken(): Promise<I_Students>;
}

interface StudentsModel extends Model<I_Students> {
    findByEmailOrPhone(identifier: string): Promise<I_Students>;
    getStudentPaymentHistory(studentId: string): Promise<IPayment[]>;
    getActiveStudents(): Promise<I_Students[]>;
    findByUsername(username: string): Promise<I_Students>;
    deactivateStudent(studentId: string): Promise<I_Students>;
}

// Schema Definition
const StudentsSchema = new Schema<I_Students, StudentsModel>(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
            index: true,
            match: [/^[A-Za-z\s]+$/, "Full name can only contain letters and spaces"],
        },
        address: AddressSchema,
        userName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
            index: true,
            minlength: 3,
            maxlength: 30,
            match: [/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"],
        },
        signedUpWith: {
            type: String,
            enum: ["phone", "email"],
            required: true,
        },
        email: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            select: false,
            validate: {
                validator: (v: string | undefined) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: "Invalid email format",
            },
        },
        phone: {
            type: String,
            sparse: true,
            unique: true,
            trim: true,
            index: true,
            select: false,
            validate: {
                validator: (v: string | undefined) => !v || /^\+?[1-9]\d{1,14}$/.test(v),
                message: "Invalid phone number format",
            },
        },
        password: {
            type: String,
            required: true,
            select: false,
            minlength: 8,
            validate: {
                validator: (v: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(v),
                message: "Password must contain at least one letter and one number",
            },
        },
        isAccountVerified: { type: Boolean, default: false },
        refreshToken: { type: String, select: false },
        studentStatus: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        },
        gender: {
            type: String,
            enum: ["male", "female", "others"],
            required: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
            validate: {
                validator: (v: Date) => v < new Date(),
                message: "Date of birth must be in the past",
            },
        },
        avatarUrl: {
            type: String,
            default: "",
            match: [/^https?:\/\/.+$/, "Invalid avatar URL"],
        },
        qualifications: {
            type: [Schema.Types.ObjectId],
            ref: "StudentsEducation",
            select: false,
        },
        enrolledCourses: [{ type: Schema.Types.ObjectId, ref: "Enrollment" }], // Consider separate collection for scale
        purchasedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }], // Consider separate collection for scale
        savedCourses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
        payments: {
            type: [Schema.Types.ObjectId],
            ref: "Payment",
            select: false,
        },
        certificateUrls: {
            type: [String],
            validate: {
                validator: (v: string[]) => v.every((url) => /^https?:\/\/.+$/.test(url)),
                message: "All certificate URLs must be valid links",
            },
        },
        preferredLanguage: {
            type: String,
            enum: ["hindi", "english", "nepali"],
            default: "english",
        },
        lastLogin: { type: Date },
        isDeleted: { type: Boolean, default: false, index: true },
        updatedBy: { type: Schema.Types.ObjectId, ref: "Admin", select: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }
    }
);

// Middleware
StudentsSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

StudentsSchema.pre("find", function () {
    this.where({ isDeleted: false });
});
StudentsSchema.pre("findOne", function () {
    this.where({ isDeleted: false });
});

// Instance Methods
StudentsSchema.methods.verifyPassword = async function (password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

StudentsSchema.methods.generateAccessToken = async function (): Promise<string> {
    const secret = process.env.access_token_secret  ;
    if (!secret) throw new Error("JWT_ACCESS_SECRET missing");
    return jwt.sign(
        {
            id: this._id,
            userName: this.userName,
            role: "student"
        },
        secret,
        {
            expiresIn: "15m"
        }
    );
};

StudentsSchema.methods.generateRefreshToken = function (): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) throw new Error("JWT_REFRESH_SECRET missing");
    const salt = crypto.randomBytes(16).toString("hex");
    const token = jwt.sign({ id: this._id, salt }, secret, { expiresIn: "7d" });
    this.refreshToken = token;
    return token;
};

StudentsSchema.methods.addPurchasedCourse = async function (courseId: Types.ObjectId, paymentId: Types.ObjectId) {
    this.purchasedCourses.push(courseId);
    this.payments.push(paymentId);
    return this.save();
};

StudentsSchema.methods.addCertificate = async function (certificateUrl: string) {
    this.certificateUrls.push(certificateUrl);
    return this.save();
};

StudentsSchema.methods.getPublicProfile = function () {
    return {
        fullName: this.fullName,
        userName: this.userName,
        avatarUrl: this.avatarUrl,
        studentStatus: this.studentStatus,
        preferredLanguage: this.preferredLanguage,
        purchasedCourses: this.purchasedCourses,
        certificateUrls: this.certificateUrls,
    };
};

StudentsSchema.methods.updateProfile = async function (data: Partial<I_Students>) {
    const fields: (keyof I_Students)[] = ["fullName", "address", "avatarUrl", "preferredLanguage", "gender"];
    for (const key of fields) {
        if (data[key] !== undefined) {
            this[key] = data[key] as any;
        }
    }
    return this.save();
};

StudentsSchema.methods.revokeRefreshToken = async function () {
    this.refreshToken = undefined;
    return this.save();
};

// Static Methods
StudentsSchema.statics.findByEmailOrPhone = async function (identifier: string) {
    const student = await this.findOne({ $or: [{ email: identifier }, { phone: identifier }] })
        .select("+password +refreshToken");
    if (!student) throw new Error("Student not found with this email or phone");
    return student;
};

StudentsSchema.statics.getStudentPaymentHistory = async function (studentId: string) {
    const student = await this.findById(studentId).select("+payments").populate("payments");
    if (!student) throw new Error("Student not found");
    return student.payments as unknown[];
};

StudentsSchema.statics.getActiveStudents = async function () {
    return this.find({ studentStatus: "active", isDeleted: false });
};

StudentsSchema.statics.findByUsername = async function (username: string) {
    const student = await this.findOne({ userName: username });
    if (!student) throw new Error("Student not found with this username");
    return student;
};

StudentsSchema.statics.deactivateStudent = async function (studentId: string) {
    const student = await this.findById(studentId);
    if (!student) throw new Error("Student not found");
    student.studentStatus = "inactive";
    return student.save();
};


StudentsSchema.virtual("course", {
    ref: "Course",
    localField: "enrolledCourses",
    foreignField: "_id"
})
StudentsSchema.virtual("course", {
    ref: "Course",
    localField: "purchasedCourses",
    foreignField: "_id"
})
StudentsSchema.virtual("course", {
    ref: "Course",
    localField: "savedCourses",
    foreignField: "_id"
})
StudentsSchema.virtual("payment", {
    ref: "Payment",
    localField: "payments",
    foreignField: "_id"
})

// Indexes
StudentsSchema.index({ email: 1 }, { sparse: true });
StudentsSchema.index({ phone: 1 }, { sparse: true });
StudentsSchema.index({ studentStatus: 1 });
StudentsSchema.index({ userName: 1 }, { unique: true });
StudentsSchema.index({ isDeleted: 1 });

// Export
const Student = mongoose.models.Student || model<I_Students, StudentsModel>("Student", StudentsSchema);

export default Student