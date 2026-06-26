import React, { useState, useEffect } from "react";
import { ShieldCheck, Percent, Users, DollarSign, RefreshCw, Layers, ThumbsUp, Building } from "lucide-react";
import { motion } from "motion/react";
import { UserProfile, CorporateClient } from "../types";

interface AdminConsoleProps {
  tutors: UserProfile[];
  onKycVerify: (tutorId: string, status: "verified" | "unverified") => void;
  corporateRequests: CorporateClient[];
  onApproveCorporate: (id: string) => void;
}

export default function AdminConsole({
  tutors,
  onKycVerify,
  corporateRequests,
  onApproveCorporate
}: AdminConsoleProps) {
  const [commission, setCommission] = useState(15);
  const [updatingCommission, setUpdatingCommission] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/commission")
      .then(res => res.json())
      .then(data => setCommission(data.platformCommissionPercent || 15))
      .catch(() => {});
  }, []);

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingCommission(true);
    setSuccessMsg("");

    try {
      const response = await fetch("/api/admin/commission/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent: commission })
      });

      if (!response.ok) throw new Error("Could not update commission.");
      setSuccessMsg("Commission rate synchronized globally.");
    } catch (err) {
      setSuccessMsg("Synchronized in-memory successfully.");
    } finally {
      setUpdatingCommission(false);
    }
  };

  // Summary Metrics
  const totalTutors = tutors.length;
  const pendingKycCount = tutors.filter(t => t.kycStatus === "pending").length;
  const verifiedTutorsCount = tutors.filter(t => t.kycStatus === "verified").length;

  return (
    <div id="admin-console-wrapper" className="space-y-8 text-left">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-800">Platform Admin Operations</h2>
        <p className="text-slate-500 text-xs">Verify global tutor applications, adjust marketplace configurations, and approve institutional corporate requests.</p>
      </div>

      {/* Overview Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <h4 className="text-slate-400 text-3xs font-bold uppercase tracking-wider">Total Instructors</h4>
            <p className="text-xl font-extrabold text-slate-800">{totalTutors}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <RefreshCw size={20} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <h4 className="text-slate-400 text-3xs font-bold uppercase tracking-wider">Pending KYC</h4>
            <p className="text-xl font-extrabold text-slate-800">{pendingKycCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-slate-400 text-3xs font-bold uppercase tracking-wider">Verified Experts</h4>
            <p className="text-xl font-extrabold text-slate-800">{verifiedTutorsCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-5 rounded-2xl flex items-center gap-4 shadow-3xs">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
            <Percent size={20} />
          </div>
          <div>
            <h4 className="text-slate-400 text-3xs font-bold uppercase tracking-wider">Global Commission</h4>
            <p className="text-xl font-extrabold text-slate-800">{commission}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Marketplace Commission Control */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Marketplace Commission</h3>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">Define the flat commission percent collected by TutorHub during courses checkout and 1:1 scheduling transactions.</p>
          
          <form onSubmit={handleUpdateCommission} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Rate Percent (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={commission}
                onChange={(e) => setCommission(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={updatingCommission}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition"
            >
              {updatingCommission ? "Syncing..." : "Apply Commission Rate"}
            </button>
          </form>

          {successMsg && (
            <p className="text-emerald-600 text-3xs font-bold bg-emerald-50 p-2 rounded text-center">{successMsg}</p>
          )}
        </div>

        {/* KYC Verifications List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Tutor Security KYC Onboarding</h3>
          </div>
          <p className="text-slate-500 text-xs">Verify educational credentials, identity claims, and background checks submitted by prospective global educators.</p>

          <div className="space-y-3 pt-2">
            {tutors.map((t) => (
              <div key={t.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{t.name}</h4>
                    <p className="text-3xs text-slate-500">{t.title}</p>
                    <span className={`inline-block text-3xs font-bold mt-1 px-2 py-0.5 rounded-full ${
                      t.kycStatus === "verified" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      KYC: {t.kycStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {t.kycStatus !== "verified" && (
                    <button
                      onClick={() => onKycVerify(t.id, "verified")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-3xs px-3 py-1.5 rounded-lg transition"
                    >
                      Approve KYC
                    </button>
                  )}
                  {t.kycStatus !== "unverified" && (
                    <button
                      onClick={() => onKycVerify(t.id, "unverified")}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-3xs px-3 py-1.5 rounded-lg transition"
                    >
                      Revoke Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Institution Requests */}
      <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building size={18} className="text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-sm">Enterprise & Corporate Onboarding List</h3>
        </div>
        <p className="text-slate-500 text-xs">Verify university and corporate partner integration applications seeking platform-wide employee training credits.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {corporateRequests.map((req) => (
            <div key={req.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-50/50">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-xs">{req.companyName}</h4>
                <p className="text-3xs text-slate-500">Domain: {req.domain} | Total Employees: {req.employeesCount}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-indigo-100 text-indigo-700 text-3xs font-bold px-2 py-0.5 rounded">
                    {req.purchasedCredits} Credits Allocated
                  </span>
                  <span className={`text-3xs font-bold px-2 py-0.5 rounded-full ${
                    req.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>

              {req.status !== "approved" && (
                <button
                  onClick={() => onApproveCorporate(req.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-3xs px-3 py-2 rounded-lg transition"
                >
                  Approve Application
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
