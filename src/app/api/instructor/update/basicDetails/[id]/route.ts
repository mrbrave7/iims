import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

// PATCH handler to update profile fullName and ShortBio
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        // Extract id from params
        const { id } = await params;

        const data = await req.json()
        console.log("data : ",data)
        // Parse request body
        // const { fullName, ShortBio } = await req.json();
        const {fullName,shortBio} = data

        // Validate input
        if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Invalid or missing fullName" },
                { status: 400 }
            );
        }
        if (!shortBio || typeof shortBio !== "string" || shortBio.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "Invalid or missing ShortBio" },
                { status: 400 }
            );
        }

        // Additional validation (e.g., length constraints)
        if (fullName.length > 100) {
            return NextResponse.json(
                { success: false, message: "fullName must not exceed 100 characters" },
                { status: 400 }
            );
        }
        if (shortBio.length > 500) {
            return NextResponse.json(
                { success: false, message: "ShortBio must not exceed 500 characters" },
                { status: 400 }
            );
        }

        // Find and update profile
        const profileDetails = await Profile.findById(id);
        if (!profileDetails) {
            return NextResponse.json(
                { success: false, message: "Profile with this ID doesn't exist" },
                { status: 404 }
            );
        }

        // Update fields
        profileDetails.fullName = fullName.trim();
        profileDetails.ShortBio = shortBio.trim();
        await profileDetails.save();

        // Return success response
        return NextResponse.json(
            {
                message: "Profile updated successfully",
                fullName: profileDetails.fullName,
                ShortBio: profileDetails.ShortBio,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error(`Error updating profile basic details`, error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}