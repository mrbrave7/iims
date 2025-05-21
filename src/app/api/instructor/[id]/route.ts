import { initializeDatabase } from "@/lib/initDb";
import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";
import Experience from "@/models/experience.model";
import Certification from "@/models/certification.model";
import Admin from "@/models/admin.model";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { id } = await params;

        await initializeDatabase();
        const profileDetails = await Profile.findById(id)

        if (!profileDetails) {
            return NextResponse.json(
                { message: "Profile not found", id },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { message: "Profile fetched successfully", profile: profileDetails },
            { status: 200 }
        );
    } catch (error: unknown) {
        console.error("Error fetching profile:", error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { message: "Failed to fetch profile", error: errorMessage },
            { status: 500 }
        );
    }
}
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { id } = await params
        await Admin.findByIdAndDelete(id)
        return NextResponse.json({ message: "Instructor Deleted Successfully", instructorId: id })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 })
    }
}