import React, { useState, useEffect } from "react";
import { Wallet, CreditCard, Award, Calendar, ExternalLink, RefreshCw, BarChart2, Star, Shield, ArrowUpRight, Zap } from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, Booking, Course } from "../types";

interface DashboardProps {
  user: UserProfile;
  bookings: Booking[];
  courses: Course[];
  wallet: { balance: number; points: number; referralCode: string };
  onAddFunds: (amount: number, method: string) => void;
  onUpgradePlan: (plan: "Free" | "Pro" | "Premium") => void;
}

export default function Dashboard({
  user,
  bookings,
  courses,
  wallet,
  onAddFunds,
  onUpgradePlan
}: DashboardProps) {
  const [depositAmount, setDepositAmount] = useState<number>(2000);
  const [paymentMethod, setPaymentMethod] = useState("Stripe");
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmount <= 0) return;
    onAddFunds(depositAmount, paymentMethod);
    setSuccessMessage(`Simulated payment approved! Loaded ₹${depositAmount} via ${paymentMethod}.`);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  // Filter relevant bookings based on role
  const relevantBookings = bookings.filter((b) => {
    if (user.role === "student") {
      return b.studentId === "student_default"; // for demo
    } else {
      return b.tutorId === user.id || user.id === "t1"; // Default tutor demo
    }
  });

  return (
    <div id="dashboard-container" className="space-y-8 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Welcome back, {user.name}</h2>
          <p className="text-slate-500 text-xs">Role Profile: <span className="font-bold text-indigo-600 capitalize">{user.role}</span></p>
        </div>

        {/* Quick Identity Status Tag */}
        <div className="flex items-center gap-3">
          {user.role === "tutor" && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-1.5 text-xs font-bold flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              Subscription: {user.subscriptionPlan || "Free"} Partner
            </div>
          )}
          {user.kycStatus === "verified" && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-1.5 text-xs font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-500" />
              Verified Expert Coach
            </div>
          )}
        </div>
      </div>

      {user.role === "student" ? (
        // STUDENT DASHBOARD SCREEN
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet and Financial Balance */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-y-4">
                <Wallet size={160} />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-200 text-3xs font-extrabold uppercase tracking-widest">TutorHub Active Wallet Balance</span>
                  <Wallet size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold">₹{wallet.balance}</p>
                  <p className="text-3xs text-indigo-200 mt-1">Accumulated Points: <span className="font-bold text-white">{wallet.points} Points</span></p>
                </div>
              </div>
            </div>

            {/* Deposit Box (Stripe, PayPal, Google Pay simulations) */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <CreditCard size={14} className="text-indigo-600" />
                Add Funds Securely
              </h3>
              <form onSubmit={handleDeposit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositAmount(2000)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      depositAmount === 2000 ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    ₹2,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount(5000)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      depositAmount === 5000 ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    ₹5,000
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="10"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-3xs text-slate-600 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Stripe">Stripe</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Google Pay">Google Pay</option>
                    <option value="Razorpay">Razorpay</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs"
                >
                  Deposit and Reload
                </button>
              </form>

              {successMessage && (
                <p className="text-emerald-600 text-3xs font-semibold text-center mt-2 bg-emerald-50 p-2 rounded">{successMessage}</p>
              )}
            </div>

            {/* Referral system */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
              <Award className="mx-auto text-indigo-600" size={24} />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs">Invite Friends & Learn Free</h4>
                <p className="text-slate-500 text-3xs leading-relaxed">Share your referral voucher code. When friends join, you both secure ₹1,500 learning credit instantly!</p>
              </div>
              <div className="bg-white border border-dashed border-slate-200 rounded-lg py-2 px-4 font-mono font-bold text-indigo-600 text-sm">
                {wallet.referralCode}
              </div>
            </div>
          </div>

          {/* Tutoring booking calendar list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-600" />
                  Live Mentoring Sessions Scheduled
                </h3>
              </div>

              {relevantBookings.length > 0 ? (
                <div className="space-y-3">
                  {relevantBookings.map((b) => (
                    <div key={b.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex gap-3">
                        <img src={b.tutorAvatar} alt={b.tutorName} className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0" />
                        <div className="space-y-1 text-left">
                          <h4 className="font-bold text-slate-800 text-xs">{b.tutorName}</h4>
                          <p className="text-3xs text-slate-500">{b.tutorTitle}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-3xs text-slate-400">
                            <span>📅 {new Date(b.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                            <span>⏱️ {b.durationMinutes} min</span>
                            <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">{b.timezone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto shrink-0">
                        {b.meetingLink && b.status === "confirmed" && (
                          <a
                            href={b.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-3xs px-4 py-2 rounded-xl transition flex items-center gap-1 w-full sm:w-auto text-center justify-center shadow-xs"
                          >
                            Launch Meeting
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <span className="text-3xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          Paid: ₹{b.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                  <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No upcoming tutor bookings. Discover and schedule standard 1:1 sessions today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // TUTOR DASHBOARD SCREEN
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
          {/* Earnings Analytics */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <BarChart2 size={18} className="text-indigo-600" />
              Tutor Earnings & Scope
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <span className="text-3xs font-bold text-slate-400 uppercase">Gross Earnings</span>
                <p className="text-xl font-extrabold text-slate-800">₹3,50,000</p>
                <span className="text-emerald-600 text-3xs font-bold flex items-center">
                  <ArrowUpRight size={12} />
                  +12% vs last month
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <span className="text-3xs font-bold text-slate-400 uppercase">Tutor Rating</span>
                <p className="text-xl font-extrabold text-slate-800">4.9 ★</p>
                <span className="text-slate-500 text-3xs">Based on 142 reviews</span>
              </div>
            </div>

            {/* Platform Subscriptions Upgrades (SaaS Partner plans) */}
            <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="text-indigo-600" size={16} />
                <h4 className="font-bold text-indigo-900 text-xs">SaaS Partner Subscriptions</h4>
              </div>
              <p className="text-slate-600 text-3xs leading-relaxed">Upgrade your tier to unlock lower commission percentages, premium advertisement options, and featured directory listings.</p>
              
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <button
                  onClick={() => onUpgradePlan("Free")}
                  className={`p-2 rounded-lg border text-3xs font-bold transition ${
                    user.subscriptionPlan === "Free" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Free (20% fee)
                </button>
                <button
                  onClick={() => onUpgradePlan("Pro")}
                  className={`p-2 rounded-lg border text-3xs font-bold transition ${
                    user.subscriptionPlan === "Pro" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Pro (12% fee)
                </button>
                <button
                  onClick={() => onUpgradePlan("Premium")}
                  className={`p-2 rounded-lg border text-3xs font-bold transition ${
                    user.subscriptionPlan === "Premium" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Premium (8% fee)
                </button>
              </div>
            </div>
          </div>

          {/* Bookings Managed */}
          <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Incoming Student Tutoring Bookings
            </h3>
            <p className="text-slate-500 text-xs">Conduct 1:1 online coaching masterclasses. Review student specifications and prepare assignments or customized test materials.</p>

            <div className="space-y-3 pt-2">
              {bookings.map((b) => (
                <div key={b.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Student: {b.studentName}</h4>
                    <p className="text-3xs text-slate-500 italic mt-0.5">“{b.notes || "No special requests specified."}”</p>
                    <div className="flex flex-wrap items-center gap-3 text-3xs text-slate-400 mt-2">
                      <span>📅 {new Date(b.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                      <span>⏱️ {b.durationMinutes} Minutes</span>
                      <span className="bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">{b.timezone}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end gap-2 shrink-0">
                    <span className="text-3xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      Earned: ₹{b.price}
                    </span>
                    {b.meetingLink && (
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-3xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                      >
                        Join Room
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
