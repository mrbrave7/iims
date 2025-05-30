import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import validator from 'validator';
import OnlineCourse, { CourseStatus } from '@/models/online.course.model';
import Module from '@/models/course.module.model';
import { BasicInfoDetails } from '@/app/courses/create-online-course/page';
import { initializeDatabase } from '@/lib/initDb';
import CourseCardComponent from '@/models/course.card.model';
import Profile from '@/models/profile.model';

// Interface for module input (aligned with Module schema)
interface ModuleDetails {
  moduleTitle: string;
  moduleDescription?: string;
  moduleDurationInDays: number;
  moduleVideoUrl?: string;
  notes?: string[];
  articleLinks?: string[];
  moduleBannerUrl?: string;
  learningObjectives?: string[];
  order: number;
}

// Interface for offer details (aligned with client-side OfferDetails)
interface OfferDetails {
  offerCode: string;
  offerDescription: string;
  offerSlogan: string;
  discountPercentage: number;
  offerValidity: string | Date;
  offerSeatsAvailable: number;
}

const worldCurrencies = [
  "USD", "EUR", "JPY", "GBP", "AUD", "CAD", "CHF", "CNY", "INR", "NPR", "NZD",
  "SGD", "HKD", "KRW", "ZAR", "BRL", "MXN", "RUB", "SEK", "NOK", "DKK", "AED",
  "ARS", "CLP", "EGP", "ILS", "MYR", "PHP", "SAR", "THB", "TRY",
]


// Validation functions
const validateBasicInfo = (basicInfo: BasicInfoDetails): { error?: string; status?: number } => {
  const courseLevels = ['Beginner', 'Intermediate', 'Advanced'];
  const {
    courseName,
    courseGoals,
    courseLevel,
    courseDescription,
    syllabusOutline,
    courseDurationInHours,
    courseCategory,
    courseSubCategory,
    preRequisites,
    courseBannerUrl,
  } = basicInfo;

  if (!courseName || courseName.trim() === '') {
    return { error: 'Please Provide Course Name', status: 400 };
  }

  if (!courseGoals || courseGoals.length < 1 || courseGoals.some((goal) => !goal || goal.trim() === '')) {
    return { error: 'Please Provide At Least One Valid Course Goal', status: 400 };
  }

  if (!courseLevel || !courseLevels.includes(courseLevel)) {
    return { error: 'Please Provide Valid Course Level', status: 400 };
  }

  if (!courseDescription || courseDescription.trim() === '' || courseDescription.length < 200) {
    return { error: 'Please Provide Valid Course Description (minimum 200 characters)', status: 400 };
  }

  if (!syllabusOutline || syllabusOutline.length < 1 || syllabusOutline.some((outline) => !outline || outline.trim() === '')) {
    return { error: 'Please Provide At Least One Valid Syllabus Outline', status: 400 };
  }

  if (!courseDurationInHours || courseDurationInHours < 2) {
    return { error: 'Course Duration Must Be At Least 2 Hours', status: 400 };
  }

  if (!courseCategory || courseCategory.trim() === '') {
    return { error: 'Please Provide A Course Category', status: 400 };
  }

  if (!courseSubCategory || courseSubCategory.trim() === '') {
    return { error: 'Please Provide A Course Sub Category', status: 400 };
  }

  if (!preRequisites || preRequisites.length < 1 || preRequisites.some((req) => !req || req.trim() === '')) {
    return { error: 'Please Provide At Least One Valid Course Prerequisite', status: 400 };
  }

  if (!courseBannerUrl || !validator.isURL(courseBannerUrl, { protocols: ['http', 'https'], require_protocol: true })) {
    return { error: 'Please Provide A Valid Course Banner URL', status: 400 };
  }

  return {};
};

const validatePricingAndOffers = (pricingAndOffers: any): { error?: string; status?: number } => {
  const {
    currency,
    basePrice,
    isCourseOnOffer,
    offerDetails,
    paymentPlans,
    termsAndConditions,
    courseValidityInMonths,
  } = pricingAndOffers;
  console.log(worldCurrencies)
  // Validate currency
  if (!currency || !worldCurrencies.includes(currency)) {
    return { error: 'Please Select A Valid Currency', status: 400 };
  }

  // Validate base price
  if (!basePrice || basePrice < 20) {
    return { error: 'Base Price Must Be At Least $20', status: 400 };
  }

  // Validate offer details if course is on offer
  if (isCourseOnOffer) {
    if (!offerDetails || !Array.isArray(offerDetails) || offerDetails.length === 0) {
      return { error: 'At Least One Offer Detail Is Required When Course Is On Offer', status: 400 };
    }

    for (const [index, offer] of offerDetails.entries()) {
      const {
        offerCode,
        offerDescription,
        offerSlogan,
        discountPercentage,
        offerValidity,
        offerSeatsAvailable,
      } = offer as OfferDetails;

      if (!offerCode || offerCode.trim() === '') {
        return { error: `Offer Code Is Required At Index ${index}`, status: 400 };
      }

      if (!offerDescription || offerDescription.trim() === '') {
        return { error: `Offer Description Is Required At Index ${index}`, status: 400 };
      }

      if (!offerSlogan || offerSlogan.trim() === '') {
        return { error: `Offer Slogan Is Required At Index ${index}`, status: 400 };
      }

      if (
        discountPercentage == null ||
        discountPercentage < 0 ||
        discountPercentage > 100
      ) {
        return { error: `Discount Percentage Must Be Between 0 and 100 At Index ${index}`, status: 400 };
      }

      if (!offerValidity || new Date(offerValidity) <= new Date()) {
        return { error: `Offer Validity Must Be A Future Date At Index ${index}`, status: 400 };
      }

      if (offerSeatsAvailable == null || offerSeatsAvailable < 0) {
        return { error: `Offer Seats Available Must Be Non-Negative At Index ${index}`, status: 400 };
      }
    }
  } else if (offerDetails && offerDetails.length > 0) {
    return { error: 'Offer Details Should Be Empty If Course Is Not On Offer', status: 400 };
  }

  // Validate payment plans
  if (paymentPlans && paymentPlans.length > 0) {
    for (const [index, plan] of paymentPlans.entries()) {
      const { planName, planAmount, durationInMonths } = plan;
      if (
        !planName ||
        planName.trim() === '' ||
        !planAmount ||
        planAmount < 0 ||
        !durationInMonths ||
        durationInMonths < 0
      ) {
        return { error: `Invalid Payment Plan At Index ${index}`, status: 400 };
      }
    }
  }

  // Validate terms and conditions
  if (!termsAndConditions || termsAndConditions.trim() === '' || termsAndConditions.length < 200) {
    return { error: 'Please Provide Valid Terms and Conditions (minimum 200 characters)', status: 400 };
  }

  // Validate course validity
  if (!courseValidityInMonths || courseValidityInMonths < 0) {
    return { error: 'Please Provide Valid Course Validity In Months', status: 400 };
  }

  return {};
};

const validateSeoAndMarketing = (seoAndMarketing: any): { error?: string; status?: number } => {
  const { seoMetaTitle, seoMetaDescription, tags, promoVideoUrl } = seoAndMarketing;

  if (!seoMetaTitle || seoMetaTitle.trim() === '') {
    return { error: 'Please Provide A Valid Meta Title', status: 400 };
  }

  if (!seoMetaDescription || seoMetaDescription.trim() === '') {
    return { error: 'Please Provide A Valid Meta Description', status: 400 };
  }

  if (!tags || tags.length < 1 || tags.some((tag: string) => !tag || tag.trim() === '')) {
    return { error: 'Please Provide At Least One Valid Tag', status: 400 };
  }

  if (promoVideoUrl && !validator.isURL(promoVideoUrl, { protocols: ['http', 'https'], require_protocol: true })) {
    return { error: 'Please Provide A Valid Promo Video URL', status: 400 };
  }

  return {};
};

const validateAdditionalFeatures = (additionalFeatures: any): { error?: string; status?: number } => {
  const { faqs, refundPolicy, targetAudience, availableLanguages, certificateTemplateUrl, contactDetails } = additionalFeatures;

  if (!faqs || faqs.length < 1 || faqs.some((faq: any) => !faq.question || !faq.answer || faq.question.trim() === '' || faq.answer.trim() === '')) {
    return { error: 'Please Provide At Least One Valid FAQ', status: 400 };
  }

  const { isRefundable, refundPeriodDays, conditions } = refundPolicy;
  if (isRefundable && (!refundPeriodDays || refundPeriodDays < 0 || !conditions || conditions.trim() === '')) {
    return { error: 'Please Provide Valid Refund Policy Details', status: 400 };
  }

  if (!availableLanguages || availableLanguages.length < 1 || availableLanguages.some((lang: string) => !lang || lang.trim() === '')) {
    return { error: 'Please Provide At Least One Valid Language', status: 400 };
  }

  if (
    !certificateTemplateUrl ||
    !validator.isURL(certificateTemplateUrl, { protocols: ['http', 'https'], require_protocol: true })
  ) {
    return { error: 'Please Provide A Valid Certificate Template URL', status: 400 };
  }

  if (
    !targetAudience ||
    targetAudience.length < 1 ||
    targetAudience.some((audience: string) => !audience || audience.trim() === '')
  ) {
    return { error: 'Please Provide At Least One Valid Target Audience', status: 400 };
  }

  if (
    !contactDetails ||
    !contactDetails.email ||
    !validator.isEmail(contactDetails.email) ||
    !contactDetails.phone ||
    !validator.isMobilePhone(contactDetails.phone, 'any')
  ) {
    return { error: 'Please Provide Valid Contact Details', status: 400 };
  }

  return {};
};

const validateModules = (modules: ModuleDetails[]): { error?: string; status?: number } => {
  if (!modules || modules.length < 1) {
    return { error: 'Please Provide At Least One Valid Module', status: 400 };
  }

  for (const [index, module] of modules.entries()) {
    const {
      moduleTitle,
      moduleDescription,
      moduleDurationInDays,
      moduleVideoUrl,
      notes,
      articleLinks,
      moduleBannerUrl,
      learningObjectives,
      order,
    } = module;

    if (!moduleTitle || moduleTitle.trim() === '') {
      return { error: `Invalid Module Title At Index ${index}`, status: 400 };
    }

    if (moduleDescription && moduleDescription.trim() === '') {
      return { error: `Invalid Module Description At Index ${index}`, status: 400 };
    }

    if (!moduleDurationInDays || moduleDurationInDays < 1) {
      return { error: `Module Duration Must Be At Least 1 Day At Index ${index}`, status: 400 };
    }

    if (moduleVideoUrl && !validator.isURL(moduleVideoUrl, { protocols: ['http', 'https'], require_protocol: true })) {
      return { error: `Invalid Module Video URL At Index ${index}`, status: 400 };
    }

    if (notes && notes.some((note) => note && !/^(https?:\/\/)/.test(note))) {
      return { error: `Invalid Note URL At Index ${index}`, status: 400 };
    }

    if (articleLinks && articleLinks.some((link) => link && !/^(https?:\/\/)/.test(link))) {
      return { error: `Invalid Article Link At Index ${index}`, status: 400 };
    }

    if (moduleBannerUrl && !validator.isURL(moduleBannerUrl, { protocols: ['http', 'https'], require_protocol: true })) {
      return { error: `Invalid Module Banner URL At Index ${index}`, status: 400 };
    }

    if (learningObjectives && learningObjectives.some((obj) => !obj || obj.trim() === '')) {
      return { error: `Invalid Learning Objectives At Index ${index}`, status: 400 };
    }

    if (order == null || order < 0) {
      return { error: `Invalid Module Order At Index ${index}`, status: 400 };
    }
  }

  return {};
};

// Main controller
export async function POST(req: NextRequest): Promise<NextResponse> {
  await initializeDatabase();
  // return NextResponse.json({ message: "hello" })
  try {
    // Parse request body
    const { basicInfo, pricingAndOffers, seoAndMarketing, additionalFeatures, modules, instructorId } = await req.json();

    // Run validations
    let validationResult = validateBasicInfo(basicInfo as BasicInfoDetails);
    if (validationResult.error) {
      return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    validationResult = validatePricingAndOffers(pricingAndOffers);
    if (validationResult.error) {
      return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    validationResult = validateSeoAndMarketing(seoAndMarketing);
    if (validationResult.error) {
      return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    validationResult = validateAdditionalFeatures(additionalFeatures);
    if (validationResult.error) {
      return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    validationResult = validateModules(modules);
    if (validationResult.error) {
      return NextResponse.json({ error: validationResult.error }, { status: validationResult.status });
    }

    // Check for existing course
    const existingCourse = await OnlineCourse.findOne({
      'basicInfo.courseName': basicInfo.courseName,
      deletedAt: null,
    });

    if (existingCourse) {
      return NextResponse.json({ error: 'Course with this name already exists' }, { status: 400 });
    }

    // Generate course slug
    const generateSlug = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
    };

    const courseSlug = generateSlug(basicInfo.courseName);

    // Create modules
    const moduleIds: Types.ObjectId[] = [];
    for (const module of modules) {
      const newModule = new Module({
        moduleTitle: module.moduleTitle,
        moduleDescription: module.moduleDescription || '',
        moduleDurationInDays: module.moduleDurationInDays,
        moduleVideoUrl: module.moduleVideoUrl || '',
        notes: module.notes || [],
        articleLinks: module.articleLinks || [],
        moduleBannerUrl: module.moduleBannerUrl || '',
        isCompleted: false,
        isContentPublished: false,
        learningObjectives: module.learningObjectives || [],
        moduleAssignments: [],
        order: module.order,
      });

      await newModule.save();
      moduleIds.push(newModule._id);
    }

    const courseInstructor = await Profile.findById(instructorId)

    // Create new course
    const newCourse = new OnlineCourse({
      basicInfo: {
        courseName: basicInfo.courseName,
        courseSlug,
        courseGoals: basicInfo.courseGoals,
        courseLevel: basicInfo.courseLevel,
        syllabusOutline: basicInfo.syllabusOutline,
        courseDescription: basicInfo.courseDescription,
        courseDurationInHours: basicInfo.courseDurationInHours,
        courseCategories: [basicInfo.courseCategory],
        courseSubCategories: [basicInfo.courseSubCategory],
        preRequisites: basicInfo.preRequisites,
        courseBannerUrl: basicInfo.courseBannerUrl,
        trendingScore: 0,
        lastTrendingUpdate: null,
      },
      courseInstructor: instructorId, // Use user ID from req.user
      courseModules: moduleIds,
      pricingAndOffers: {
        currency: pricingAndOffers.currency,
        basePrice: pricingAndOffers.basePrice,
        isCourseOnOffer: pricingAndOffers.isCourseOnOffer,
        offerDetails: pricingAndOffers.isCourseOnOffer ? pricingAndOffers.offerDetails : [],
        paymentPlans: pricingAndOffers.paymentPlans || [],
        termsAndConditions: pricingAndOffers.termsAndConditions,
        courseValidityInMonths: pricingAndOffers.courseValidityInMonths,
      },
      additionalInformation: {
        faqs: additionalFeatures.faqs,
        refundPolicy: {
          isRefundable: additionalFeatures.refundPolicy.isRefundable,
          refundPeriodDays: additionalFeatures.refundPolicy.isRefundable ? additionalFeatures.refundPolicy.refundPeriodDays : 0,
          conditions: additionalFeatures.refundPolicy.isRefundable ? additionalFeatures.refundPolicy.conditions : '',
        },
        targetAudience: additionalFeatures.targetAudience,
        availableLanguages: additionalFeatures.availableLanguages,
        rating: {
          courseSlug,
          average: 0,
          count: 0,
          lastUpdated: new Date(),
        },
        reviews: [],
        enrollments: [],
        discussionGroups: [],
        certificateTemplateUrl: additionalFeatures.certificateTemplateUrl,
        contactDetails: additionalFeatures.contactDetails,
      },
      seoMarketing: {
        seoMetaTitle: seoAndMarketing.seoMetaTitle,
        seoMetaDescription: seoAndMarketing.seoMetaDescription,
        tags: seoAndMarketing.tags,
        promoVideoUrl: seoAndMarketing.promoVideoUrl,
        seoKeywords: seoAndMarketing.tags, // Using tags as initial keywords
      },
      status: CourseStatus.Draft,
    });


    const courseCard = new CourseCardComponent({
      courseId:newCourse._id,
      courseName:basicInfo.courseName,
      coursePrice:pricingAndOffers.basePrice,
      courseCategry:basicInfo.courseCategory,
      courseBannerUrl:basicInfo.courseBannerUrl,
      courseType:"Online",
      courseLevel:basicInfo.courseLevel,
      courseInstructor:{
        fullName:courseInstructor?.fullName,
        avatar:courseInstructor?.avatarUrl
      },
      isCourseOnOffer:pricingAndOffers.isCourseOnOffer,
      offerPercent:pricingAndOffers.offerDetails.discountPercentage
    })

await courseCard.save()
    // Save course to database
    await newCourse.save();

    return NextResponse.json(
      { message: 'Course created successfully', courseId: newCourse._id, moduleIds },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}