"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

const CLIENT_STATUSES = ["LEAD", "PROSPECT", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"];

const STATUS_COLORS: { [key: string]: string } = {
  LEAD: "bg-slate-100 text-slate-800",
  PROSPECT: "bg-blue-100 text-blue-800",
  QUALIFIED: "bg-cyan-100 text-cyan-800",
  PROPOSAL_SENT: "bg-purple-100 text-purple-800",
  NEGOTIATION: "bg-yellow-100 text-yellow-800",
  WON: "bg-green-100 text-green-800",
  LOST: "bg-red-100 text-red-800",
};

const STATUS_DISPLAY: { [key: string]: string } = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  QUALIFIED: "Qualified",
  PROPOSAL_SENT: "Proposal Sent",
  NEGOTIATION: "Negotiation",
  WON: "Won",
  LOST: "Lost",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"pipeline" | "list">("pipeline");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "LEAD",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = (await res.json()) as Client[];
      setClients(data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newClient = (await res.json()) as Client;
        setClients([newClient, ...clients]);
        setFormData({ name: "", company: "", email: "", phone: "", status: "LEAD" });
        setShowForm(false);
      } else {
        alert("Error creating client");
      }
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Failed to create client");
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const clientsByStatus = CLIENT_STATUSES.reduce(
    (acc, status) => {
      acc[status] = filteredClients.filter((client) => client.status === status);
      return acc;
    },
    {} as { [key: string]: Client[] }
  );

  if (loading) {
    return (
      <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
        <div className="text-center text-slate-400">
          <div className="inline-block">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your sales pipeline and client relationships</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors duration-200"
        >
          New Client
        </button>
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Add New Client</h3>
          <form onSubmit={handleSubmitClient} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Client Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 transition-all duration-200"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 transition-all duration-200"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 transition-all duration-200"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900 transition-all duration-200"
            >
              {CLIENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_DISPLAY[status]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors duration-200 md:col-span-1"
            >
              Add
            </button>
          </form>
        </div>
      )}

      {/* Search and View Controls */}
      <div className="flex items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400 transition-all duration-200"
        />
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode("pipeline")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              viewMode === "pipeline"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="mb-6 flex justify-center">
            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20h12a6 6 0 00-6-6 6 6 0 00-6 6z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {searchQuery ? "No clients match your search" : "No clients yet"}
          </h3>
          <p className="text-slate-500 font-medium mb-6">
            {searchQuery ? "Try adjusting your search" : "Get started by adding your first client"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors duration-200"
            >
              Add Your First Client
            </button>
          )}
        </div>
      ) : viewMode === "pipeline" ? (
        /* Pipeline View */
        <div className="grid grid-cols-7 gap-4 overflow-x-auto pb-4">
          {CLIENT_STATUSES.map((status) => (
            <div key={status} className="flex-shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 min-h-96 shadow-sm">
                <div className="mb-6 pb-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900 text-base">{STATUS_DISPLAY[status]}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-2">{clientsByStatus[status].length} clients</p>
                </div>
                <div className="space-y-2">
                  {clientsByStatus[status].map((client) => (
                    <div
                      key={client.id}
                      className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 text-sm"
                    >
                      <h4 className="font-semibold text-slate-900 truncate">{client.name}</h4>
                      {client.company && (
                        <p className="text-xs text-slate-500 truncate mt-1">{client.company}</p>
                      )}
                      {client.email && (
                        <p className="text-xs text-slate-500 truncate mt-1">{client.email}</p>
                      )}
                      {client.phone && (
                        <p className="text-xs text-slate-500 truncate">{client.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                  <td className="px-8 py-4 font-medium text-slate-900">{client.name}</td>
                  <td className="px-8 py-4 text-slate-600">{client.company || "—"}</td>
                  <td className="px-8 py-4 text-slate-600">{client.email || "—"}</td>
                  <td className="px-8 py-4 text-slate-600">{client.phone || "—"}</td>
                  <td className="px-8 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_COLORS[client.status] || "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {STATUS_DISPLAY[client.status] || client.status}
                    </span>
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
