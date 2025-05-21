import { initializeDatabase } from "@/lib/initDb";
import Admin from "@/models/admin.model";
import Certification, { I_Certifications } from "@/models/certification.model";
import Experience, { I_Experiences } from "@/models/experience.model";
import Profile from "@/models/profile.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest):Promise<NextResponse> {

  try {
    // Parse and validate request body
    const { adminId, instructorDetails } = await request.json();
    
    if (!adminId || !instructorDetails) {
      return NextResponse.json(
        { error: "Admin ID and instructor details are required" }, 
        { status: 400 }
      );
    }

    await initializeDatabase();

    // Verify admin exists
    const existingAdmin = await Admin.findById(adminId);
    if (!existingAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Check if profile already exists
    if (existingAdmin.profile_details) {
      return NextResponse.json(
        { error: "Admin already has a profile" }, 
        { status: 400 }
      );
    }

    // Destructure and validate instructor details
    const { 
      fullName, 
      dateOfBirth, 
      avatarUrl, 
      shortBio, 
      socialMediaAccounts = [], 
      specialization = [], 
      certifications = [], 
      experiences = [] 
    } = instructorDetails;

    // Validate required fields
    const requiredFields = [
      { field: 'fullName', value: fullName },
      { field: 'dateOfBirth', value: dateOfBirth },
      { field: 'avatarUrl', value: avatarUrl },
      { field: 'shortBio', value: shortBio }
    ];

    for (const { field, value } of requiredFields) {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate arrays
    if (socialMediaAccounts.length < 1) {
      return NextResponse.json(
        { error: "At least one social media account is required" },
        { status: 400 }
      );
    }

    if (specialization.length < 1) {
      return NextResponse.json(
        { error: "At least one specialization is required" },
        { status: 400 }
      );
    }

    if (certifications.length < 1) {
      return NextResponse.json(
        { error: "At least one certification is required" },
        { status: 400 }
      );
    }

    if (experiences.length < 1) {
      return NextResponse.json(
        { error: "At least one experience is required" },
        { status: 400 }
      );
    }

    // Validate social media accounts
    for (const account of socialMediaAccounts) {
      if (!account.siteName || !account.siteUrl) {
        return NextResponse.json(
          { error: "Both siteName and siteUrl are required for social media accounts" },
          { status: 400 }
        );
      }
    }

    // Validate certifications
    for (const certification of certifications) {
      if (
        !certification.recipientName ||
        !certification.certificationTitle ||
        !certification.issuedOrganization ||
        !certification.issuedDate
      ) {
        return NextResponse.json(
          { error: "All required certification fields must be provided" },
          { status: 400 }
        );
      }
    }

    // Validate experiences
    for (const experience of experiences) {
      if (
        !experience.workedOrganization ||
        !experience.role ||
        !experience.organizationJoiningDate
      ) {
        return NextResponse.json(
          { error: "All required experience fields must be provided" },
          { status: 400 }
        );
      }
    }

    // Create certifications in parallel
    const newCertifications = await Promise.all(
      certifications.map(async (certification: I_Certifications) => {
        try {
          const newCertificate = new Certification({
            recipientName: certification.recipientName,
            certificationTitle: certification.certificationTitle,
            issuedOrganization: certification.issuedOrganization,
            certificateId: certification.certificateId,
            durationOfTrainingInWeeks: certification.durationOfTrainingInWeeks,
            certificationScore: certification.certificationScore,
            certificateFileUrl: certification.certificateFileUrl,
            issuedDate: certification.issuedDate,
            specialMessage: certification.specialMessage
          });
          return (await newCertificate.save())._id;
        } catch (error) {
          throw new Error(`Failed to create certification: ${error}`);
        }
      })
    );

    // Create experiences in parallel
    const newExperiences = await Promise.all(
      experiences.map(async (experience: I_Experiences) => {
        try {
          const newExperience = new Experience({
            workedOrganization: experience.workedOrganization,
            role: experience.role,
            organizationJoiningDate: experience.organizationJoiningDate,
            organizationLeaveDate: experience.organizationLeaveDate,
            workDescription: experience.workDescription,
            workDurationInMonths: experience.workDurationInMonths
          });
          return (await newExperience.save())._id;
        } catch (error) {
          throw new Error(`Failed to create experience: ${error}`);
        }
      })
    );

    // Create the instructor profile
    const newInstructor = new Profile({
      fullName: fullName.trim(),
      dateOfBirth,
      avatarUrl: avatarUrl.trim(),
      ShortBio: shortBio.trim(),
      socialMediaAccounts,
      certifications: newCertifications,
      experiences: newExperiences,
      specialization: specialization.map((s:string) => s.trim()),
      adminId: existingAdmin._id,
    });

    await newInstructor.save();

    // Update admin with profile reference
    existingAdmin.profile_details = newInstructor._id;
    await existingAdmin.save();
    console.log(newInstructor)

    return NextResponse.json(
      { 
        message: "Instructor profile created successfully",
        data: {
          profileId: newInstructor._id,
          adminId: existingAdmin?._id
        }
      }, 
      { status: 201 }
    );
  } catch (error) {
    // Abort transaction on error
    
    console.error("Profile creation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to create instructor profile",
        details: error
      }, 
      { status: 500 }
    );
  }
}