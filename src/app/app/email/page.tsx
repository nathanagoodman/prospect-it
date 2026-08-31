"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EmailSequence {
  id: string;
  name: string;
  subject: string;
  body: string;
  delayDays: number;
  createdAt: string;
}

export default function EmailPage() {
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    delayDays: 0,
  });

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    try {
      // For now, initialize with empty sequences
      // In a real app, this would fetch from /api/email-sequences
      setSequences([]);
    } catch (error) {
      console.error("Error fetching sequences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.subject || !formData.body) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editingId) {
        // Update existing
        const updated = sequences.map((s) =>
          s.id === editingId
            ? {
                ...s,
                ...formData,
              }
            : s
        );
        setSequences(updated);
        setEditingId(null);
      } else {
        // Create new
        const newSequence: EmailSequence = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setSequences([newSequence, ...sequences]);
      }

      setFormData({
        name: "",
        subject: "",
        body: "",
        delayDays: 0,
      });
      setShowForm(false);
    } catch (error) {
      console.error("Error saving sequence:", error);
      alert("Failed to save sequence");
    }
  };

  const handleEdit = (sequence: EmailSequence) => {
    setFormData({
      name: sequence.name,
      subject: sequence.subject,
      body: sequence.body,
      delayDays: sequence.delayDays,
    });
    setEditingId(sequence.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this sequence?")) {
      setSequences(sequences.filter((s) => s.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      delayDays: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center text-slate-500">Loading sequences...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* This page has no backend yet — sequences live in React state only
          and are lost on refresh. Say so plainly rather than letting people
          build something that silently disappears. */}
      <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
        <p className="font-semibold text-amber-900">
          Preview — sequences aren&apos;t saved yet
        </p>
        <p className="mt-1 text-sm leading-relaxed text-amber-800">
          You can explore the editor, but nothing here is stored and no emails
          are sent. Anything you write will be lost when you leave the page.
          We&apos;ll turn this on once sending is wired up.
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Email Sequences</h1>
          <p className="text-slate-500 font-medium mt-2">Create and manage outreach email templates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          + New Sequence
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-6">
            {editingId ? "Edit Sequence" : "Create New Sequence"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Sequence Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Follow-up After Quote"
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Delay (days)
                </label>
                <input
                  type="number"
                  value={formData.delayDays}
                  onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="Days before sending"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Following up on your project quote"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Body *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your email template here..."
                required
                rows={8}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                Use &#123;&#123;clientName&#125;&#125;, &#123;&#123;jobName&#125;&#125;, and &#123;&#123;bidAmount&#125;&#125; for dynamic content
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                {editingId ? "Update Sequence" : "Create Sequence"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sequences List */}
      {sequences.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-black tracking-tight text-slate-900 mb-2">No email sequences yet</h3>
          <p className="text-slate-500 font-medium mb-6">Create your first email sequence to start automating outreach</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Create Your First Sequence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sequences.map((sequence) => (
            <div
              key={sequence.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-sm transition-shadow shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-black tracking-tight text-slate-900 flex-1">{sequence.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(sequence)}
                    className="text-slate-600 hover:text-slate-900 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sequence.id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Subject</p>
                  <p className="text-sm text-slate-700">{sequence.subject}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Preview</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{sequence.body}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    {sequence.delayDays > 0 ? `Send after ${sequence.delayDays} days` : "Send immediately"}
                  </div>
                  <span className="text-xs text-slate-500">
                    Created {new Date(sequence.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
