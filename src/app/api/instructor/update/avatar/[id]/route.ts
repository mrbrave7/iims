import { initializeDatabase } from "@/lib/initDb";
import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

// PATCH handler to update profile avatar
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        // Extract id from params
        const { id } = await params;
        // Parse request body
        const data = await req.json();
        const newAvatarUrl = data

        // Validate input
        if (!newAvatarUrl || typeof newAvatarUrl !== "string") {
            return NextResponse.json(
                { message: "Invalid or missing avatar URL" },
                { status: 400 }
            );
        }

        await initializeDatabase()

        // Find and update profile
        const profileDetails = await Profile.findById(id);
        if (!profileDetails) {
            return NextResponse.json(
                { message: "Profile with this ID doesn't exist" },
                { status: 404 }
            );
        }

        // Update avatarUrl
        profileDetails.avatarUrl = newAvatarUrl;
        await profileDetails.save();

        // Return success response
        return NextResponse.json(
            { avatarUrl: newAvatarUrl },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error updating profile avatar:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}