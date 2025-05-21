import Article from "@/models/article.model";
import { NextRequest, NextResponse } from "next/server";

interface ArticleUpdateBody {
  title: string;
  thumbnailUrl: string;
  content: string;
  visibility: "public" | "private";
  meta: {
    keywords: string[];
    description: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { message: "Article Not Available" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ article }, { status: 200 });
  } catch (error) {
    console.error("GET article error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } =await params;
    const body: ArticleUpdateBody = await req.json();
    
    const { title, thumbnailUrl, content, visibility, meta } = body;
    
    // Basic validation
    if (!title || !content || !meta?.keywords || !meta?.description) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingArticle = await Article.findById(id);
    
    if (!existingArticle) {
      return NextResponse.json(
        { message: "Article Not Found" },
        { status: 404 }
      );
    }

    existingArticle.title = title;
    existingArticle.thumbnailUrl = thumbnailUrl;
    existingArticle.content = content;
    existingArticle.meta = {
      keywords: meta.keywords,
      description: meta.description,
    };
    existingArticle.tags = meta.keywords
    existingArticle.isPublicallyAvailable = visibility === "public";
    
    await existingArticle.save();
    
    return NextResponse.json(
      { message: "Article Updated Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT article error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const article = await Article.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { message: "Article Not Found" },
        { status: 404 }
      );
    }
    
    await article.deleteOne();
    
    return NextResponse.json(
      { message: "Article Deleted Successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE article error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}