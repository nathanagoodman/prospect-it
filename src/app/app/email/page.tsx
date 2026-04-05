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
      <div className="p-8">
        <div className="text-center text-slate-500">Loading sequences...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Email Sequences</h1>
          <p className="text-slate-500 mt-1">Create and manage outreach email templates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + New Sequence
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {editingId ? "Edit Sequence" : "Create New Sequence"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sequence Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Follow-up After Quote"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Delay (days)
                </label>
                <input
                  type="number"
                  value={formData.delayDays}
                  onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="Days before sending"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Following up on your project quote"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Body *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Write your email template here..."
                required
                rows={8}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 Use &#123;&#123;clientName&#125;&#125;, &#123;&#123;jobName&#125;&#123;, and &#123;&#123;bidAmount&#125;&#125; for dynamic content
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {editingId ? "Update Sequence" : "Create Sequence"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-200 hover:bg-slate-300 text-slate-900 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sequences List */}
      {sequences.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-500 mb-4">No email sequences yet. Create your first one!</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Sequence
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sequences.map((sequence) => (
            <div
              key={sequence.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-slate-900 flex-1">{sequence.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(sequence)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(sequence.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase mb-1">Subject</p>
                  <p className="text-sm text-slate-700">{sequence.subject}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase mb-1">Preview</p>
                  <p className="text-sm text-slate-600 line-clamp-3">{sequence.body}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    {sequence.delayDays > 0 ? `Send after ${sequence.delayDays} days` : "Send immediately"}
                  </div>
                  <span className="text-xs text-slate-400">
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
