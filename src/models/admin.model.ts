import mongoose, { Schema, Model, Document, Types, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Interface for Admin document
export interface IAdmin extends Document {
  _id: Types.ObjectId;
  username: string;
  role: "super_instructor" | "instructor" | "support" | "manager";
  phone?: string;
  email?: string;
  password: string;
  permission: "handle_admin_panel" | "manage_courses" | "view_students";
  last_login: Date;
  is_active: boolean;
  status: "working" | "inactive" | "suspended" | "unverified";
  profile_details?: Types.ObjectId;
  refreshToken?: string;
  comparePassword(password: string): Promise<boolean>;
  generateTokens(): { accessToken: string; refreshToken: string };
}

// Interface for query options
interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

// Interface for query response
export interface QueryResponse<T> {
  admins: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Schema definition
const adminSchema = new Schema<IAdmin>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      index: true,
      trim: true,
      unique: true,
      minlength: [4, "Username must be at least 4 characters"],
      maxlength: [25, "Username cannot exceed 25 characters"],
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      lowercase: true,
      validate: {
        validator: function (value: string | undefined): boolean {
          if (!value) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Invalid email format",
      },
    },
    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      validate: {
        validator: function (value: string | undefined): boolean {
          if (!value) return true;
          return /^\+?[1-9]\d{6,14}$/.test(value?.replace(/[\s()-]/g, ""));
        },
        message: "Invalid phone number format",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["super_instructor", "instructor", "support", "manager"],
        message: "Invalid role value",
      },
      required: [true, "Role is required"],
      default: "instructor",
    },
    permission: {
      type: String,
      enum: {
        values: ["handle_admin_panel", "manage_courses", "view_students"],
        message: "Invalid permission value",
      },
      required: [true, "Permission is required"],
      default: "view_students",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: function (value: string): boolean {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        },
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
      select: false,
    },
    last_login: {
      type: Date,
      required: [true, "Last login is required"],
      default: Date.now,
    },
    is_active: {
      type: Boolean,
      required: true,
      default: true,
    },
    status: {
      type: String,
      enum: {
        values: ["working", "inactive", "suspended", "unverified"],
        message: "Invalid status value",
      },
      required: true,
      default: "unverified",
    },
    profile_details: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: "admins",
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.tokenExpiration;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.tokenExpiration;
        return ret;
      },
    },
  }
);

// Validation middleware
adminSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    next(new Error("Either email or phone number must be provided"));
  } else {
    next();
  }
});

// Password hashing middleware
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error instanceof Error ? error : new Error("Password hashing failed"));
  }
});

// Password comparison method
adminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error: unknown) {
    throw new Error("Password comparison failed");
  }
};

// Token generation method
adminSchema.methods.generateTokens = function (): {
  accessToken: string;
  refreshToken: string;
} {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("Token secrets not configured");
  }

  const payload = {
    id: this._id.toString(),
    role: this.role,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  this.refreshToken = refreshToken;
  this.tokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  return { accessToken, refreshToken };
};


adminSchema.statics.getAllAdmins = async function ({
  page = 1,
  limit = 10,
  search = "",
  sort = "username",
}: QueryOptions = {}): Promise<QueryResponse<IAdmin>> {
  try {

    // Cache miss: query MongoDB
    const skip = (page - 1) * limit;
    const searchQuery = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [admins, total] = await Promise.all([
      this.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.countDocuments(searchQuery).exec(),
    ]);

    const response: QueryResponse<IAdmin> = {
      admins,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };


    return response;
  } catch (error: unknown) {
    console.error(`Error in getAllAdmins: ${error}`);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch admins"
    );
  }
};

adminSchema.statics.getAdminsByRole = async function (
  role: IAdmin["role"],
  options: QueryOptions = {}
): Promise<QueryResponse<IAdmin>> {
  if (!["super_instructor", "instructor", "support", "manager"].includes(role)) {
    throw new Error("Invalid role value");
  }

  const { page = 1, limit = 10, search = "", sort = "username" } = options;

  try {
    // Cache miss: query MongoDB
    const skip = (page - 1) * limit;
    const searchQuery = search
      ? {
          role,
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : { role };

    const [admins, total] = await Promise.all([
      this.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.countDocuments(searchQuery).exec(),
    ]);

    const response: QueryResponse<IAdmin> = {
      admins,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    return response;
  } catch (error: unknown) {
    console.error(`Error in getAdminsByRole: ${error}`);
    throw new Error(
      error instanceof Error ? error.message : `Failed to fetch admins with role ${role}`
    );
  }
};

adminSchema.statics.getAdminsByStatus = async function (
  status: IAdmin["status"],
  options: QueryOptions = {}
): Promise<QueryResponse<IAdmin>> {
  if (!["working", "inactive", "suspended", "unverified"].includes(status)) {
    throw new Error("Invalid status value");
  }

  const { page = 1, limit = 10, search = "", sort = "username" } = options;

  try {

    // Cache miss: query MongoDB
    const skip = (page - 1) * limit;
    const searchQuery = search
      ? {
          status,
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : { status };

    const [admins, total] = await Promise.all([
      this.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.countDocuments(searchQuery).exec(),
    ]);

    const response: QueryResponse<IAdmin> = {
      admins,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };


    return response;
  } catch (error: unknown) {
    console.error(`Error in getAdminsByStatus: ${error}`);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to fetch admins with status ${status}`
    );
  }
};

adminSchema.statics.getAdminsByPermission = async function (
  permission: IAdmin["permission"],
  options: QueryOptions = {}
): Promise<QueryResponse<IAdmin>> {
  if (
    !["handle_admin_panel", "manage_courses", "view_students"].includes(permission)
  ) {
    throw new Error("Invalid permission value");
  }

  const { page = 1, limit = 10, search = "", sort = "username" } = options;

  try {

    // Cache miss: query MongoDB
    const skip = (page - 1) * limit;
    const searchQuery = search
      ? {
          permission,
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : { permission };

    const [admins, total] = await Promise.all([
      this.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.countDocuments(searchQuery).exec(),
    ]);

    const response: QueryResponse<IAdmin> = {
      admins,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    return response;
  } catch (error: unknown) {
    console.error(`Error in getAdminsByPermission: ${error}`);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to fetch admins with permission ${permission}`
    );
  }
};

adminSchema.statics.getAdminById = async function (
  id: string | Types.ObjectId,
  populateProfile: boolean = false
): Promise<IAdmin | null> {
  try {

    // Cache miss: query MongoDB
    const query = this.findById(id);
    if (populateProfile) {
      query.populate("profile_details");
    }
    const admin = await query.lean().exec();
    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  } catch (error: unknown) {
    console.error(`Error in getAdminById: ${error}`);
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch admin by ID"
    );
  }
};

adminSchema.statics.checkAdminExists = async function ({
  email,
  phone,
  username,
}: {
  email?: string;
  phone?: string;
  username?: string;
}): Promise<boolean> {
  try {

    // Cache miss: query MongoDB
    const query = {
      $or: [
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(username ? [{ username }] : []),
      ],
    };
    const count = await this.countDocuments(query).exec();
    const exists = count > 0;

    return exists;
  } catch (error: unknown) {
    console.error(`Error in checkAdminExists: ${error}`);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to check if admin exists"
    );
  }
};

adminSchema.statics.updateAdminStatus = async function (
  id: string | Types.ObjectId,
  status: IAdmin["status"],
  updatedBy: string | Types.ObjectId
): Promise<IAdmin | null> {
  if (!["working", "inactive", "suspended", "unverified"].includes(status)) {
    throw new Error("Invalid status value");
  }

  try {
    const admin = await this.findById(id).exec();
    if (!admin) {
      throw new Error("Admin not found");
    }
    if (admin.role === "super_instructor" && updatedBy.toString() !== id.toString()) {
      throw new Error("Only super_instructor can modify their own status");
    }

    admin.status = status;
    admin.updatedAt = new Date();
    await admin.save();


    return admin.toObject();
  } catch (error: unknown) {
    console.error(`Error in updateAdminStatus: ${error}`);
    throw new Error(
      error instanceof Error ? error.message : "Failed to update admin status"
    );
  }
};

adminSchema.statics.bulkUpdateAdminStatus = async function (
  ids: (string | Types.ObjectId)[],
  status: IAdmin["status"],
  updatedBy: string | Types.ObjectId
): Promise<number> {
  if (!["working", "inactive", "suspended", "unverified"].includes(status)) {
    throw new Error("Invalid status value");
  }

  try {
    const result = await this.updateMany(
      {
        _id: { $in: ids },
        role: { $ne: "super_instructor" },
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    ).exec();

    return result.modifiedCount;
  } catch (error: unknown) {
    console.error(`Error in bulkUpdateAdminStatus: ${error}`);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to bulk update admin statuses"
    );
  }
};

// Model type
interface AdminModel extends Model<IAdmin> {
  getAllAdmins(options?: QueryOptions): Promise<QueryResponse<IAdmin>>;
  getAdminsByRole(
    role: IAdmin["role"],
    options?: QueryOptions
  ): Promise<QueryResponse<IAdmin>>;
  getAdminsByStatus(
    status: IAdmin["status"],
    options?: QueryOptions
  ): Promise<QueryResponse<IAdmin>>;
  getAdminsByPermission(
    permission: IAdmin["permission"],
    options?: QueryOptions
  ): Promise<QueryResponse<IAdmin>>;
  getAdminById(
    id: string | Types.ObjectId,
    populateProfile?: boolean
  ): Promise<IAdmin | null>;
  checkAdminExists(params: {
    email?: string;
    phone?: string;
    username?: string;
  }): Promise<boolean>;
  updateAdminStatus(
    id: string | Types.ObjectId,
    status: IAdmin["status"],
    updatedBy: string | Types.ObjectId
  ): Promise<IAdmin | null>;
  bulkUpdateAdminStatus(
    ids: (string | Types.ObjectId)[],
    status: IAdmin["status"],
    updatedBy: string | Types.ObjectId
  ): Promise<number>;
}

// Create or retrieve model
const Admin: AdminModel =
  (mongoose.models.Admin as AdminModel) ||
  model<IAdmin, AdminModel>("Admin", adminSchema);

export default Admin;