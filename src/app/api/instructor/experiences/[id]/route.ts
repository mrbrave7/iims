import Experience from "@/models/experience.model";
import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve a specific experience
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const experience = await Experience.findById(id);
    if (!experience) {
      return NextResponse.json(
        { message: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ experience }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT: Create a new experience
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } =await params;
    const {newExperience} = await req.json();
console.log(id,newExperience)
    const {
      workedOrganization,
      role,
      workDurationInMonths,
      organizationJoiningDate,
      organizationLeaveDate,
      workDescription,
    } = newExperience;

    // Validate required fields
    if (!workedOrganization || !role || !organizationJoiningDate) {
      return NextResponse.json(
        { message: "Missing required fields: workedOrganization, role, and organizationJoiningDate are required" },
        { status: 400 }
      );
    }

    // Create new experience
    const createdExperience = new Experience({
      workedOrganization,
      role,
      workDurationInMonths,
      organizationJoiningDate,
      organizationLeaveDate,
      workDescription,
    });

    // Find profile
    const profileDetails = await Profile.findById(id);
    if (!profileDetails) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Add experience to profile and save both
    profileDetails.experiences = profileDetails.experiences || [];
    profileDetails.experiences.push(createdExperience._id);
    await Promise.all([createdExperience.save(), profileDetails.save()]);

    return NextResponse.json(
      {
        experienceId: createdExperience._id,
        message: "Experience added successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    if (error instanceof Error && error.name === "CastError") {
      return NextResponse.json(
        { success: false, message: "Invalid profile ID" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove an experience
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } =await params;
    const { experienceId } = await req.json();

    // Validate inputs
    if (!experienceId) {
      return NextResponse.json(
        { message: "Experience ID is required" },
        { status: 400 }
      );
    }

    // Find profile
    const existingProfile = await Profile.findById(id);
    if (!existingProfile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Remove experience from profile
    const experienceIndex = existingProfile.experiences.findIndex(
      (expId) => expId.toString() === experienceId
    );

    if (experienceIndex === -1) {
      return NextResponse.json(
        { message: "Experience not found in profile" },
        { status: 404 }
      );
    }

    // Remove experience from profile array
    existingProfile.experiences.splice(experienceIndex, 1);

    // Delete experience and save profile
    await Promise.all([
      Experience.findByIdAndDelete(experienceId),
      existingProfile.save(),
    ]);

    return NextResponse.json(
      { message: "Experience removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}