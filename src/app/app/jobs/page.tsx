"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Job {
  id: string;
  name: string;
  clientId: string;
  contractAmount: number;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

const JOB_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "PUNCH_LIST", "COMPLETED"];

const STATUS_COLORS: { [key: string]: string } = {
  NOT_STARTED: "bg-slate-100 text-slate-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  ON_HOLD: "bg-yellow-100 text-yellow-800",
  PUNCH_LIST: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
};

const STATUS_DISPLAY: { [key: string]: string } = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  PUNCH_LIST: "Punch List",
  COMPLETED: "Completed",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // For now, simulate with empty data since jobs API may not be fully set up
      setJobs([]);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const jobsByStatus = JOB_STATUSES.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status);
      return acc;
    },
    {} as { [key: string]: Job[] }
  );

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center text-slate-400">
          <div className="inline-block">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Jobs</h1>
          <p className="text-slate-500 font-medium mt-2">Track and manage all your projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Table
            </button>
          </div>
          <Link
            href="/app/jobs/new"
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors duration-200"
          >
            New Job
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No jobs yet</h3>
          <p className="text-slate-500 font-medium mb-6">Get started by creating your first job</p>
          <Link
            href="/app/jobs/new"
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors duration-200"
          >
            Create Your First Job
          </Link>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="grid grid-cols-5 gap-6 overflow-x-auto pb-4">
          {JOB_STATUSES.map((status) => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-96 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 text-lg">{STATUS_DISPLAY[status]}</h3>
                <div className="space-y-3">
                  {jobsByStatus[status].map((job) => (
                    <div
                      key={job.id}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                    >
                      <h4 className="font-semibold text-slate-900 mb-3">{job.name}</h4>
                      <div className="text-sm text-slate-600 space-y-1 mb-4">
                        <p>Amount: ${job.contractAmount.toLocaleString()}</p>
                        {job.startDate && (
                          <p>Start: {new Date(job.startDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          STATUS_COLORS[status]
                        }`}
                      >
                        {STATUS_DISPLAY[status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Job Name
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Contract Amount
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="px-8 py-4 font-medium text-slate-900">{job.name}</td>
                  <td className="px-8 py-4 text-slate-600">${job.contractAmount.toLocaleString()}</td>
                  <td className="px-8 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_COLORS[job.status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {STATUS_DISPLAY[job.status] || job.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-slate-600">
                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-8 py-4 text-slate-600">
                    {job.endDate ? new Date(job.endDate).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
