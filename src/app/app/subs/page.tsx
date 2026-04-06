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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subcontractors</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your subcontractors and trade partners
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
        >
          {showForm ? "Cancel" : "+ Add Sub"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Add New Subcontractor
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Smith Electric LLC"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trade
              </label>
              <input
                type="text"
                value={formData.trade}
                onChange={(e) =>
                  setFormData({ ...formData, trade: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Electrical"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="john@smithelectric.com"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm">
              Save Subcontractor
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search subs by name, company, or trade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {filteredSubs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-4">👷</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No subcontractors yet
          </h3>
          <p className="text-slate-500 text-sm mb-4">
            Add your first subcontractor to start building your network
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium text-sm"
          >
            + Add Your First Sub
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                  Company
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                  Trade
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                  Phone
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {sub.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {sub.company}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {sub.trade}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {sub.phone}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
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
