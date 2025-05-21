import { NextRequest, NextResponse } from "next/server";
import Admin from "@/models/admin.model";
import { QueryResponse } from "@/models/admin.model";
import dbConnect from "@/lib/connectDb";

// Interface for the response data
interface AdminResponse {
  success: boolean;
  message: string;
  admins: any[];
  currentUserRole: string;
  total: number;
  page: number;
  totalPages: number;
}

// GET /api/admins
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const sort = searchParams.get("sort") || "username";

    // Connect to MongoDB
    await dbConnect();

    // Fetch admins using getAllAdmins (cache miss)
    const response: QueryResponse<any> = await Admin.getAllAdmins({
      search,
      page,
      limit,
      sort,
    });

    // Prepare response
    const adminResponse: AdminResponse = {
      success: true,
      message: "Admins fetched successfully",
      admins: response.admins,
      currentUserRole: "", // Placeholder; update with actual role if available
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };

    return NextResponse.json(adminResponse, {
      status: 200,
      headers: { "X-Cache-Status": "MISS" },
    });
  } catch (error: unknown) {
    console.error("GET /api/admins error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(req:NextRequest):Promise<NextResponse>{
  try {
    const {role,status,instructorId} = await req.json()
    const existingAdmin = await Admin.findById(instructorId)
    console.log(existingAdmin)
    if(!existingAdmin){
      return NextResponse.json({error:"Admin With This Id Doesnt Exist"},{status:404})
    }
    existingAdmin.role =role
    existingAdmin.status = status
    await existingAdmin.save()
    return NextResponse.json({message:"admin updated successfully"},{status:200})
  } catch (error) {
    return NextResponse.json({error:"Internal Server Error"},{status:500})
  }
}