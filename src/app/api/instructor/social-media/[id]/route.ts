import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { id } = await params
        const {socialMediaAccounts} = await req.json()
        const profileDetails = await Profile.findById(id)
        if(!profileDetails){
            return NextResponse.json({message:"Instructor Profile With This Id Doesn't Exist"},{status:404})
        }
        profileDetails.socialMediaAccounts =socialMediaAccounts
        await profileDetails.save() 
        return NextResponse.json({ message: "Updated" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 })
    }
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { id } = await params;
        const { index } = await req.json();

        // Validate input
        if (!Number.isInteger(index) || index < 0) {
            return NextResponse.json({ message: "Index must be a non-negative integer" }, { status: 400 });
        }

        const profileDetails = await Profile.findById(id);
        if (!profileDetails) {
            return NextResponse.json({ message: "Instructor Profile With This Id Doesn't Exist" }, { status: 404 });
        }

        const socialMediaAccounts = profileDetails.socialMediaAccounts;
        if (index >= socialMediaAccounts.length) {
            return NextResponse.json({ message: "Index out of bounds" }, { status: 400 });
        }

        socialMediaAccounts.splice(index, 1); // Modify array directly
        await profileDetails.save();
        return NextResponse.json({ message: "Updated" }, { status: 200 });
    } catch (error) {
        console.error("PATCH /api/instructor/social-media/[id] error:", error);
        if (error instanceof Error && error.name === "CastError") {
            return NextResponse.json({ message: "Invalid profile ID" }, { status: 400 });
        }
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}