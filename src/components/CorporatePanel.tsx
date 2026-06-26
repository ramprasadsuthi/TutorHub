import React, { useState, useEffect } from "react";
import { Building, Sparkles, ShieldCheck, CheckCircle2, Award, Briefcase, Plus } from "lucide-react";
import { motion } from "motion/react";
import { CorporateClient } from "../types";

interface CorporatePanelProps {
  onOnboard: (companyName: string, domain: string, employeesCount: number) => void;
  requests: CorporateClient[];
}

export default function CorporatePanel({ onOnboard, requests }: CorporatePanelProps) {
  const [companyName, setCompanyName] = useState("");
  const [domain, setDomain] = useState("");
  const [employees, setEmployees] = useState(50);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !domain) return;
    onOnboard(companyName, domain, employees);
    setSubmitted(true);
    setCompanyName("");
    setDomain("");
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div id="corporate-panel-container" className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
      {/* Left Column: Onboarding Form */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Building size={20} className="text-indigo-600" />
          <h3 className="font-extrabold text-slate-800 text-base">Corporate & University Onboarding</h3>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed">
          Unlock platform-wide employee learning credits, dedicated SaaS administrative features, custom white-label subdomains, and corporate invoice structures. Register your enterprise today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-3xs font-bold text-slate-500 uppercase">Organization / University Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Stanford University, Acme Tech"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Official Corporate Domain</label>
              <input
                type="text"
                required
                placeholder="e.g., acme.com, stanford.edu"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-3xs font-bold text-slate-500 uppercase">Approximate Employee / Learner Size</label>
              <select
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-slate-600"
              >
                <option value={50}>10 - 50 Learners</option>
                <option value={200}>51 - 200 Learners</option>
                <option value={1000}>201 - 1000 Learners</option>
                <option value={5000}>1001+ Learners</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Submit Enterprise Application
          </button>
        </form>

        {submitted && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="text-3xs font-bold">Your corporate application is registered. An administrator will review your domain registration records.</span>
          </div>
        )}
      </div>

      {/* Right Column: Platform Corporate Benefits */}
      <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles size={14} />
            Enterprise White-Label Integration
          </div>

          <h3 className="text-2xl font-bold tracking-tight">Enterprise & University Master Classes</h3>
          <p className="text-indigo-200 text-xs leading-relaxed">
            Configure custom portals mapped directly to your internal directories. Grant credits to department coordinators, schedule cohort lectures, track compliance certifications, and access high-volume API configurations.
          </p>

          <div className="space-y-4 pt-4 border-t border-indigo-900">
            <div className="flex gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-lg shrink-0">
                <ShieldCheck className="text-indigo-400" size={16} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">Credentialed SSO Integration</h4>
                <p className="text-indigo-300 text-3xs">Authorize access via SAML, Okta, OAuth, or university directories.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-lg shrink-0">
                <Award className="text-indigo-400" size={16} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">Accredited QR Certifications</h4>
                <p className="text-indigo-300 text-3xs">Provide graduates with cryptographically verifiable learning certifications.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="bg-indigo-500/10 p-2 rounded-lg shrink-0">
                <Briefcase className="text-indigo-400" size={16} />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs">Dedicated Service Level Agreement</h4>
                <p className="text-indigo-300 text-3xs">Enjoy premium 24/7 priority customer support and dedicated client coordinators.</p>
              </div>
            </div>
          </div>
        </div>

        {requests.length > 0 && (
          <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left">
            <h4 className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 mb-2">Registered Corporate Clients</h4>
            <div className="space-y-2">
              {requests.map((r) => (
                <div key={r.id} className="flex justify-between items-center text-3xs">
                  <span className="text-white font-bold">{r.companyName}</span>
                  <span className="text-emerald-400 font-bold capitalize bg-emerald-500/10 px-2 py-0.5 rounded">{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
