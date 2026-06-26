export type UserRole = "student" | "tutor" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  createdAt?: string;
  bio?: string;
  timezone?: string;
  currency?: string;
  languages?: string[];
  // Student fields
  enrolledCourses?: string[];
  completedCourses?: string[];
  walletBalance?: number;
  referralCode?: string;
  points?: number;
  // Tutor fields
  title?: string;
  hourlyRate?: number;
  category?: string;
  skills?: string[];
  rating?: number;
  reviewsCount?: number;
  kycStatus?: "unverified" | "pending" | "verified";
  subscriptionPlan?: "Free" | "Pro" | "Premium";
  isFeatured?: boolean;
}

export interface Review {
  id: string;
  studentName: string;
  studentAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string; // e.g., "12:45"
  videoUrl?: string; // Mock or public video
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructorId: string;
  instructorName: string;
  instructorAvatar: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: string;
  image: string;
  type: "recorded" | "live";
  lessons: Lesson[];
  quizzes?: QuizQuestion[];
  isSponsored?: boolean;
  startDate?: string; // For live courses
  capacity?: number; // For live courses
  enrolledStudentsCount: number;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar: string;
  tutorTitle: string;
  dateTime: string; // ISO string
  timezone: string;
  durationMinutes: number;
  price: number;
  status: "pending" | "confirmed" | "completed" | "canceled";
  meetingLink?: string;
  notes?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  likes: number;
  commentsCount: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantRole: UserRole;
  messages: Message[];
}

export interface Certificate {
  id: string;
  studentName: string;
  courseTitle: string;
  issueDate: string;
  instructorName: string;
  verificationUrl: string;
  qrCodeData: string; // Verification token or payload
}

export interface CorporateClient {
  id: string;
  companyName: string;
  domain: string;
  employeesCount: number;
  purchasedCredits: number;
  status: "pending" | "approved";
}
