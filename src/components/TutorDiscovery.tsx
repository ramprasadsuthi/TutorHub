import React, { useState, useEffect } from "react";
import { Search, Sparkles, Filter, DollarSign, Languages, Globe, ShieldCheck, ArrowRight, User } from "lucide-react";
import { motion } from "motion/react";
import { UserProfile } from "../types";

interface TutorDiscoveryProps {
  onBookTutor: (tutor: UserProfile) => void;
  tutors: UserProfile[];
}

export default function TutorDiscovery({ onBookTutor, tutors }: TutorDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxBudget, setMaxBudget] = useState<number>(5000);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  
  // AI Recommendation State
  const [studentGoal, setStudentGoal] = useState("");
  const [aiRecs, setAiRecs] = useState<Array<{ tutorId: string; matchingScore: number; matchReason: string }>>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  const categories = ["All", "Computer Science", "Finance & Mathematics", "Languages", "Design"];
  const languagesList = ["All", "English", "Spanish", "Russian", "Mandarin", "French"];

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tutor.title && tutor.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tutor.skills && tutor.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === "All" || tutor.category === selectedCategory;
    const matchesBudget = (tutor.hourlyRate || 0) <= maxBudget;
    const matchesLanguage = selectedLanguage === "All" || 
      (tutor.languages && tutor.languages.includes(selectedLanguage));

    return matchesSearch && matchesCategory && matchesBudget && matchesLanguage;
  });

  const getAiRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentGoal.trim()) return;

    setLoadingRecs(true);
    setRecommendationError("");
    setAiRecs([]);

    try {
      const response = await fetch("/api/gemini/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentGoal,
          preferredCategory: selectedCategory !== "All" ? selectedCategory : undefined,
          maxBudget
        })
      });

      if (!response.ok) throw new Error("Failed to load recommendations");
      const data = await response.json();
      setAiRecs(data);
    } catch (err: any) {
      setRecommendationError(err.message || "An error occurred");
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div id="tutor-discovery-container" className="space-y-8">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-12 translate-x-12">
          <Globe size={300} />
        </div>
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-semibold">
            <Sparkles size={16} />
            Empowered by AI Learning Ecosystems
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Find the World&apos;s Elite Mentors &amp; Experts
          </h1>
          <p className="text-slate-300 text-lg md:text-xl">
            Whether for technical research, complex finance derivatives, global languages, or custom enterprise solutions, matches are just moments away.
          </p>
        </div>
      </div>

      {/* AI Recommendation Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">AI Tutor Matchmaker</h2>
            <p className="text-sm text-slate-500">Describe your custom learning target and budget, and let AI select your ideal tutor.</p>
          </div>
        </div>

        <form onSubmit={getAiRecommendations} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <input
              type="text"
              placeholder="e.g., I want to master quantitative options pricing formulas for an upcoming interview in two weeks."
              value={studentGoal}
              onChange={(e) => setStudentGoal(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loadingRecs}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl py-3 transition shadow-sm hover:shadow flex items-center justify-center gap-2 text-sm"
            >
              {loadingRecs ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Tutors...
                </>
              ) : (
                <>
                  Find Best Matches
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {recommendationError && (
          <p className="text-red-500 text-sm mt-2">{recommendationError}</p>
        )}

        {aiRecs.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-semibold text-indigo-900 tracking-wider uppercase">AI Matching Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiRecs.map((rec) => {
                const matchedTutor = tutors.find(t => t.id === rec.tutorId);
                if (!matchedTutor) return null;
                return (
                  <div key={rec.tutorId} className="bg-white border border-indigo-100 rounded-xl p-4 flex gap-3 shadow-xs">
                    <img 
                      src={matchedTutor.avatarUrl} 
                      alt={matchedTutor.name} 
                      className="w-12 h-12 rounded-full object-cover border border-slate-100" 
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{matchedTutor.name}</h4>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">
                          {rec.matchingScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{matchedTutor.title}</p>
                      <p className="text-xs text-slate-600 italic">“{rec.matchReason}”</p>
                      <button
                        onClick={() => onBookTutor(matchedTutor)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1"
                      >
                        Book {matchedTutor.name} now <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Advanced Filters Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-800">
            <Filter size={18} className="text-slate-500" />
            <span className="font-semibold text-slate-800">Refine Search Parameters</span>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tutor names, skill tokens, bio keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Domain Classification</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    selectedCategory === cat 
                      ? "bg-slate-900 text-white" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Limit Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Max Hourly Rate</span>
              <span className="text-indigo-600">₹{maxBudget}/hr</span>
            </div>
            <input
              type="range"
              min="500"
              max="10000"
              step="100"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Language Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500">Preferred Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {languagesList.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tutor Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTutors.length > 0 ? (
          filteredTutors.map((tutor) => (
            <motion.div
              key={tutor.id}
              layout
              className={`bg-white border rounded-2xl p-6 flex flex-col md:flex-row gap-6 transition hover:shadow-md relative ${
                tutor.isFeatured ? "border-indigo-200 bg-gradient-to-br from-white to-indigo-50/10" : "border-slate-100"
              }`}
            >
              {tutor.isFeatured && (
                <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-2xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  Sponsored
                </div>
              )}

              {/* Left Column: Avatar & Basic Details */}
              <div className="flex flex-col items-center text-center space-y-3 shrink-0">
                <div className="relative">
                  <img
                    src={tutor.avatarUrl}
                    alt={tutor.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                  />
                  {tutor.kycStatus === "verified" && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Identity KYC Verified">
                      <ShieldCheck size={14} />
                    </div>
                  )}
                </div>

                <div className="bg-slate-100 rounded-lg px-2 py-1 text-2xs font-bold text-slate-600">
                  {tutor.subscriptionPlan} Partner
                </div>

                <div className="text-indigo-600 font-extrabold text-lg flex items-center gap-0.5">
                  <span>₹</span>
                  <span>{tutor.hourlyRate}</span>
                  <span className="text-slate-400 text-xs font-normal">/hr</span>
                </div>
              </div>

              {/* Right Column: Bio & Booking Trigger */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-left">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{tutor.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{tutor.title}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-sm">★</span>
                    <span className="text-xs font-bold text-slate-700">{tutor.rating}</span>
                    <span className="text-xs text-slate-400">({tutor.reviewsCount} reviews)</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {tutor.bio}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {tutor.skills?.map((skill) => (
                      <span key={skill} className="bg-slate-100 text-slate-600 text-3xs font-semibold px-2 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-slate-400 text-2xs">
                  <span className="flex items-center gap-1">
                    <Languages size={12} />
                    {tutor.languages?.join(", ")}
                  </span>
                  <button
                    onClick={() => onBookTutor(tutor)}
                    className="ml-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                  >
                    Select Availability
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            <User size={40} className="mx-auto mb-3 opacity-40 text-slate-400" />
            <h4 className="font-bold text-slate-700 mb-1">No Tutors Match Filter Parameters</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Try widening your budget range, specifying different languages, or utilizing the AI Matchmaker above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
