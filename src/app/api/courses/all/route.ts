import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import OfflineCourse from '@/models/offline.courses.model';
import { initializeDatabase } from '@/lib/initDb';

export async function GET(req: NextRequest):Promise<NextResponse> {
  try {
    await initializeDatabase();

    // Get pagination parameters
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(0, parseInt(searchParams.get('limit') || '10')); // Default limit
    const skip = (page - 1) * limit;

    // Query courses
    const courses = await OfflineCourse.find({})
      .select('courseSEOAndMarketing.courseBannerUrl courseCategories.courseCategory course.courseDurationInDays coursePricingAndOffers.courseFeeStructure course.courseLevel course.courseName enrollmentStatus.courseStatus courseCategories.courseSubCategory coursePricingAndOffers.isCourseOnOffer courseCategories.trendingScore courseInstructors')
      .populate({
        path: 'courseInstructors',
        select: '_id profile_details',
        populate: {
          path: 'profile_details',
          select: 'fullName avatarUrl'
        }
      })
      .sort({ 'courseCategories.trendingScore': -1 }) // Optional: sort by trendingScore
      .skip(skip)
      .limit(limit > 0 ? limit : 0);

    // Get total count
    const totalCourses = await OfflineCourse.countDocuments({});

    return NextResponse.json({
      success: true,
      count: courses.length,
      total: totalCourses,
      page: limit > 0 ? page : 1,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { success: false, message: 'Server error while fetching courses' },
      { status: 500 }
    );
  }
}