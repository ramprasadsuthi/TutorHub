import React, { useState } from "react";
import { MessageSquare, ThumbsUp, Sparkles, Send, Award, FileText, User } from "lucide-react";
import { motion } from "motion/react";
import { BlogPost } from "../types";

interface CommunityForumProps {
  posts: BlogPost[];
  onAddPost: (title: string, excerpt: string, author: string, category: string) => void;
  currentUser: { name: string };
}

export default function CommunityForum({ posts, onAddPost, currentUser }: CommunityForumProps) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newExcerpt, setNewExcerpt] = useState("");
  const [newCategory, setNewCategory] = useState("LMS Strategy");
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const categories = ["LMS Strategy", "Languages", "Computer Science", "Finance & Mathematics", "Design"];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newExcerpt) return;
    onAddPost(newTitle, newExcerpt, currentUser.name, newCategory);
    setNewTitle("");
    setNewExcerpt("");
    setShowForm(false);
  };

  const toggleLike = (postId: string) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  return (
    <div id="community-forum-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      {/* Left Columns: Posts Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-xl font-bold text-slate-800">TutorHub Forums &amp; Knowledge</h3>
            <p className="text-slate-500 text-xs">Share learning insights, test preparation rules, and coaching practices.</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            {showForm ? "Close Form" : "Publish Article"}
          </button>
        </div>

        {/* Create Post Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-slate-50 border border-slate-200 rounded-2xl p-5"
          >
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-3xs font-bold text-slate-500 uppercase">Article Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Best resources for IELTS Speaking fluency"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-3xs font-bold text-slate-500 uppercase">Category Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-600"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-3xs font-bold text-slate-500 uppercase">Article Summary or Post Content</label>
                <textarea
                  required
                  placeholder="Detail your educational thoughts or questions..."
                  value={newExcerpt}
                  onChange={(e) => setNewExcerpt(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
                />
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition"
              >
                Post to Community
              </button>
            </form>
          </motion.div>
        )}

        {/* Posts feed */}
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = likedPosts[post.id];
            return (
              <div
                key={post.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 transition hover:shadow-2xs space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-50 text-indigo-700 text-3xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-slate-400 text-3xs">{post.date}</span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-800">{post.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{post.excerpt}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-slate-400 text-2xs">
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    Published by: <span className="font-bold text-slate-700">{post.author}</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-1 transition font-semibold ${
                        isLiked ? "text-indigo-600" : "hover:text-slate-600"
                      }`}
                    >
                      <ThumbsUp size={12} className={isLiked ? "fill-indigo-600" : ""} />
                      <span>{post.likes + (isLiked ? 1 : 0)} Likes</span>
                    </button>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={12} />
                      <span>{post.commentsCount} Comments</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Community Highlights */}
      <div className="space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-600" />
            <h4 className="font-bold text-slate-800 text-xs">Community Leaderboard</h4>
          </div>
          <p className="text-slate-500 text-3xs leading-relaxed">Active contributors receive community points convertible directly to learning credits!</p>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">1. Dr. Sarah Jenkins</span>
              <span className="text-indigo-600 font-bold">1,450 pts</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
              <span className="font-bold text-slate-700">2. Elena Rostova</span>
              <span className="text-indigo-600 font-bold">980 pts</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-slate-200/50 pt-2">
              <span className="font-bold text-slate-700">3. Alexei Petrov</span>
              <span className="text-indigo-600 font-bold">710 pts</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-900">
            <Award size={18} />
            <h4 className="font-extrabold text-xs">Honor Roll Badges</h4>
          </div>
          <p className="text-slate-600 text-3xs leading-relaxed">Contribute to discussion topics or publish peer-reviewed course guides to earn your verifiable profile badges.</p>
        </div>
      </div>
    </div>
  );
}
