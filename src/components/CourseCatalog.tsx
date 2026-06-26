import React, { useState } from "react";
import { BookOpen, Sparkles, Plus, PlayCircle, Calendar, Users, Star, ArrowRight, BookCheck, ClipboardList } from "lucide-react";
import { motion } from "motion/react";
import { Course, Lesson } from "../types";

interface CourseCatalogProps {
  courses: Course[];
  enrolledCourseIds: string[];
  onEnroll: (courseId: string) => void;
  onCreateCourse: (courseData: Partial<Course>) => void;
  userRole: "student" | "tutor" | "admin";
  tutorId?: string;
}

export default function CourseCatalog({
  courses,
  enrolledCourseIds,
  onEnroll,
  onCreateCourse,
  userRole,
  tutorId
}: CourseCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Outline Builder State
  const [outlineTopic, setOutlineTopic] = useState("");
  const [outlineAudience, setOutlineAudience] = useState("");
  const [outlineLevel, setOutlineLevel] = useState("Beginner");
  const [loadingOutline, setLoadingOutline] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<any>(null);

  // New Course Creator State
  const [showCreator, setShowCreator] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPrice, setNewPrice] = useState(99);
  const [newCategory, setNewCategory] = useState("Computer Science");
  const [newType, setNewType] = useState<"recorded" | "live">("recorded");
  const [newDesc, setNewDesc] = useState("");

  const categories = ["All", "Computer Science", "Finance & Mathematics", "Languages", "Design"];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outlineTopic) return;

    setLoadingOutline(true);
    setGeneratedOutline(null);

    try {
      const response = await fetch("/api/gemini/course-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: outlineTopic,
          audience: outlineAudience,
          level: outlineLevel
        })
      });

      if (!response.ok) throw new Error("Outline curation error.");
      const data = await response.json();
      setGeneratedOutline(data);
    } catch (err: any) {
      setGeneratedOutline({
        title: `Curriculum: ${outlineTopic}`,
        summary: "Static reference plan. Please double-check your GEMINI_API_KEY if this fails.",
        modules: [
          { moduleName: "Module 1: Introductory Foundations", description: "Get familiar with tools and setup.", lessons: ["Lesson 1.1 Intro", "Lesson 1.2 Syntax"] }
        ]
      });
    } finally {
      setLoadingOutline(false);
    }
  };

  const handleCreateCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    onCreateCourse({
      title: newTitle,
      price: newPrice,
      category: newCategory,
      type: newType,
      description: newDesc,
      instructorId: tutorId || "t1"
    });

    // Reset states
    setNewTitle("");
    setNewPrice(99);
    setNewDesc("");
    setShowCreator(false);
  };

  return (
    <div id="course-catalog-container" className="space-y-8">
      {/* Search & Tabs Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 text-left">
          <h2 className="text-2xl font-extrabold text-slate-800">Learning Catalog</h2>
          <p className="text-slate-500 text-xs">Access premium courses and join live virtual coaching masterclasses.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {userRole === "tutor" && (
            <button
              onClick={() => setShowCreator(!showCreator)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} />
              Publish New Course
            </button>
          )}
        </div>
      </div>

      {/* Tutor Publish Form */}
      {showCreator && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left"
        >
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Course Editor</h3>
          <form onSubmit={handleCreateCourseSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Course Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Financial Modeling with Excel & Python"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Hourly/Course Price (₹)</label>
              <input
                type="number"
                required
                value={newPrice}
                onChange={(e) => setNewPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Category Domain</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Delivery Format</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="recorded">Recorded LMS Course</option>
                <option value="live">Live Group Class</option>
              </select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Course Overview & Description</label>
              <textarea
                placeholder="Detail learning milestones..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-3 pt-2">
              <button
                type="submit"
                className="bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2 rounded-xl transition"
              >
                Publish Live to Marketplace
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* AI Course Outline Planner Panel */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 shadow-xs text-left">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-emerald-600" size={20} />
          <h3 className="font-extrabold text-slate-800 text-base">AI Course Outline Generator</h3>
        </div>
        <p className="text-slate-500 text-xs mb-4">Are you a tutor looking to publish, or a student outlining a target curriculum? Describe the topic and get a detailed course outline draft in seconds.</p>

        <form onSubmit={handleGenerateOutline} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="e.g., Advanced Options Pricing and Risk Hedging"
              value={outlineTopic}
              onChange={(e) => setOutlineTopic(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <div>
            <select
              value={outlineLevel}
              onChange={(e) => setOutlineLevel(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="Beginner">Beginner Foundations</option>
              <option value="Intermediate">Intermediate Workshop</option>
              <option value="Advanced">Advanced Deep Dive</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loadingOutline}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs rounded-lg py-2 transition flex items-center justify-center gap-1.5"
          >
            {loadingOutline ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : "Generate Outline"}
          </button>
        </form>

        {generatedOutline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-white border border-emerald-100/50 rounded-xl p-5 shadow-xs"
          >
            <h4 className="font-extrabold text-slate-800 text-sm mb-1">{generatedOutline.title}</h4>
            <p className="text-slate-600 text-xs mb-4">{generatedOutline.summary}</p>
            <div className="space-y-4">
              {generatedOutline.modules?.map((m: any, idx: number) => (
                <div key={idx} className="border-l-2 border-emerald-500 pl-3">
                  <h5 className="font-bold text-slate-800 text-xs">{m.moduleName}</h5>
                  <p className="text-slate-500 text-3xs mt-0.5">{m.description}</p>
                  <ul className="mt-1.5 space-y-1">
                    {m.lessons?.map((les: string, lIdx: number) => (
                      <li key={lIdx} className="text-slate-600 text-3xs flex items-center gap-1.5">
                        <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                        {les}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Course Details Player View if selected */}
      {activeCourse && (
        <div className="bg-slate-900 text-white rounded-2xl overflow-hidden shadow-lg border border-slate-800 text-left">
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="bg-indigo-500/20 text-indigo-400 text-3xs font-extrabold uppercase px-2.5 py-1 rounded-md">
                {activeCourse.category} • {activeCourse.type} LMS
              </span>
              <h3 className="text-xl font-bold mt-2 text-white">{activeCourse.title}</h3>
              <p className="text-slate-400 text-xs mt-1">Instructor: {activeCourse.instructorName}</p>
            </div>
            <button
              onClick={() => { setActiveCourse(null); setActiveLesson(null); }}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              Exit Classroom
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left/Middle: Lesson Player / Video */}
            <div className="lg:col-span-2 p-6 bg-slate-950 flex flex-col justify-between min-h-[380px]">
              {activeLesson ? (
                <div className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-800 relative">
                    <PlayCircle size={64} className="text-indigo-400 animate-pulse" />
                    <span className="text-xs text-slate-400 mt-2">Simulated Interactive LMS Video Player ({activeLesson.duration})</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm">{activeLesson.title}</h4>
                    <p className="text-3xs text-slate-400">Lesson ID: {activeLesson.id}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                  <BookCheck size={48} className="opacity-20 mb-2" />
                  <p className="text-xs">Select a lesson from the outline to launch the media player.</p>
                </div>
              )}
            </div>

            {/* Right Side: Curriculum Navigation */}
            <div className="bg-slate-900 border-l border-slate-800 p-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Syllabus</h4>
              <div className="space-y-2">
                {activeCourse.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left ${
                      activeLesson?.id === lesson.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800/40 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PlayCircle size={14} className="shrink-0" />
                      <span className="text-xs font-medium truncate max-w-[150px]">{lesson.title}</span>
                    </div>
                    <span className="text-3xs opacity-80 shrink-0">{lesson.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Filter Tabs & Grid */}
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === cat 
                    ? "bg-slate-900 text-white shadow-sm" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full sm:max-w-xs"
          />
        </div>

        {/* Courses Listing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => {
            const isEnrolled = enrolledCourseIds.includes(c.id);
            return (
              <div
                key={c.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md transition flex flex-col justify-between"
              >
                {/* Course Header Image */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-3xs font-extrabold uppercase px-2.5 py-1 rounded">
                    {c.type}
                  </div>
                  {c.isSponsored && (
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-3xs font-extrabold uppercase px-2 py-0.5 rounded">
                      Featured
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-3xs font-bold text-slate-400 uppercase tracking-widest">{c.category}</span>
                    <h4 className="font-extrabold text-slate-800 text-sm line-clamp-1">{c.title}</h4>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{c.description}</p>
                  </div>

                  {/* Rating & Teacher */}
                  <div className="flex items-center justify-between text-2xs pt-2 border-t border-slate-50">
                    <div className="flex items-center gap-1.5">
                      <img src={c.instructorAvatar} alt={c.instructorName} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-slate-600 font-semibold">{c.instructorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      <span className="font-bold">{c.rating}</span>
                      <span className="text-slate-400">({c.reviewsCount})</span>
                    </div>
                  </div>

                  {/* Pricing / Enrollment Action */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-800 font-extrabold text-base">₹{c.price}</span>
                    
                    {isEnrolled ? (
                      <button
                        onClick={() => {
                          setActiveCourse(c);
                          // Auto set first lesson
                          if (c.lessons.length > 0) {
                            setActiveLesson(c.lessons[0]);
                          }
                        }}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1"
                      >
                        Launch Class
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => onEnroll(c.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                      >
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
