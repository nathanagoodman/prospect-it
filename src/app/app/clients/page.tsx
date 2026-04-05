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
      <div className="p-8">
        <div className="text-center text-slate-500">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage your sales pipeline and client relationships</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          + New Client
        </button>
      </div>

      {/* Quick Add Form */}
      {showForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Client</h3>
          <form onSubmit={handleSubmitClient} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Client Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {CLIENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_DISPLAY[status]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors md:col-span-1"
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
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("pipeline")}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === "pipeline"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center">
          <p className="text-slate-500 mb-4">
            {searchQuery ? "No clients match your search." : "No clients yet. Add your first client!"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
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
              <div className="bg-slate-50 rounded-lg p-4 min-h-96">
                <div className="mb-4 pb-3 border-b border-slate-200">
                  <h3 className="font-bold text-slate-900">{STATUS_DISPLAY[status]}</h3>
                  <p className="text-xs text-slate-500 mt-1">{clientsByStatus[status].length} clients</p>
                </div>
                <div className="space-y-2">
                  {clientsByStatus[status].map((client) => (
                    <div
                      key={client.id}
                      className="bg-white p-3 rounded border border-slate-200 hover:shadow-md transition-shadow text-sm"
                    >
                      <h4 className="font-medium text-slate-900 truncate">{client.name}</h4>
                      {client.company && (
                        <p className="text-xs text-slate-500 truncate">{client.company}</p>
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
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{client.name}</td>
                  <td className="px-6 py-4 text-slate-600">{client.company || "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{client.email || "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{client.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
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
