import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent startup failures when no key is specified
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured or is using the default placeholder. Please configure your API key in the secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------------------
// SEED DATA & IN-MEMORY DATABASE FOR DEMO PERSISTENCE
// -----------------------------------------------------------------------------

let tutors = [
  {
    id: "t1",
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@tutorhub.edu",
    role: "tutor",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "Stanford CS Professor & AI Architect",
    hourlyRate: 1500,
    category: "Computer Science",
    skills: ["Python", "Machine Learning", "System Design", "Algorithm Analysis"],
    rating: 4.9,
    reviewsCount: 142,
    kycStatus: "verified",
    subscriptionPlan: "Premium",
    isFeatured: true,
    bio: "Sarah is a university professor who loves making advanced computing accessible. Former research lead at OpenAI.",
    languages: ["English", "Spanish"],
    timezone: "America/Los_Angeles",
    currency: "INR"
  },
  {
    id: "t2",
    name: "Alexei Petrov",
    email: "alexei.p@tutorhub.edu",
    role: "tutor",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    title: "Senior Quantitative Trader & FinTech Coach",
    hourlyRate: 2500,
    category: "Finance & Mathematics",
    skills: ["Calculus", "Financial Modeling", "R", "Quantitative Portfolio Theory"],
    rating: 4.8,
    reviewsCount: 88,
    kycStatus: "verified",
    subscriptionPlan: "Pro",
    isFeatured: true,
    bio: "Alexei teaches statistics, dynamic calculus, and advanced mathematical finance with 12+ years of Wall Street industry experience.",
    languages: ["English", "Russian"],
    timezone: "Europe/London",
    currency: "INR"
  },
  {
    id: "t3",
    name: "Elena Rostova",
    email: "elena.r@tutorhub.edu",
    role: "tutor",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    title: "English Linguistics Master & IELTS Examiner",
    hourlyRate: 1000,
    category: "Languages",
    skills: ["IELTS Prep", "Business English", "Public Speaking", "Writing Style"],
    rating: 4.95,
    reviewsCount: 310,
    kycStatus: "verified",
    subscriptionPlan: "Premium",
    isFeatured: false,
    bio: "Elena specializes in English fluency and test preparation. She has guided over 500 students to secure 8+ scores on the IELTS exam.",
    languages: ["English", "French"],
    timezone: "Europe/Paris",
    currency: "INR"
  },
  {
    id: "t4",
    name: "Marcus Chen",
    email: "marcus.c@tutorhub.edu",
    role: "tutor",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    title: "Creative Director & UX/UI Mentor",
    hourlyRate: 1200,
    category: "Design",
    skills: ["Figma", "User Research", "Interaction Design", "Portfolio Review"],
    rating: 4.75,
    reviewsCount: 64,
    kycStatus: "verified",
    subscriptionPlan: "Free",
    isFeatured: false,
    bio: "A product design veteran passionate about crafting intuitive user journeys and preparing talent for FAANG level hiring design interviews.",
    languages: ["English", "Mandarin"],
    timezone: "Asia/Singapore",
    currency: "INR"
  }
];

let courses = [
  {
    id: "c1",
    title: "Complete Python Bootcamp: Zero to Hero in Machine Learning",
    instructorId: "t1",
    instructorName: "Dr. Sarah Jenkins",
    instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    description: "Master Python fundamentals, NumPy, Pandas, Scikit-learn, and neural network concepts through interactive assignments.",
    price: 4999,
    rating: 4.9,
    reviewsCount: 890,
    category: "Computer Science",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500",
    type: "recorded",
    enrolledStudentsCount: 312,
    lessons: [
      { id: "l1", title: "Introduction to Python and Dev Environment", duration: "12:15" },
      { id: "l2", title: "Variables, Loops, and Basic Logic Structures", duration: "18:40" },
      { id: "l3", title: "Advanced Functions and Lambda Calculus", duration: "22:10" },
      { id: "l4", title: "NumPy Arrays and Matrix Transpositions", duration: "15:35" },
      { id: "l5", title: "Pandas Dataframes for Data Cleansing", duration: "25:50" }
    ]
  },
  {
    id: "c2",
    title: "FinTech Portfolio Strategy & Advanced Derivatives Markets",
    instructorId: "t2",
    instructorName: "Alexei Petrov",
    instructorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    description: "Learn how to calculate options pricing using Black-Scholes, model market risks, and configure algorithms in live markets.",
    price: 9999,
    rating: 4.8,
    reviewsCount: 154,
    category: "Finance & Mathematics",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=500",
    type: "live",
    startDate: "2026-07-15T18:00:00Z",
    capacity: 25,
    enrolledStudentsCount: 14,
    lessons: [
      { id: "lc1", title: "Session 1: Derivative Securities Foundations (Live)", duration: "90:00" },
      { id: "lc2", title: "Session 2: Black-Scholes Equation Derivation (Live)", duration: "120:00" },
      { id: "lc3", title: "Session 3: Hedging with Options & Futures (Live)", duration: "90:00" }
    ]
  }
];

let bookings = [
  {
    id: "b_init_1",
    studentId: "student_default",
    studentName: "John Doe",
    tutorId: "t1",
    tutorName: "Dr. Sarah Jenkins",
    tutorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    tutorTitle: "Stanford CS Professor & AI Architect",
    dateTime: "2026-06-30T14:00:00-07:00",
    timezone: "America/Los_Angeles",
    durationMinutes: 60,
    price: 1500,
    status: "confirmed",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "I want to discuss my custom resume project regarding machine learning algorithms."
  }
];

let corporateRequests = [
  {
    id: "corp_1",
    companyName: "Acme Analytics Corp",
    domain: "acme-analytics.com",
    employeesCount: 250,
    purchasedCredits: 1000,
    status: "approved"
  }
];

let blogPosts = [
  {
    id: "p1",
    title: "The Shift to AI-Assisted Learning: How Students Stay Ahead",
    excerpt: "Discover the tactical approaches successful students employ when pairing AI models with high-touch personal tutoring.",
    author: "TutorHub Academy Team",
    date: "2026-06-25",
    category: "E-Learning Strategy",
    likes: 42,
    commentsCount: 7
  },
  {
    id: "p2",
    title: "Cracking the IELTS Exam: Elena's Top 5 Grammar Invariants",
    excerpt: "Avoid standard pitfalls. Learn the structural and style secrets that can raise your test score above a 7.5 instantly.",
    author: "Elena Rostova",
    date: "2026-06-22",
    category: "Languages",
    likes: 85,
    commentsCount: 18
  }
];

let studentWallet = {
  balance: 15000,
  points: 120,
  referralCode: "LEARN_FREE_88"
};

// -----------------------------------------------------------------------------
// REST API ENDPOINTS
// -----------------------------------------------------------------------------

// Global Platform commission variable (managed by admin)
let platformCommissionPercent = 15;

app.get("/api/tutors", (req, res) => {
  res.json(tutors);
});

app.post("/api/tutors/onboard", (req, res) => {
  const { name, email, title, category, hourlyRate, skills, bio } = req.body;
  if (!name || !email || !title || !category || !hourlyRate) {
    return res.status(400).json({ error: "Missing required onboarding fields." });
  }

  const newTutor = {
    id: "t_" + Date.now(),
    name,
    email,
    role: "tutor",
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`, // Random generic avatar
    title,
    hourlyRate: Number(hourlyRate),
    category,
    skills: skills ? skills.split(",").map((s: string) => s.trim()) : [],
    rating: 5.0,
    reviewsCount: 0,
    kycStatus: "pending" as const,
    subscriptionPlan: "Free" as const,
    isFeatured: false,
    bio,
    languages: ["English"],
    timezone: "UTC",
    currency: "INR"
  };

  tutors.push(newTutor);
  res.json({ success: true, tutor: newTutor });
});

// Admin approves KYC
app.post("/api/admin/kyc/verify", (req, res) => {
  const { tutorId, status } = req.body;
  const tutor = tutors.find(t => t.id === tutorId);
  if (!tutor) return res.status(404).json({ error: "Tutor not found" });

  tutor.kycStatus = status; // "verified", "unverified" or "pending"
  res.json({ success: true, tutor });
});

// Admin commission updates
app.get("/api/admin/commission", (req, res) => {
  res.json({ platformCommissionPercent });
});

app.post("/api/admin/commission/update", (req, res) => {
  const { percent } = req.body;
  if (percent !== undefined && percent >= 0 && percent <= 100) {
    platformCommissionPercent = Number(percent);
    return res.json({ success: true, platformCommissionPercent });
  }
  res.status(400).json({ error: "Invalid commission percent range." });
});

// Corporate Training onboarding
app.post("/api/corporate/onboard", (req, res) => {
  const { companyName, domain, employeesCount } = req.body;
  if (!companyName || !domain) {
    return res.status(400).json({ error: "Missing corporate registration details" });
  }

  const newClient = {
    id: "corp_" + Date.now(),
    companyName,
    domain,
    employeesCount: Number(employeesCount) || 10,
    purchasedCredits: 500,
    status: "pending" as const
  };

  corporateRequests.push(newClient);
  res.json({ success: true, client: newClient });
});

app.get("/api/corporate/requests", (req, res) => {
  res.json(corporateRequests);
});

// Student Wallet Info
app.get("/api/student/wallet", (req, res) => {
  res.json(studentWallet);
});

app.post("/api/student/wallet/deposit", (req, res) => {
  const { amount, method } = req.body; // mock stripe/paypal credit card checkout
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Amount must be greater than 0" });
  }
  studentWallet.balance += Number(amount);
  res.json({ success: true, balance: studentWallet.balance, msg: `Successfully deposited using ${method || "Stripe"}` });
});

// Courses API
app.get("/api/courses", (req, res) => {
  res.json(courses);
});

app.post("/api/courses", (req, res) => {
  const { title, instructorId, description, price, category, image, type } = req.body;
  if (!title || !instructorId || !price || !category) {
    return res.status(400).json({ error: "Missing essential course attributes." });
  }

  const tutor = tutors.find(t => t.id === instructorId);
  const instructorName = tutor ? tutor.name : "Expert Instructor";
  const instructorAvatar = tutor ? tutor.avatarUrl : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

  const newCourse = {
    id: "c_" + Date.now(),
    title,
    instructorId,
    instructorName,
    instructorAvatar,
    description: description || "Explore comprehensive academic elements and applications.",
    price: Number(price),
    rating: 5.0,
    reviewsCount: 0,
    category,
    image: image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500",
    type: type || "recorded",
    enrolledStudentsCount: 0,
    lessons: [
      { id: "m1", title: "Course Introduction & Syllabus Overview", duration: "05:00" },
      { id: "m2", title: "Fundamental Terms and Key Concept Scaffolding", duration: "14:30" }
    ]
  };

  courses.push(newCourse);
  res.json({ success: true, course: newCourse });
});

// Bookings
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

app.post("/api/bookings", (req, res) => {
  const { studentId, studentName, tutorId, dateTime, timezone, durationMinutes, price, notes } = req.body;
  if (!tutorId || !dateTime || !price) {
    return res.status(400).json({ error: "Missing essential booking variables." });
  }

  // Deduct from wallet balance
  if (studentWallet.balance < price) {
    return res.status(400).json({ error: "Insufficient wallet balance. Please load funds first." });
  }

  const tutor = tutors.find(t => t.id === tutorId);
  if (!tutor) return res.status(404).json({ error: "Tutor not found" });

  studentWallet.balance -= Number(price);
  studentWallet.points += Math.floor(Number(price) * 0.1); // Earn points

  const newBooking = {
    id: "b_" + Date.now(),
    studentId: studentId || "student_default",
    studentName: studentName || "John Doe",
    tutorId,
    tutorName: tutor.name,
    tutorAvatar: tutor.avatarUrl,
    tutorTitle: tutor.title || "TutorHub Professional Advisor",
    dateTime,
    timezone: timezone || "America/Los_Angeles",
    durationMinutes: Number(durationMinutes) || 60,
    price: Number(price),
    status: "confirmed" as const,
    meetingLink: `https://meet.google.com/tutor-${tutorId.toLowerCase()}-${Math.floor(Math.random() * 900 + 100)}`,
    notes: notes || ""
  };

  bookings.push(newBooking);
  res.json({ success: true, booking: newBooking, remainingWalletBalance: studentWallet.balance });
});

// Blog/Forums API
app.get("/api/blog", (req, res) => {
  res.json(blogPosts);
});

app.post("/api/blog", (req, res) => {
  const { title, excerpt, author, category } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: "Title and author required" });
  }
  const newPost = {
    id: "p_" + Date.now(),
    title,
    excerpt: excerpt || "A new contribution to the TutorHub community forums.",
    author,
    date: new Date().toISOString().split("T")[0],
    category: category || "General Education",
    likes: 0,
    commentsCount: 0
  };
  blogPosts.unshift(newPost);
  res.json({ success: true, post: newPost });
});

// -----------------------------------------------------------------------------
// SERVER-SIDE GEMINI API INTEGRATIONS
// -----------------------------------------------------------------------------

// AI Outline Generator
app.post("/api/gemini/course-outline", async (req, res) => {
  const { topic, audience, level } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required to generate a course outline." });
  }

  try {
    const ai = getAIClient();
    const prompt = `Generate a comprehensive academic course outline syllabus.
    Topic: "${topic}"
    Target Audience: "${audience || "General Learners"}"
    Experience Level: "${level || "Beginner"}"
    Please output JSON adhering to the specified schema containing structural modules, description, summary, and module names. Do not include markdown codeblocks or outer headers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  moduleName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  lessons: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json(parsedData);
  } catch (error) {
    console.error("Gemini Outline Generator Error: ", error);
    // Fallback content in case key is missing or quota exceeded
    res.json({
      title: `Curriculum: Mastering ${topic}`,
      summary: `A personalized learning path curated for ${level || "Beginner"} level enthusiasts, preparing you with structural real-world foundations.`,
      modules: [
        {
          moduleName: "Core Foundations & Introduction",
          description: "Grasp essential vocabularies and critical frameworks.",
          lessons: ["Lesson 1.1: Setting up tools", "Lesson 1.2: Essential terms", "Lesson 1.3: Real-world scope"]
        },
        {
          moduleName: "Practical Implementation & Intermediate Case Studies",
          description: "Step-by-step applications of concepts.",
          lessons: ["Lesson 2.1: Case studies", "Lesson 2.2: Practical workshop"]
        }
      ],
      fallback: true,
      errorInfo: error instanceof Error ? error.message : "Service momentarily unavailable"
    });
  }
});

// AI Quiz Generator
app.post("/api/gemini/quiz", async (req, res) => {
  const { topic, numberOfQuestions } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required to generate a quiz." });
  }

  try {
    const ai = getAIClient();
    const count = numberOfQuestions || 3;
    const prompt = `Generate a multiple choice quiz of exactly ${count} questions for: "${topic}".
    Output a valid JSON array of questions, each having standard option keys, correctOptionIndex (0-3), and detailed explanatory insights.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctOptionIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "[]");
    res.json(parsedData);
  } catch (error) {
    console.error("Gemini Quiz Generator Error: ", error);
    // Fallback questions
    res.json([
      {
        id: "f_q1",
        question: `Which of the following represents a primary core foundation regarding "${topic}"?`,
        options: [
          "Introductory terminology & basic variables",
          "Unrelated secondary operations",
          "Manual legacy overrides",
          "None of the above"
        ],
        correctOptionIndex: 0,
        explanation: "Comprehensive scoping demonstrates that starting with clear introductory terminology simplifies advanced development."
      },
      {
        id: "f_q2",
        question: `How does standard integration of ${topic} improve learning speed?`,
        options: [
          "By utilizing active feedback loops and direct testing",
          "By avoiding documentation",
          "By delaying assessment intervals",
          "By skipping core concepts"
        ],
        correctOptionIndex: 0,
        explanation: "Active feedback loops reinforce conceptual retention and maximize long-term skill acquisition."
      }
    ]);
  }
});

// AI Study Assistant Chatbot
app.post("/api/gemini/study-assistant", async (req, res) => {
  const { messages, currentCourse } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Valid chat messages format required." });
  }

  try {
    const ai = getAIClient();
    // Convert conversational chat thread to structural parts
    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: `You are 'TutorHub AI Study Companion', an advanced, extremely encouraging, patient, and highly competent educational tutor.
        Help students master concepts related to the current course: "${currentCourse || "General Subjects"}".
        Keep answers clear, well-structured (use bullet points and markdown if helpful), and ask checking questions to test their comprehension at the end of responses. Keep responses under 200 words.`
      }
    });

    // Send the last user message
    const lastUserMessage = messages[messages.length - 1]?.text || "Hello! Teach me something new.";
    const response = await chat.sendMessage({ message: lastUserMessage });
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini Study Companion Error: ", error);
    res.json({
      text: "I'm your TutorHub AI Study Assistant. To fully activate my live capabilities, please ensure your GEMINI_API_KEY is configured in the AI Studio platform Secrets menu. In the meantime, feel free to review the course lessons or try our interactive practice quiz!",
      errorInfo: error instanceof Error ? error.message : "Offline mode active"
    });
  }
});

// AI Tutor Recommendation Engine
app.post("/api/gemini/recommendations", async (req, res) => {
  const { studentGoal, preferredCategory, maxBudget } = req.body;
  if (!studentGoal) {
    return res.status(400).json({ error: "Goal or requirements details are required." });
  }

  try {
    const ai = getAIClient();
    const tutorsDataString = JSON.stringify(tutors.map(t => ({ id: t.id, name: t.name, title: t.title, rate: t.hourlyRate, skills: t.skills, cat: t.category })));
    const prompt = `You are a dynamic matchmaking recommendation algorithms. Recommend the best tutors from the database for a student with this goal:
    Goal: "${studentGoal}"
    Preferred Category: "${preferredCategory || "Any"}"
    Max Hourly Budget: "${maxBudget ? maxBudget + " INR" : "No Limit"}"
    
    Database Tutors available:
    ${tutorsDataString}
    
    Output a valid JSON array of recommendations.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tutorId: { type: Type.STRING },
              tutorName: { type: Type.STRING },
              matchingScore: { type: Type.INTEGER },
              matchReason: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "[]");
    res.json(parsedData);
  } catch (error) {
    console.error("Gemini Recommendation Engine Error: ", error);
    // Simple rule-based recommendations fallback
    const matched = tutors.map(t => {
      let score = 75;
      if (preferredCategory && t.category.toLowerCase().includes(preferredCategory.toLowerCase())) {
        score += 20;
      }
      if (maxBudget && t.hourlyRate <= Number(maxBudget)) {
        score += 5;
      }
      return {
        tutorId: t.id,
        tutorName: t.name,
        matchingScore: Math.min(score, 98),
        matchReason: `Selected because of expertise in ${t.category} and compatibility with your learning timeline.`
      };
    });
    res.json(matched);
  }
});


// -----------------------------------------------------------------------------
// VITE DEV MIDDLEWARE AND STATIC PRODUCTION HOSTING
// -----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TutorHub full-stack server listening on http://localhost:${PORT}`);
  });
}

startServer();
