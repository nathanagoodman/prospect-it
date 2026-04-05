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
      <div className="p-8">
        <div className="text-center text-slate-500">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-500 mt-1">Track and manage all your projects</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Table
            </button>
          </div>
          <Link
            href="/app/jobs/new"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + New Job
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-500 mb-4">No jobs yet. Create your first job to get started!</p>
          <Link
            href="/app/jobs/new"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Job
          </Link>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <div className="grid grid-cols-5 gap-6 overflow-x-auto pb-4">
          {JOB_STATUSES.map((status) => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className="bg-slate-50 rounded-lg p-4 min-h-96">
                <h3 className="font-bold text-slate-900 mb-4">{STATUS_DISPLAY[status]}</h3>
                <div className="space-y-3">
                  {jobsByStatus[status].map((job) => (
                    <div
                      key={job.id}
                      className="bg-white p-4 rounded border border-slate-200 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-slate-900 mb-2">{job.name}</h4>
                      <div className="text-sm text-slate-600 space-y-1 mb-3">
                        <p>Amount: ${job.contractAmount.toLocaleString()}</p>
                        {job.startDate && (
                          <p>Start: {new Date(job.startDate).toLocaleDateString()}</p>
                        )}
                      </div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
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
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Job Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Contract Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  End Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{job.name}</td>
                  <td className="px-6 py-4 text-slate-600">${job.contractAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[job.status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {STATUS_DISPLAY[job.status] || job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
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
