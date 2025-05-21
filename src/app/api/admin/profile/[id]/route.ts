import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
    try {
        const { id } = await params
        const profile = await Profile.findById(id).select("adminId fullName avatarUrl ShortBio specialization")
        if (!profile) {
            return NextResponse.json({ message: "Profile Details Not Found" }, { status: 404 })
        }
        return NextResponse.json({ profile }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 })
    }
}