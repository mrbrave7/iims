import mongoose from 'mongoose';
import dbConnect from './connectDb';

// Importing all models to ensure they're registered with Mongoose
import Admin from '@/models/admin.model';
import Assignment from '@/models/assignment.model';
import Submission from '@/models/assgmt.submission';
import Batch from '@/models/batch.model';
import Certification from '@/models/certification.model';
import Module from '@/models/course.module.model';
import Enrollment from '@/models/enrollment.model';
import OfflineCourse from '@/models/offline.courses.model';
import FreeCourse from '@/models/free.course.mode';
import OnlineCourse from '@/models/online.course.model';
import Experience from '@/models/experience.model';
import Offer from '@/models/offer.model';
import Payment from '@/models/payment.model';
import Profile from '@/models/profile.model';
import Student from '@/models/student.model';
import StudentsEducation from '@/models/student.qualifications.model';

export async function initializeDatabase() {
  try {
    await dbConnect();
    // Log registered model names using the imported mongoose instance
    console.log('✅ Models registered:', Object.keys(mongoose.models));
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err; // Rethrow to ensure route handler knows about the failure
  }
}