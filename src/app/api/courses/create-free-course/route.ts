import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import FreeCourse from "@/models/free.course.mode";
import Module from "@/models/course.module.model"; // Adjust path to your Module model
import { initializeDatabase } from "@/lib/initDb";
import CourseCardComponent from "@/models/course.card.model";
import Profile from "@/models/profile.model";

// Define interfaces for type safety
interface ModuleData {
    moduleTitle: string;
    moduleDescription: string;
    moduleDurationsInDays: number;
    moduleVideoUrl?: string;
    notes?: string;
    articleUrl?: string;
    moduleBannerUrl?: string;
    learningObjectives?: string[];
    order: number;
}

interface CourseData {
    courseName: string;
    courseSlug: string;
    courseDescription: string;
    courseDurationInHours: number;
    courseStatus: "Available" | "Unavailable" | "Archived" | "Draft";
    seoMetaTitle?: string;
    seoMetaDescription?: string;
    promoVideoUrl?: string;
    courseBannerUrl?: string;
    courseGoals: string[];
    syllabusOutline: string[];
    modules: ModuleData[];
    courseLevel: "Beginner" | "Intermediate" | "Advanced";
    targetAudience: string[];
    availableLanguages: string[];
    courseCategory: string;
    courseSubCategory: string;
    certificateTemplateUrl?: string;
    trendingScore?: number;
    courseInstructor: string; // Expecting a string ObjectId
}

// Utility function to validate URLs
function isValidUrl(url: string | undefined): boolean {
    if (!url) return true; // Optional fields can be undefined
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Utility function to validate arrays
function isNonEmptyArray(arr: any[] | undefined, fieldName: string): boolean {
    return Array.isArray(arr) && arr.length > 0 && arr.every(item => typeof item === "string" && item.trim() !== "");
}

// Utility function to validate ObjectId
function isValidObjectId(id: any): boolean {
    return Types.ObjectId.isValid(id);
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Parse request body
        const body = await req.json();

        // Destructure and validate course data
        const {
            courseName,
            courseSlug,
            courseDescription,
            courseDurationInHours,
            courseStatus,
            seoMetaTitle,
            seoMetaDescription,
            promoVideoUrl,
            courseBannerUrl,
            courseGoals,
            syllabusOutline,
            modules,
            courseLevel,
            targetAudience,
            availableLanguages,
            courseCategory,
            courseSubCategory,
            certificateTemplateUrl,
            trendingScore,
            courseInstructor,
        } = body as CourseData;

        // Validate required fields
        if (!courseName || typeof courseName !== "string" || courseName.trim() === "") {
            return NextResponse.json({ errMessage: "Course name is required and must be a non-empty string" }, { status: 400 });
        }
        if (!courseSlug || typeof courseSlug !== "string" || courseSlug.trim() === "") {
            return NextResponse.json({ errMessage: "Course slug is required and must be a non-empty string" }, { status: 400 });
        }
        if (!courseDescription || typeof courseDescription !== "string" || courseDescription.trim() === "") {
            return NextResponse.json({ errMessage: "Course description is required and must be a non-empty string" }, { status: 400 });
        }
        if (typeof courseDurationInHours !== "number" || courseDurationInHours <= 0) {
            return NextResponse.json({ errMessage: "Course duration must be a positive number" }, { status: 400 });
        }
        if (
            !courseStatus ||
            !["Available", "Unavailable", "Archived", "Draft"].includes(courseStatus)
        ) {
            return NextResponse.json({ errMessage: "Course status is required and must be one of: Available, Unavailable, Archived, Draft" }, { status: 400 });
        }
        if (seoMetaTitle && (typeof seoMetaTitle !== "string" || seoMetaTitle.trim() === "")) {
            return NextResponse.json({ errMessage: "SEO meta title must be a non-empty string" }, { status: 400 });
        }
        if (seoMetaDescription && (typeof seoMetaDescription !== "string" || seoMetaDescription.trim() === "")) {
            return NextResponse.json({ errMessage: "SEO meta description must be a non-empty string" }, { status: 400 });
        }
        if (promoVideoUrl && !isValidUrl(promoVideoUrl)) {
            return NextResponse.json({ errMessage: "Promo video URL must be a valid URL" }, { status: 400 });
        }
        if (courseBannerUrl && !isValidUrl(courseBannerUrl)) {
            return NextResponse.json({ errMessage: "Course banner URL must be a valid URL" }, { status: 400 });
        }
        if (!isNonEmptyArray(courseGoals, "Course goals")) {
            return NextResponse.json({ errMessage: "Course goals must be a non-empty array of non-empty strings" }, { status: 400 });
        }
        if (!isNonEmptyArray(syllabusOutline, "Syllabus outline")) {
            return NextResponse.json({ errMessage: "Syllabus outline must be a non-empty array of non-empty strings" }, { status: 400 });
        }
        if (!Array.isArray(modules) || modules.length === 0) {
            return NextResponse.json({ errMessage: "Modules must be a non-empty array" }, { status: 400 });
        }
        if (
            !courseLevel ||
            !["Beginner", "Intermediate", "Advanced"].includes(courseLevel)
        ) {
            return NextResponse.json({ errMessage: "Course level is required and must be one of: Beginner, Intermediate, Advanced" }, { status: 400 });
        }
        if (!isNonEmptyArray(targetAudience, "Target audience")) {
            return NextResponse.json({ errMessage: "Target audience must be a non-empty array of non-empty strings" }, { status: 400 });
        }
        if (!isNonEmptyArray(availableLanguages, "Available languages")) {
            return NextResponse.json({ errMessage: "Available languages must be a non-empty array of non-empty strings" }, { status: 400 });
        }
        if (!courseCategory || typeof courseCategory !== "string" || courseCategory.trim() === "") {
            return NextResponse.json({ errMessage: "Course category is required and must be a non-empty string" }, { status: 400 });
        }
        if (!courseSubCategory || typeof courseSubCategory !== "string" || courseSubCategory.trim() === "") {
            return NextResponse.json({ errMessage: "Course subcategory is required and must be a non-empty string" }, { status: 400 });
        }
        if (certificateTemplateUrl && !isValidUrl(certificateTemplateUrl)) {
            return NextResponse.json({ errMessage: "Certificate template URL must be a valid URL" }, { status: 400 });
        }
        if (trendingScore !== undefined && (typeof trendingScore !== "number" || trendingScore < 0)) {
            return NextResponse.json({ errMessage: "Trending score must be a non-negative number" }, { status: 400 });
        }
        if (!courseInstructor || !isValidObjectId(courseInstructor)) {
            return NextResponse.json({ errMessage: "Course instructor is required and must be a valid Object?post-course-controller.tssId" }, { status: 400 });
        }

        // Validate modules
        for (const [index, module] of modules.entries()) {
            const {
                moduleTitle,
                moduleDescription,
                moduleDurationsInDays,
                moduleVideoUrl,
                notes,
                articleUrl,
                moduleBannerUrl,
                learningObjectives,
                order,
            } = module as ModuleData;

            if (!moduleTitle || typeof moduleTitle !== "string" || moduleTitle.trim() === "") {
                return NextResponse.json({ errMessage: `Module ${index}: Title is required and must be a non-empty string` }, { status: 400 });
            }
            if (!moduleDescription || typeof moduleDescription !== "string" || moduleDescription.trim() === "") {
                return NextResponse.json({ errMessage: `Module ${index}: Description is required and must be a non-empty string` }, { status: 400 });
            }
            if (moduleDurationsInDays <= 0) {
                return NextResponse.json({ errMessage: `Module ${index}: Duration must be a positive number` }, { status: 400 });
            }
            if (moduleVideoUrl && !isValidUrl(moduleVideoUrl)) {
                return NextResponse.json({ errMessage: `Module ${index}: Video URL must be a valid URL` }, { status: 400 });
            }
            if (articleUrl && !isValidUrl(articleUrl)) {
                return NextResponse.json({ errMessage: `Module ${index}: Article URL must be a valid URL` }, { status: 400 });
            }
            if (moduleBannerUrl && !isValidUrl(moduleBannerUrl)) {
                return NextResponse.json({ errMessage: `Module ${index}: Banner URL must be a valid URL` }, { status: 400 });
            }
            if (learningObjectives && (!Array.isArray(learningObjectives) || !learningObjectives.every(obj => typeof obj === "string" && obj.trim() !== ""))) {
                return NextResponse.json({ errMessage: `Module ${index}: Learning objectives must be an array of non-empty strings` }, { status: 400 });
            }
            if (typeof order !== "number" || order < 0) {
                return NextResponse.json({ errMessage: `Module ${index}: Order must be a non-negative number` }, { status: 400 });
            }
        }
        await initializeDatabase()
        // Check for existing course to prevent duplicates
        const existingCourse = await FreeCourse.findOne({
            $or: [{ courseName }, { courseSlug }],
            deletedAt: null,
        });
        if (existingCourse) {
            return NextResponse.json({ errMessage: "Course with this name or slug already exists" }, { status: 400 });
        }

        // Create module documents
        const createdModules = await Promise.all(
            modules.map(async (module: ModuleData) => {
                const newModule = new Module({
                    moduleTitle: module.moduleTitle,
                    moduleDescription: module.moduleDescription,
                    moduleDurationsInDays: module.moduleDurationsInDays,
                    moduleVideoUrl: module.moduleVideoUrl,
                    notes: module.notes,
                    articleUrl: module.articleUrl,
                    moduleBannerUrl: module.moduleBannerUrl,
                    learningObjectives: module.learningObjectives,
                    order: module.order,
                });
                await newModule.save();
                return newModule._id;
            })
        );

        const instructorProfile = Profile.findById(courseInstructor)

        // Create new course document
        const newCourse = new FreeCourse({
            courseName,
            courseSlug,
            courseDescription,
            courseDurationInHours,
            courseStatus,
            seoMetaTitle,
            seoMetaDescription,
            promoVideoUrl,
            courseBannerUrl,
            courseGoals,
            syllabusOutline,
            modules: createdModules,
            courseLevel,
            targetAudience,
            availableLanguages,
            courseCategory,
            courseSubCategory,
            certificateTemplateUrl,
            trendingScore: trendingScore || 0,
            courseInstructor: new Types.ObjectId(courseInstructor),
            ratings: { average: 0, count: 0, lastUpdated: new Date() },
            reviews: [],
            lastTrendingUpdate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            schemaVersion: "1.0.0",
        });
        const courseCard = new CourseCardComponent({
            courseId: newCourse._id,
            courseName: courseName,
            coursePrice: 0,
            courseCategry: courseCategory,
            courseBannerUrl: courseBannerUrl,
            couseType: "Free",
            courseLevel: courseLevel,
            courseInstructor: {
                fullName: instructorProfile?.fullName,
                avatar: instructorProfile?.avatarUrl,
            },
        })

        // Save the course to the database
        await newCourse.save();

        await courseCard.save()

        return NextResponse.json({ message: "Successfully Posted Free Course" }, { status: 201 });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return NextResponse.json(
                { errMessage: "Validation Error", error: Object.values(error.errors).map(err => err.message) },
                { status: 400 }
            );
        }
        if (error instanceof mongoose.Error) {
            return NextResponse.json(
                { errMessage: "Database Error", error: error.message },
                { status: 500 }
            );
        }
        if ((error as any).code === 11000) {
            return NextResponse.json(
                { errMessage: "Duplicate key error: Course name or slug already exists" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { errMessage: "Internal Server Error", error: (error as Error).message },
            { status: 500 }
        );
    }
}