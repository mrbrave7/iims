import Certification from "@/models/certification.model";
import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

// GET: Retrieve a specific certification
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    const certification = await Certification.findById(id);
    if (!certification) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ certification }, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT: Update or create a new certification
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const newCertification = await req.json();

    const {
      certificationTitle,
      issuedOrganization,
      issuedDate,
      durationOfTrainingInWeeks,
      specialMessage,
      recipientName,
      certificateId,
      certificationScore,
      certificateFileUrl,
    } = newCertification;

    // Validate required fields
    if (!certificationTitle || !issuedOrganization || !recipientName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new certification
    const createdCertification = new Certification({
      certificationTitle,
      issuedOrganization,
      issuedDate,
      durationOfTrainingInWeeks,
      specialMessage,
      recipientName,
      certificateId,
      certificationScore,
      certificateFileUrl,
    });

    // Find profile
    const profileDetails = await Profile.findById(id);
    if (!profileDetails) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Add certification to profile and save both
    profileDetails.certifications.push(createdCertification._id);
    await Promise.all([createdCertification.save(), profileDetails.save()]);

    return NextResponse.json(
      { certificateId: createdCertification._id, message: "Certification added successfully" },
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
      { success: false, message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a certification
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { certificateId } = await req.json();

    // Validate inputs
    if (!certificateId) {
      return NextResponse.json(
        { message: "Certificate ID is required" },
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

    // Remove certification from profile
    const certificationIndex = existingProfile.certifications.findIndex(
      (certId) => certId.toString() === certificateId
    );
    
    if (certificationIndex === -1) {
      return NextResponse.json(
        { message: "Certification not found in profile" },
        { status: 404 }
      );
    }

    // Remove certification from profile array
    existingProfile.certifications.splice(certificationIndex, 1);

    // Delete certification and save profile
    await Promise.all([
      Certification.findByIdAndDelete(certificateId),
      existingProfile.save()
    ]);

    return NextResponse.json(
      { message: "Certification removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { 
        message: "Internal Server Error", 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}