import mongoose, { Schema, model, Document, Types, Model } from "mongoose";

// Interface
export interface IPayment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  currency: string;
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded" | "PartiallyPaid" | "Disputed";
  paymentMethod: "Card" | "UPI" | "NetBanking" | "PayPal" | "Crypto" | "Other";
  transactionId?: string;
  paymentGateway: string;
  invoiceId?: Types.ObjectId;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  refundTransactionId?: string;
  failureReason?: string;
  isVerifiedByAdmin: boolean;
  verifiedAt?: Date;
  paymentServerDetails?: Record<string, any>; // New field
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  markAsVerified(): Promise<IPayment>;
  markAsRefunded(refundAmount: number, refundTransactionId?: string): Promise<IPayment>;
  getPaymentSummary(): { totalPaid: number; status: string; verified: boolean };
}

interface PaymentModel extends Model<IPayment> {
  findByStudentId(studentId: string): Promise<IPayment[]>;
  findUnverifiedPayments(): Promise<IPayment[]>;
  findPendingPayments(): Promise<IPayment[]>;
  getTotalRevenue(): Promise<number>;
  findPaymentsByGateway(gateway: string): Promise<IPayment[]>;
}

// Schema
const PaymentSchema = new Schema<IPayment, PaymentModel>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: "USD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "PartiallyPaid", "Disputed"],
      default: "Pending",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "UPI", "NetBanking", "PayPal", "Crypto", "Other"],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentGateway: {
      type: String,
      required: true,
      trim: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    paidAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: 0,
    },
    refundTransactionId: {
      type: String,
      trim: true,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    isVerifiedByAdmin: {
      type: Boolean,
      default: false,
      required: true,
    },
    verifiedAt: {
      type: Date,
    },
    paymentServerDetails: {
      type: Schema.Types.Mixed, // Allows any JSON structure
      default: null,           // Optional field
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Static Methods
PaymentSchema.statics.findByStudentId = async function (studentId: string): Promise<IPayment[]> {
  return this.find({ studentId: new Types.ObjectId(studentId) }).populate("courseId");
};

PaymentSchema.statics.findUnverifiedPayments = async function (): Promise<IPayment[]> {
  return this.find({ isVerifiedByAdmin: false, paymentStatus: "Paid" });
};

PaymentSchema.statics.findPendingPayments = async function (): Promise<IPayment[]> {
  return this.find({ paymentStatus: "Pending" });
};

PaymentSchema.statics.getTotalRevenue = async function (): Promise<number> {
  const result = await this.aggregate([
    { $match: { paymentStatus: "Paid", isVerifiedByAdmin: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result.length > 0 ? result[0].total : 0;
};

PaymentSchema.statics.findPaymentsByGateway = async function (gateway: string): Promise<IPayment[]> {
  return this.find({ paymentGateway: gateway });
};

// Instance Methods
PaymentSchema.methods.markAsVerified = async function (): Promise<IPayment> {
  if (this.paymentStatus !== "Paid") {
    throw new Error("Only paid payments can be verified");
  }
  this.isVerifiedByAdmin = true;
  this.verifiedAt = new Date();
  return this.save();
};

PaymentSchema.methods.markAsRefunded = async function (
  refundAmount: number,
  refundTransactionId?: string
): Promise<IPayment> {
  if (this.paymentStatus !== "Paid" || !this.isVerifiedByAdmin) {
    throw new Error("Only verified paid payments can be refunded");
  }
  if (refundAmount > this.amount) {
    throw new Error("Refund amount cannot exceed original payment amount");
  }
  this.paymentStatus = refundAmount === this.amount ? "Refunded" : "PartiallyPaid";
  this.refundAmount = refundAmount;
  this.refundedAt = new Date();
  if (refundTransactionId) this.refundTransactionId = refundTransactionId;
  return this.save();
};

PaymentSchema.methods.getPaymentSummary = function (): { totalPaid: number; status: string; verified: boolean } {
  return {
    totalPaid: this.paymentStatus === "Refunded" ? 0 : this.amount - (this.refundAmount || 0),
    status: this.paymentStatus,
    verified: this.isVerifiedByAdmin,
  };
};
PaymentSchema.virtual("course", {
  ref: "Course",
  localField: "courseId",
  foreignField: "_id",
  justOne: true,
});

PaymentSchema.virtual("students", {
  ref: "Students",
  localField: "studentId",
  foreignField: "_id",
});

// Indexes
PaymentSchema.index({ studentId: 1 });
PaymentSchema.index({ courseId: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ paymentStatus: 1 });
PaymentSchema.index({ isVerifiedByAdmin: 1 });

// Export the model
const Payment =mongoose.models.Payment || model<IPayment, PaymentModel>("Payment", PaymentSchema);
export default Payment