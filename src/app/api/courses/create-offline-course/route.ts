import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import validator from "validator";
import OfflineCourse, { generateSlug, I_Offline_Course_Model } from "@/models/offline.courses.model"; // Adjust path to your OfflineCourse model
import Batch from "@/models/batch.model"; // Adjust path to your Batch model
import { initializeDatabase } from "@/lib/initDb";
import CourseCardComponent from "@/models/course.card.model";
import Profile from "@/models/profile.model";

// Custom Error Classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

// List of supported currencies
export const worldCurrencies = [
  "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "INR", "NPR", "NZD",
  "SGD", "HKD", "KRW", "ZAR", "BRL", "MXN", "RUB", "SEK", "NOK", "DKK", "AED",
  "ARS", "CLP", "EGP", "ILS", "MYR", "PHP", "SAR", "THB", "TRY",
];

// Utility Validation Functions
function isValidUrl(url: string | undefined): boolean {
  if (!url) return true; // Optional fields can be undefined
  return validator.isURL(url, { protocols: ["http", "https"], require_protocol: true });
}

function isValidEmail(email: string): boolean {
  return validator.isEmail(email);
}

function isValidPhone(phone: string): boolean {
  return validator.isMobilePhone(phone, "any");
}

function isValidDate(date: string | Date): boolean {
  return !isNaN(new Date(date).getTime());
}

function isValidTime(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

function isValidObjectId(id: any): boolean {
  return Types.ObjectId.isValid(id);
}

// Validation function for Batch
function validateBatch(batch: any, index: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!batch || typeof batch !== "object") {
    errors.push(`Batch at index ${index}: Must be an object`);
    return { isValid: false, errors };
  }

  const {
    batchName,
    batchInstructors,
    maxStudentCount,
    batchStartDate,
    enrollmentStartDate,
    enrollmentEndDate,
    address,
  } = batch;

  if (typeof batchName !== "string" || batchName.trim().length < 3 || batchName.trim().length > 50) {
    errors.push(`Batch at index ${index}: Batch name must be a string between 3 and 50 characters`);
  }
  if (!Array.isArray(batchInstructors) || batchInstructors.length === 0 || !batchInstructors.every((instructor: any) => isValidObjectId(instructor.id))) {
    errors.push(`Batch at index ${index}: Batch instructors must be a non-empty array of objects with valid ObjectId 'id' fields`);
  }
  if (typeof maxStudentCount !== "number" || maxStudentCount < 0) {
    errors.push(`Batch at index ${index}: Total student count must be a non-negative number`);
  }
  if (!isValidDate(batchStartDate)) {
    errors.push(`Batch at index ${index}: Batch start Date must be a valid date`);
  }
  if (!isValidDate(enrollmentStartDate)) {
    errors.push(`Batch at index ${index}: Enrollment start date must be a valid date`);
  }
  if (!isValidDate(enrollmentEndDate)) {
    errors.push(`Batch at index ${index}: Enrollment end date must be a valid date`);
  }
  if (enrollmentStartDate && enrollmentEndDate && new Date(enrollmentEndDate) <= new Date(enrollmentStartDate)) {
    errors.push(`Batch at index ${index}: Enrollment end date must be after start date`);
  }
  if (!address || typeof address !== "object") {
    errors.push(`Batch at index ${index}: Address must be an object`);
  } else {
    if (typeof address.street !== "string" || address.street.trim() === "") {
      errors.push(`Batch at index ${index}: Address street must be a non-empty string`);
    }
    if (typeof address.city !== "string" || address.city.trim() === "") {
      errors.push(`Batch at index ${index}: Address city must be a non-empty string`);
    }
    if (typeof address.state !== "string" || address.state.trim() === "") {
      errors.push(`Batch at index ${index}: Address state must be a non-empty string`);
    }
    if (typeof address.country !== "string" || address.country.trim() === "") {
      errors.push(`Batch at index ${index}: Address country must be a non-empty string`);
    }
    if (typeof address.zipCode !== "string" || !isValidZipCode(address.zipCode)) {
      errors.push(`Batch at index ${index}: Address zip code must be in valid format (e.g., 12345 or 12345-6789)`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Validation function for OfflineCourse
function validateOfflineCourse(body: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!body || typeof body !== "object") {
    return { isValid: false, errors: ["Request body must be a valid JSON object"] };
  }

  const {
    course,
    courseCategories,
    batches,
    courseSEOAndMarketing,
    coursePricingAndOffers,
    courseAdditionalFeatures,
  } = body;

  // Validate course
  if (!course || typeof course !== "object") {
    errors.push("Course object is required");
  } else {
    const {
      courseName,
      courseGoals,
      courseLevel,
      courseDescription,
      courseDurationInDays,
      courseDailyClassDurationInMinutes,
      syllabusOutline,
    } = course;

    if (typeof courseName !== "string" || courseName.trim().length < 3 || courseName.trim().length > 100) {
      errors.push("Course name must be a string between 3 and 100 characters");
    }
    if (!Array.isArray(courseGoals) || courseGoals.length === 0 || !courseGoals.every((g: any) => typeof g === "string" && g.trim().length >= 5)) {
      errors.push("Course goals must be a non-empty array of strings with at least 5 characters each");
    }
    if (!["Beginner", "Intermediate", "Advanced"].includes(courseLevel)) {
      errors.push("Course level must be Beginner, Intermediate, or Advanced");
    }
    if (typeof courseDescription !== "string" || courseDescription.trim().length < 10 || courseDescription.trim().length > 3000) {
      errors.push("Course description must be a string between 10 and 3000 characters");
    }
    if (typeof courseDurationInDays !== "number" || !Number.isInteger(courseDurationInDays) || courseDurationInDays < 1) {
      errors.push("Course duration must be a positive integer");
    }
    if (typeof courseDailyClassDurationInMinutes !== "number" || !Number.isInteger(courseDailyClassDurationInMinutes) || courseDailyClassDurationInMinutes < 15) {
      errors.push("Daily class duration must be an integer of at least 15 minutes");
    }
    if (!Array.isArray(syllabusOutline) || syllabusOutline.length === 0 || !syllabusOutline.every((s: any) => typeof s === "string" && s.trim().length >= 5)) {
      errors.push("Syllabus outline must be a non-empty array of strings with at least 5 characters each");
    }
  }

  // Validate courseCategories
  if (!courseCategories || typeof courseCategories !== "object") {
    errors.push("Course category object is required");
  } else {
    const { courseCategory, courseSubCategory, trendingScore } = courseCategories;
    if (typeof courseCategory !== "string" || courseCategory.trim() === "") {
      errors.push("Course category is required and must be a non-empty string");
    }
    if (typeof courseSubCategory !== "string" || courseSubCategory.trim() === "") {
      errors.push("Course subcategory is required and must be a non-empty string");
    }
    if (typeof trendingScore !== "number" || !Number.isInteger(trendingScore) || trendingScore < 0) {
      errors.push("Trending score must be a non-negative integer");
    }
  }

  // Validate courseSEOAndMarketing
  if (!courseSEOAndMarketing || typeof courseSEOAndMarketing !== "object") {
    errors.push("Course SEO and marketing object is required");
  } else {
    const { seoMetaTitle, seoMetaDescription, promoVideoUrl, courseBannerUrl, tags } = courseSEOAndMarketing;
    if (seoMetaTitle && (typeof seoMetaTitle !== "string" || seoMetaTitle.trim().length > 60)) {
      errors.push("SEO meta title must be a string with at most 60 characters if provided");
    }
    if (seoMetaDescription && (typeof seoMetaDescription !== "string" || seoMetaDescription.trim().length > 160)) {
      errors.push("SEO meta description must be a string with at most 160 characters if provided");
    }
    if (!isValidUrl(promoVideoUrl)) {
      errors.push("Promo video URL must be a valid URL if provided");
    }
    if (!isValidUrl(courseBannerUrl)) {
      errors.push("Course banner URL must be a valid URL if provided");
    }
    if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t: any) => typeof t === "string" && t.trim() !== "")) {
      errors.push("Tags must be a non-empty array of non-empty strings");
    }
  }

  // Validate coursePricingAndOffers
  if (!coursePricingAndOffers || typeof coursePricingAndOffers !== "object") {
    errors.push("Course pricing and offers object is required");
  } else {
    const {
      currency,
      courseFeeStructure,
      paymentPlans,
      isCourseOnOffer,
      offerDetail,
    } = coursePricingAndOffers;

    if (!worldCurrencies.includes(currency)) {
      errors.push(`Currency must be one of: ${worldCurrencies.join(", ")}`);
    }
    if (typeof courseFeeStructure !== "number" || courseFeeStructure < 0) {
      errors.push("Course fee structure must be a non-negative number");
    }
    if (!Array.isArray(paymentPlans) || paymentPlans.length === 0) {
      errors.push("Payment plans must be a non-empty array");
    } else {
      paymentPlans.forEach((plan: any, index: number) => {
        if (!plan || typeof plan !== "object") {
          errors.push(`Payment plan at index ${index}: Must be an object`);
          return;
        }
        if (typeof plan.planName !== "string" || plan.planName.trim() === "") {
          errors.push(`Payment plan at index ${index}: Plan name must be a non-empty string`);
        }
        if (typeof plan.amount !== "number" || plan.amount < 0) {
          errors.push(`Payment plan at index ${index}: Amount must be a non-negative number`);
        }
        if (typeof plan.duration !== "string" || plan.duration.trim() === "") {
          errors.push(`Payment plan at index ${index}: Duration must be a non-empty string`);
        }
      });
    }
    if (typeof isCourseOnOffer !== "boolean") {
      errors.push("isCourseOnOffer must be a boolean");
    }
    if (isCourseOnOffer) {
      if (!offerDetail || typeof offerDetail !== "object") {
        errors.push("Offer detail object is required when course is on offer");
      } else {
        const {
          offerCode,
          offerDescription,
          offerSlogan,
          discountPercentage,
          offerValidity,
          offerSeatsAvailable,
        } = offerDetail;

        if (typeof offerCode !== "string" || offerCode.trim() === "") {
          errors.push("Offer code must be a non-empty string");
        }
        if (
          typeof offerDescription !== "string" ||
          offerDescription.trim() === "" ||
          offerDescription.length > 500
        ) {
          errors.push(
            "Offer description must be a non-empty string with at most 500 characters"
          );
        }
        if (
          offerSlogan &&
          (typeof offerSlogan !== "string" || offerSlogan.trim() === "")
        ) {
          errors.push("Offer slogan must be a non-empty string if provided");
        }
        if (
          typeof discountPercentage !== "number" ||
          discountPercentage < 0 ||
          discountPercentage > 100
        ) {
          errors.push("Discount percentage must be a number between 0 and 100");
        }
        if (!isValidDate(offerValidity)) {
          errors.push("Offer validity must be a valid date");
        }
        if (
          typeof offerSeatsAvailable !== "number" ||
          !Number.isInteger(offerSeatsAvailable) ||
          offerSeatsAvailable < 0
        ) {
          errors.push(
            "Offer seats available must be a non-negative integer"
          );
        }
      }
    }
  }

  // Validate courseAdditionalFeatures
  if (!courseAdditionalFeatures || typeof courseAdditionalFeatures !== "object") {
    errors.push("Course additional features object is required");
  } else {
    const {
      faqs,
      refundPolicy,
      targetAudience,
      availableLanguages,
      certificateTemplateUrl,
      materialsProvided,
      equipmentRequired,
      accessibilityFeatures,
      contactDetails,
      termsAndCondition,
    } = courseAdditionalFeatures;

    if (faqs && (!Array.isArray(faqs) || !faqs.every((faq: any) => typeof faq === "object" && typeof faq.question === "string" && faq.question.trim().length >= 5 && typeof faq.answer === "string" && faq.answer.trim().length >= 5))) {
      errors.push("FAQs must be an array of objects with question and answer strings of at least 5 characters each if provided");
    }

    if (!refundPolicy || typeof refundPolicy !== "object") {
      errors.push("Refund policy object is required");
    } else {
      if (typeof refundPolicy.isRefundable !== "boolean") {
        errors.push("Refund policy isRefundable must be a boolean");
      }
      if (typeof refundPolicy.refundPeriodDays !== "number" || refundPolicy.refundPeriodDays < 0) {
        errors.push("Refund period days must be a non-negative number");
      }
      if (refundPolicy.conditions && typeof refundPolicy.conditions !== "string") {
        errors.push("Refund conditions must be a string if provided");
      }
    }

    if (!Array.isArray(targetAudience) || targetAudience.length === 0 || !targetAudience.every((t: any) => typeof t === "string" && t.trim().length >= 3)) {
      errors.push("Target audience must be a non-empty array of strings with at least 3 characters each");
    }

    if (!Array.isArray(availableLanguages) || availableLanguages.length === 0 || !availableLanguages.every((l: any) => typeof l === "string" && l.trim() !== "")) {
      errors.push("Available languages must be a non-empty array of non-empty strings");
    }

    if (certificateTemplateUrl && !isValidUrl(certificateTemplateUrl)) {
      errors.push("Certificate template URL must be a valid URL if provided");
    }

    if (!Array.isArray(materialsProvided) || !materialsProvided.every((m: any) => typeof m === "string" && m.trim() !== "")) {
      errors.push("Materials provided must be an array of non-empty strings");
    }

    if (!Array.isArray(equipmentRequired) || !equipmentRequired.every((e: any) => typeof e === "string" && e.trim() !== "")) {
      errors.push("Equipment required must be an array of non-empty strings");
    }

    if (!Array.isArray(accessibilityFeatures) || !accessibilityFeatures.every((a: any) => typeof a === "string" && a.trim() !== "")) {
      errors.push("Accessibility features must be an array of non-empty strings");
    }

    if (!contactDetails || typeof contactDetails !== "object") {
      errors.push("Contact details object is required");
    } else {
      if (typeof contactDetails.email !== "string" || !isValidEmail(contactDetails.email)) {
        errors.push("Contact email must be a valid email address");
      }
      if (typeof contactDetails.phone !== "string" || !isValidPhone(contactDetails.phone)) {
        errors.push("Contact phone must be a valid phone number");
      }
    }

    if (typeof termsAndCondition !== "string" || termsAndCondition.trim() === "") {
      errors.push("Terms and conditions must be a non-empty string");
    }
  }

  return { isValid: errors.length === 0, errors };
}

// POST handler for creating an offline course with batches
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse request body
    const body = await req.json();

    // Validate OfflineCourse
    const courseValidation = validateOfflineCourse(body);
    if (!courseValidation.isValid) {
      return NextResponse.json(
        { error: "Validation Error", details: courseValidation.errors },
        { status: 400 }
      );
    }

    const {
      course,
      courseCategories,
      courseSEOAndMarketing,
      coursePricingAndOffers,
      courseAdditionalFeatures,
      batches,
    } = body;

    // Validate batches
    const batchValidations = batches.map((batch: any, index: number) =>
      validateBatch(batch, index)
    );
    const invalidBatches = batchValidations.filter((v: any) => !v.isValid);
    if (invalidBatches.length > 0) {
      const batchErrors = invalidBatches.flatMap((v: any) => v.errors);
      return NextResponse.json(
        { error: "Batch Validation Error", details: batchErrors },
        { status: 400 }
      );
    }

    await initializeDatabase();

    // Check for existing course
    const existingCourse = await OfflineCourse.findOne({
      "course.courseName": course.courseName,
    });
    if (existingCourse) {
      return NextResponse.json(
        { error: "A course with this name already exists" },
        { status: 400 }
      );
    }
    const batchInstructor = Profile.findById(
      batches[0].batchInstructor[0]
    )
    // Create batches and collect their IDs
    const courseInstructors = new Set<Types.ObjectId>();
    const batchIds = await Promise.all(
      batches.map(async (batch: any) => {
        // Collect unique instructor IDs
        batch.batchInstructors.forEach((instructor: any) => {
          if (isValidObjectId(instructor.id)) {
            courseInstructors.add(new Types.ObjectId(instructor.id));
          }
        });
        const newBatch = new Batch({
          batchName: batch.batchName,
          batchInstructors: batch.batchInstructors.map((i: any) => i.id),
          batchStartDate: batch.batchStartDate,
          maxStudentCount: batch.maxStudentCount,
          enrollmentStartDate: batch.enrollmentStartDate,
          enrollmentEndDate: batch.enrollmentEndDate,
          address: batch.address,
        });

        await newBatch.save();
        return newBatch._id;
      })
    );
    const courseSlug = generateSlug(course.courseName)
    const { courseName,
      courseGoals,
      courseLevel,
      courseDescription,
      courseDurationInDays,
      courseDailyClassDurationInMinutes,
      syllabusOutline } = course
    // Create new course
    const newCourse = new OfflineCourse({
      course: {
        courseName,
        courseGoals,
        courseLevel,
        courseDescription,
        courseDurationInDays,
        courseDailyClassDurationInMinutes,
        syllabusOutline,
        courseSlug
      },
      courseCategories,
      courseInstructors: Array.from(courseInstructors),
      batches: batchIds,
      courseSEOAndMarketing,
      coursePricingAndOffers,
      courseAdditionalFeatures,
    });


    const newCourseCard = new CourseCardComponent({
      courseId: newCourse._id,
      courseName: courseName,
      coursePrice: coursePricingAndOffers.courseFeeStructure,
      courseCategry: courseCategories.courseCategory,
      courseBannerUrl: courseSEOAndMarketing.courseBannerUrl,
      courseType: "Offline",
      courseLevel: courseLevel,
      courseInstructor: {
        avatar: batchInstructor.avatarUrl,
        fullName: batchInstructor.fullName,
      },
      isCourseOnOffer: coursePricingAndOffers.isCourseOnOffer,
      offerPercent: coursePricingAndOffers.offerDetail.discountPercentage
    })


    await newCourseCard.save()


    await newCourse.save();



    // Update batches with course ID
    await Promise.all(
      batchIds.map((batchId) =>
        Batch.findByIdAndUpdate(batchId, { courseId: newCourse._id })
      )
    );

    return NextResponse.json(
      { message: "Course created successfully", id: newCourse._id },
      { status: 201 }
    );
  } catch (error) {
    console.log(error)
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.message },
        { status: 400 }
      );
    }
    if (error instanceof DatabaseError) {
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 }
      );
    }
    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: "Database Error", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}