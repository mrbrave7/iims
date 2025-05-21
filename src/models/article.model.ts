import { Schema, Types, model, models } from "mongoose";

interface Article {
    title: string;
    thumbnailUrl: string;
    content: string;
    createdBy: Schema.Types.ObjectId;
    isPublicallyAvailable:boolean;
    slug: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    publishedAt?: Date;
    views: number;
    likes: Schema.Types.ObjectId[];
    comments:Types.ObjectId[];
    meta: {
        keywords: string[];
        description: string;
    };
}

const articleSchema = new Schema<Article>({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 200
    },
    thumbnailUrl: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: (value: string) => /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/.test(value),
            message: "Invalid thumbnail URL format"
        }
    },
    content: {
        type: String,
        required: true,
        minlength: 100
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "Profile",
        required: true
    },
    isPublicallyAvailable:{
        type:Boolean,
        required:true,
        index:true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[a-z0-9-]+$/
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: 30
    }],
    status: {
        type: String,
        enum: ["draft", "published", "archived"],
        default: "draft"
    },
    publishedAt: {
        type: Date,
        required: function() { return this.status === "published"; }
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: "Students"
    }],
    comments: [{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }],
    meta: {
        keywords: [{
            type: String,
            trim: true,
            maxlength: 50
        }],
        description: {
            type: String,
            trim: true,
            maxlength: 160
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// Virtual to calculate comment count
articleSchema.virtual("commentCount").get(function() {
    return this.comments.length;
});

// Pre-save middleware to generate slug if not provided
articleSchema.pre("save", async function(next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }
    next();
});

const Article =models.Article || model<Article>("Article", articleSchema);

export default Article;