"use client";

import { useState } from "react";

interface Sub {
  id: string;
  name: string;
  company: string;
  trade: string;
  phone: string;
  email: string;
  rating: number;
  status: "active" | "inactive";
}

export default function SubsPage() {
  const [subs] = useState<Sub[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    trade: "",
    phone: "",
    email: "",
  });

  const filteredSubs = subs.filter(
    (sub) =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.trade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Subcontractors</h1>
          <p className="text-slate-500 font-medium mt-2">
            Manage your subcontractors and trade partners
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium"
        >
          {showForm ? "Cancel" : "+ Add Sub"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">
            Add New Subcontractor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="Smith Electric LLC"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Trade
              </label>
              <input
                type="text"
                value={formData.trade}
                onChange={(e) =>
                  setFormData({ ...formData, trade: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="Electrical"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                placeholder="john@smithelectric.com"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium">
              Save Subcontractor
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search subs by name, company, or trade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
        />
      </div>

      {filteredSubs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
          </svg>
          <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">
            No subcontractors yet
          </h3>
          <p className="text-slate-500 font-medium mb-6">
            Add your first subcontractor to start building your network
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition font-medium"
          >
            + Add Your First Sub
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Company
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Trade
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Phone
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {sub.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sub.company}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sub.trade}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sub.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sub.email}
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
