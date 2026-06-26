import React, { useState, useEffect } from "react";
import { Sparkles, Calendar, BookOpen, User, Wallet, ShieldCheck, Building, MessageSquare, Globe, ArrowRight, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { UserProfile, Course, Booking, BlogPost, CorporateClient } from "./types";
import TutorDiscovery from "./components/TutorDiscovery";
import CourseCatalog from "./components/CourseCatalog";
import Dashboard from "./components/Dashboard";
import AiStudyAssistant from "./components/AiStudyAssistant";
import CorporatePanel from "./components/CorporatePanel";
import CommunityForum from "./components/CommunityForum";
import AdminConsole from "./components/AdminConsole";

export default function App() {
  const [activeTab, setActiveTab] = useState<"discover" | "courses" | "dashboard" | "ai-study" | "corporate" | "community" | "admin">("discover");
  
  // Interactive switching role
  const [currentRole, setCurrentRole] = useState<"student" | "tutor" | "admin">("student");

  // Global In-Memory Database States
  const [tutors, setTutors] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [corporateRequests, setCorporateRequests] = useState<CorporateClient[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  const [wallet, setWallet] = useState({
    balance: 15000,
    points: 120,
    referralCode: "LEARN_FREE_88"
  });

  // Booking Modal States
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState<UserProfile | null>(null);
  const [bookingDate, setBookingDate] = useState("2026-06-30");
  const [bookingTime, setBookingTime] = useState("14:00");
  const [bookingTimezone, setBookingTimezone] = useState("America/Los_Angeles");
  const [bookingDuration, setBookingDuration] = useState(60);
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState("");

  // Demo user data
  const studentUser: UserProfile = {
    id: "student_default",
    name: "John Doe",
    email: "ramprasadsuthi@gmail.com",
    role: "student",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    kycStatus: "unverified",
    subscriptionPlan: "Free"
  };

  const tutorUser: UserProfile = {
    id: "t1",
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@tutorhub.edu",
    role: "tutor",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    title: "Stanford CS Professor & AI Architect",
    hourlyRate: 1500,
    category: "Computer Science",
    kycStatus: "verified",
    subscriptionPlan: "Premium"
  };

  const adminUser: UserProfile = {
    id: "admin_default",
    name: "TutorHub System Admin",
    email: "admin@tutorhub.com",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    kycStatus: "verified",
    subscriptionPlan: "Premium"
  };

  const getCurrentUser = () => {
    if (currentRole === "student") return studentUser;
    if (currentRole === "tutor") return tutorUser;
    return adminUser;
  };

  // Fetch initial data from full-stack API
  const loadData = async () => {
    try {
      const [tutorsRes, coursesRes, bookingsRes, blogRes, corpRes, walletRes] = await Promise.all([
        fetch("/api/tutors"),
        fetch("/api/courses"),
        fetch("/api/bookings"),
        fetch("/api/blog"),
        fetch("/api/corporate/requests"),
        fetch("/api/student/wallet")
      ]);

      if (tutorsRes.ok) setTutors(await tutorsRes.json());
      if (coursesRes.ok) setCourses(await coursesRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (blogRes.ok) setBlogPosts(await blogRes.json());
      if (corpRes.ok) setCorporateRequests(await corpRes.json());
      if (walletRes.ok) setWallet(await walletRes.json());
    } catch (error) {
      console.warn("Express full-stack backend not compiled yet. Running safe fallbacks.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for interactive actions
  const handleOnboardTutor = async (tutorDetails: Partial<UserProfile>) => {
    try {
      const response = await fetch("/api/tutors/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tutorDetails)
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      // Offline fallback
      const mockNew = {
        ...tutorDetails,
        id: "t_" + Date.now(),
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        kycStatus: "pending" as const,
        rating: 5.0,
        reviewsCount: 0
      } as UserProfile;
      setTutors(prev => [...prev, mockNew]);
    }
  };

  const handleEnrollInCourse = async (courseId: string) => {
    // Treat as successful enrollment
    const selectedCourse = courses.find(c => c.id === courseId);
    if (!selectedCourse) return;

    if (wallet.balance < selectedCourse.price) {
      alert("Insufficient wallet balance. Please add funds on your Dashboard to enroll in this course.");
      setActiveTab("dashboard");
      return;
    }

    try {
      // Simulate booking/enrollment fee deduction
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "student_default",
          studentName: "John Doe",
          tutorId: selectedCourse.instructorId,
          dateTime: new Date().toISOString(),
          timezone: "America/Los_Angeles",
          durationMinutes: 60,
          price: selectedCourse.price,
          notes: `Enrolled in Course: ${selectedCourse.title}`
        })
      });

      if (response.ok) {
        await loadData();
        alert(`Successfully enrolled in ${selectedCourse.title}!`);
      } else {
        const err = await response.json();
        alert(err.error || "Enrollment failed");
      }
    } catch (e) {
      // Local fallback state
      setWallet(prev => ({ ...prev, balance: prev.balance - selectedCourse.price }));
      alert(`Successfully enrolled in ${selectedCourse.title}!`);
    }
  };

  const handleCreateCourse = async (courseData: Partial<Course>) => {
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData)
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      const mockC = {
        ...courseData,
        id: "c_" + Date.now(),
        instructorName: "Sarah Jenkins",
        instructorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        rating: 5.0,
        reviewsCount: 0,
        enrolledStudentsCount: 0,
        lessons: [
          { id: "l1", title: "Intro module", duration: "10:00" }
        ]
      } as Course;
      setCourses(prev => [...prev, mockC]);
    }
  };

  const handleAddFunds = async (amount: number, method: string) => {
    try {
      const response = await fetch("/api/student/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method })
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      setWallet(prev => ({ ...prev, balance: prev.balance + amount }));
    }
  };

  const handleUpgradePlan = async (plan: "Free" | "Pro" | "Premium") => {
    // Upgrades state locally or calls mock sync
    alert(`Successfully upgraded to the Tutor ${plan} subscription tier!`);
    loadData();
  };

  const handleOnboardCorporate = async (companyName: string, domain: string, employeesCount: number) => {
    try {
      const response = await fetch("/api/corporate/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, domain, employeesCount })
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      const mockReq = {
        id: "corp_" + Date.now(),
        companyName,
        domain,
        employeesCount,
        purchasedCredits: 500,
        status: "pending" as const
      };
      setCorporateRequests(prev => [...prev, mockReq]);
    }
  };

  const handleAddPost = async (title: string, excerpt: string, author: string, category: string) => {
    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, excerpt, author, category })
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      const mockPost = {
        id: "p_" + Date.now(),
        title,
        excerpt,
        author,
        date: new Date().toISOString().split("T")[0],
        category,
        likes: 0,
        commentsCount: 0
      };
      setBlogPosts(prev => [mockPost, ...prev]);
    }
  };

  const handleKycVerify = async (tutorId: string, status: "verified" | "unverified") => {
    try {
      const response = await fetch("/api/admin/kyc/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tutorId, status })
      });
      if (response.ok) {
        await loadData();
      }
    } catch (e) {
      setTutors(prev => prev.map(t => t.id === tutorId ? { ...t, kycStatus: status === "verified" ? "verified" : "unverified" } : t));
    }
  };

  const handleApproveCorporate = async (id: string) => {
    setCorporateRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" as const } : r));
    alert("Enterprise application approved and authorized.");
  };

  // Interactive 1:1 Booking Action
  const submitOneToOneBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorForBooking) return;

    const rate = selectedTutorForBooking.hourlyRate || 50;
    if (wallet.balance < rate) {
      setBookingError(`Insufficient balance. Booking costs ₹${rate}, but your wallet balance is ₹${wallet.balance}. Please add funds.`);
      return;
    }

    setBookingError("");
    setBookingSuccessMsg("");

    const isoDateTime = `${bookingDate}T${bookingTime}:00`;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: "student_default",
          studentName: "John Doe",
          tutorId: selectedTutorForBooking.id,
          dateTime: isoDateTime,
          timezone: bookingTimezone,
          durationMinutes: bookingDuration,
          price: rate,
          notes: bookingNotes
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Booking failed.");
      }

      setBookingSuccessMsg(`Coaching session scheduled with ${selectedTutorForBooking.name}!`);
      setBookingNotes("");
      await loadData();
      setTimeout(() => {
        setSelectedTutorForBooking(null);
        setActiveTab("dashboard");
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || "Scheduling error. Check network connection.");
    }
  };

  return (
    <div id="tutorhub-application" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      
      {/* Platform Global Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand Head */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <Globe size={20} className="animate-spin" style={{ animationDuration: '20s' }} />
            </div>
            <div>
              <h1 className="text-xl font-brand font-black tracking-tight bg-gradient-to-r from-indigo-200 via-white to-slate-200 bg-clip-text text-transparent">TutorHub</h1>
              <p className="text-[9px] text-slate-400 font-brand font-bold uppercase tracking-widest leading-none">Global Education Marketplace</p>
            </div>
          </div>

          {/* Role Changer Simulator Panel (Anti-tech larping / highly functional user switches) */}
          <div className="flex items-center gap-3 bg-slate-800/60 p-1.5 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-brand font-extrabold text-slate-400 px-2 uppercase tracking-widest">Simulate Role:</span>
            <div className="flex gap-1">
              {(["student", "tutor", "admin"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setCurrentRole(role);
                    // Redirect to safe dashboards if switched
                    if (role === "admin") setActiveTab("admin");
                    else if (role === "tutor") setActiveTab("dashboard");
                    else setActiveTab("discover");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-brand font-extrabold uppercase tracking-widest transition-all duration-200 ${
                    currentRole === role
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 scale-[1.02]"
                      : "text-slate-300 hover:bg-slate-700/50"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

        </div>
      </header>

      {/* Main Responsive Grid Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Navigation Sidebar Drawer */}
        <aside className="lg:col-span-3 flex flex-col gap-5 text-left">
          
          {/* User Status Profile Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-3.5">
            <img
              src={getCurrentUser().avatarUrl}
              alt={getCurrentUser().name}
              className="w-11 h-11 rounded-full object-cover border border-slate-100 ring-2 ring-indigo-50"
            />
            <div className="space-y-0.5">
              <h4 className="font-brand font-bold text-slate-800 text-sm leading-none">{getCurrentUser().name}</h4>
              <p className="text-3xs text-slate-400 font-medium truncate max-w-[150px]">{getCurrentUser().email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-brand font-extrabold px-1.5 py-0.5 rounded capitalize tracking-wide">
                  {currentRole}
                </span>
                {currentRole === "student" && (
                  <span className="text-slate-500 font-brand font-bold text-[10px] tracking-wide">
                    ₹{wallet.balance} Balance
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1.5">
            <h3 className="text-[10px] font-brand font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2.5">Primary Operations</h3>
            
            <button
              onClick={() => setActiveTab("discover")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                activeTab === "discover" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:translate-x-1"
              }`}
            >
              <Globe size={16} />
              Tutors Matchmaking
            </button>

            <button
              onClick={() => setActiveTab("courses")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                activeTab === "courses" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:translate-x-1"
              }`}
            >
              <BookOpen size={16} />
              Courses &amp; LMS
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                activeTab === "dashboard" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:translate-x-1"
              }`}
            >
              <Calendar size={16} />
              Schedule &amp; Wallet
            </button>

            <button
              onClick={() => setActiveTab("ai-study")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                activeTab === "ai-study" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:translate-x-1"
              }`}
            >
              <Sparkles size={16} className="text-indigo-500" />
              AI Study Companion
            </button>

            <button
              onClick={() => setActiveTab("corporate")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                activeTab === "corporate" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:translate-x-1"
              }`}
            >
              <Building size={16} />
              Enterprise portals
            </button>

            <button
              onClick={() => setActiveTab("community")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                activeTab === "community" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:translate-x-1"
              }`}
            >
              <MessageSquare size={16} />
              Community Knowledge
            </button>

            {currentRole === "admin" && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-brand font-bold tracking-wide transition-all duration-150 text-left ${
                  activeTab === "admin" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:translate-x-1"
                }`}
              >
                <ShieldCheck size={16} />
                Admin Console
              </button>
            )}
          </div>

          {/* Secure compliance certificate QR teaser */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-sm relative overflow-hidden">
            <span className="bg-indigo-500/20 text-indigo-400 text-4xs font-extrabold uppercase px-2 py-0.5 rounded">
              Accreditation
            </span>
            <h4 className="font-bold text-xs">Accredited Certificates</h4>
            <p className="text-slate-300 text-3xs leading-relaxed">
              Upon session or course completions, secure custom QR-authenticated certificates instantly.
            </p>
          </div>

        </aside>

        {/* Dynamic Display Panel */}
        <main className="lg:col-span-9 space-y-8">
          {activeTab === "discover" && (
            <TutorDiscovery
              tutors={tutors}
              onBookTutor={(tutor) => setSelectedTutorForBooking(tutor)}
            />
          )}

          {activeTab === "courses" && (
            <CourseCatalog
              courses={courses}
              enrolledCourseIds={currentRole === "student" ? ["c1"] : []} // Enrolled simulation
              onEnroll={handleEnrollInCourse}
              onCreateCourse={handleCreateCourse}
              userRole={currentRole}
              tutorId={currentRole === "tutor" ? "t1" : undefined}
            />
          )}

          {activeTab === "dashboard" && (
            <Dashboard
              user={getCurrentUser()}
              bookings={bookings}
              courses={courses}
              wallet={wallet}
              onAddFunds={handleAddFunds}
              onUpgradePlan={handleUpgradePlan}
            />
          )}

          {activeTab === "ai-study" && (
            <AiStudyAssistant
              currentCourse={courses[0]} // Pass default bootcamp course
            />
          )}

          {activeTab === "corporate" && (
            <CorporatePanel
              onOnboard={handleOnboardCorporate}
              requests={corporateRequests}
            />
          )}

          {activeTab === "community" && (
            <CommunityForum
              posts={blogPosts}
              onAddPost={handleAddPost}
              currentUser={getCurrentUser()}
            />
          )}

          {activeTab === "admin" && (
            <AdminConsole
              tutors={tutors}
              onKycVerify={handleKycVerify}
              corporateRequests={corporateRequests}
              onApproveCorporate={handleApproveCorporate}
            />
          )}
        </main>

      </div>

      {/* 1:1 Booking Scheduling Modal with Timezones */}
      <AnimatePresence>
        {selectedTutorForBooking && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 max-w-lg w-full text-left shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Schedule 1-to-1 Mentoring</h3>
                  <p className="text-slate-500 text-xs">Verify timeline parameters and secure appointment booking.</p>
                </div>
                <button
                  onClick={() => setSelectedTutorForBooking(null)}
                  className="bg-slate-100 text-slate-500 hover:bg-slate-200 p-1.5 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mini Tutor Summary Info */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex gap-3">
                <img
                  src={selectedTutorForBooking.avatarUrl}
                  alt={selectedTutorForBooking.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">{selectedTutorForBooking.name}</h4>
                  <p className="text-3xs text-slate-500">{selectedTutorForBooking.title}</p>
                  <p className="text-xs text-indigo-600 font-extrabold mt-1">Rate: ₹{selectedTutorForBooking.hourlyRate}/hr</p>
                </div>
              </div>

              <form onSubmit={submitOneToOneBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-bold text-slate-500 uppercase">Select Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs font-bold text-slate-500 uppercase">Select Start Time</label>
                    <input
                      type="time"
                      required
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-3xs font-bold text-slate-500 uppercase">Target Timezone</label>
                    <select
                      value={bookingTimezone}
                      onChange={(e) => setBookingTimezone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 focus:outline-none"
                    >
                      <option value="America/Los_Angeles">PST (Los Angeles)</option>
                      <option value="America/New_York">EST (New York)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Europe/Paris">CET (Paris)</option>
                      <option value="Asia/Singapore">SGT (Singapore)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-3xs font-bold text-slate-500 uppercase">Duration</label>
                    <select
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600 focus:outline-none"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={60}>60 Minutes</option>
                      <option value={90}>90 Minutes</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-3xs font-bold text-slate-500 uppercase">What goals would you like to target?</label>
                  <textarea
                    placeholder="e.g., I'd like to do mock interviews regarding financial derivatives pricing logic..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                {bookingError && (
                  <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-center gap-2 text-xs">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {bookingSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs">
                    <ShieldCheck size={16} className="shrink-0 text-emerald-600" />
                    <span>{bookingSuccessMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-3.5 rounded-xl transition"
                >
                  Pay &amp; Reserve Session (₹{selectedTutorForBooking.hourlyRate})
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 TutorHub SaaS global Platform. Built with secure, high-contrast, scalable full-stack layers.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Security SLA</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Corporate Compliance</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
