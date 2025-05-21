import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { specialization } = await req.json()
        const { id } = await params
        const profileDetails = await Profile.findById(id)
        if (!profileDetails) {
            return NextResponse.json(
                { success: false, message: "Profile with this ID doesn't exist" },
                { status: 404 }
            );
        }
        profileDetails.specialization = specialization
        await profileDetails.save()
        return NextResponse.json({ message: "added" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 })
    }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { index } = await req.json();
        const { id } =await params; // Correct: No await needed

        // Validate input
        if (!Number.isInteger(index) || index < 0) {
            return NextResponse.json(
                { success: false, message: "Index must be a non-negative integer" },
                { status: 400 }
            );
        }

        const profileDetails = await Profile.findById(id);
        if (!profileDetails) {
            return NextResponse.json(
                { success: false, message: "Profile with this ID doesn't exist" },
                { status: 404 }
            );
        }

        // Validate specialization is an array
        if (!Array.isArray(profileDetails.specialization)) {
            return NextResponse.json(
                { success: false, message: "specialization must be an array" },
                { status: 400 }
            );
        }

        // Check index bounds
        if (index >= profileDetails.specialization.length) {
            return NextResponse.json(
                { success: false, message: "Index out of bounds" },
                { status: 400 }
            );
        }

        profileDetails.specialization.splice(index, 1); // Modify array in place
        await profileDetails.save();
        return NextResponse.json(
            { success: true, message: "Removed", data: profileDetails.specialization },
            { status: 200 }
        );
    } catch (error) {
        console.error("PATCH /api/instructor/specialization/[id] error:", error); // Log for debugging
        if (error instanceof Error && error.name === "CastError") {
            return NextResponse.json(
                { success: false, message: "Invalid profile ID" },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}