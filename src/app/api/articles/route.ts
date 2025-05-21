import { initializeDatabase } from "@/lib/initDb";
import Article from "@/models/article.model";
import { NextRequest, NextResponse } from "next/server";


// Utility function to generate slug from title
function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Utility function to validate URL
function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Main validation function
function validateArticleData(data: {
    title: string;
    content: string;
    thumbnailUrl: string;
    keywords: string[];
    description: string;
    visibility: string;
}): Record<string, string> {
    const errors: Record<string, string> = {};

    // Title validation
    if (!data.title.trim()) {
        errors.title = "Title is required";
    } else if (data.title.length > 100) {
        errors.title = "Title cannot exceed 100 characters";
    }

    // Content validation
    if (!data.content.trim()) {
        errors.content = "Content is required";
    }

    // Thumbnail URL validation
    if (!data.thumbnailUrl.trim()) {
        errors.thumbnailUrl = "Thumbnail URL is required";
    } else if (!isValidUrl(data.thumbnailUrl)) {
        errors.thumbnailUrl = "Please enter a valid URL";
    }

    // Keywords validation
    if (!data.keywords || data.keywords.length === 0) {
        errors.keywords = "At least one keyword is required";
    } else if (data.keywords.length > 10) {
        errors.keywords = "Cannot have more than 10 keywords";
    } else if (data.keywords.some(k => k.length > 50)) {
        errors.keywords = "Each keyword cannot exceed 50 characters";
    }

    // Description validation
    if (!data.description.trim()) {
        errors.description = "Description is required";
    } else if (data.description.length > 160) {
        errors.description = "Description cannot exceed 160 characters";
    }

    // Visibility validation
    if (!['public', 'private'].includes(data.visibility)) {
        errors.visibility = "Visibility must be either public or private";
    }

    return errors;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Connect to database
        await initializeDatabase()

        // Parse request data
        const data = await req.json();
        const { title, content, thumbnailUrl, visibility, meta, admiId } = data;

        // Validate required fields presence
        if (!title || !content || !thumbnailUrl || !visibility || !meta || !admiId) {
            return NextResponse.json(
                { message: "All required fields must be provided" },
                { status: 400 }
            );
        }

        // Destructure meta data
        const { keywords, description } = meta;

        // Validate all fields
        const validationErrors = validateArticleData({
            title,
            content,
            thumbnailUrl,
            keywords,
            description,
            visibility
        });

        if (Object.keys(validationErrors).length > 0) {
            return NextResponse.json(
                {
                    message: "Validation failed",
                    errors: validationErrors
                },
                { status: 400 }
            );
        }

        // Generate slug and check for duplicates
        const slug = slugify(title);
        const existingArticle = await Article.findOne({ slug });
        if (existingArticle) {
            return NextResponse.json(
                { message: "An article with similar title already exists" },
                { status: 409 }
            );
        }

        // Create and save new article
        const newArticle = new Article({
            title,
            slug,
            content,
            thumbnailUrl,
            createdBy: admiId,
            tags: keywords,
            meta: {
                keywords,
                description
            },
            isPublicallyAvailable: visibility === "public",
            status: "published",
            publishedAt: Date.now()
        });

        const savedArticle = await newArticle.save();

        // Return success response
        return NextResponse.json(
            {
                message: "Article created successfully",
                savedArticle
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Article creation error:", error);

        // Return error response
        return NextResponse.json(
            {
                message: "Internal server error",
                error
            },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        // Initialize database connection
        await initializeDatabase();

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status'); // 'published', 'draft', etc.
        const isPublic = searchParams.get('public'); // 'true' or 'false'
        const sortBy = searchParams.get('sort') || '-publishedAt'; // Default: newest first

        // Build query
        const query: any = {};
        
        if (status) {
            query.status = status;
        }
        
        if (isPublic) {
            query.isPublicallyAvailable = isPublic === 'true';
        }

        // Get articles with pagination
        const articles = await Article.find(query)
            .select('title slug thumbnailUrl isPublicallyAvailable status likes views publishedAt')
            .sort(sortBy)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(); // Convert to plain JS objects

        // Get total count for pagination info
        const total = await Article.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: articles,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('GET Articles Error:', error);
        
        return NextResponse.json({
            success: false,
            message: "Failed to fetch articles",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
