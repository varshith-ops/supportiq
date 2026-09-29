import { useEffect, useState } from "react";
import api from "../services/api";
import Toast from "../components/Toast";
import { SkeletonTicket } from "../components/Skeleton";
import {
  Search,
  RefreshCw,
  Ticket as TicketIcon,
  X,
  CheckCircle,
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const exportToCSV = () => {
    if (filteredTickets.length === 0) {
      setToast({ message: "No tickets available to export", type: "info" });
      return;
    }

    const headers = [
      "Ticket ID",
      "Category",
      "Summary",
      "Query",
      "Intent",
      "Priority",
      "Sentiment",
      "Status",
      "Created Date",
    ];

    const rows = filteredTickets.map((t) => [
      t._id ? `Ticket #${t._id.slice(-6).toUpperCase()}` : "",
      t.category || "",
      t.summary || "",
      t.query || "",
      t.intent || "",
      t.priority || "",
      t.sentiment || "",
      t.status || "",
      t.createdAt ? new Date(t.createdAt).toLocaleString() : "",
    ]);

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map((row) =>
        row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `supportiq_tickets_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToast({
      message: `Exported ${filteredTickets.length} ticket(s) to CSV!`,
      type: "success",
    });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await api.get("/api/tickets");

      if (result.success) {
        setTickets(result.data || []);
      } else if (result.status !== 401) {
        setError(result.message || "Failed to fetch tickets");
        setToast({ message: result.message || "Failed to fetch tickets", type: "error" });
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
      setError("Unable to connect to server");
      setToast({ message: "Unable to connect to server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id) => {
    try {
      const result = await api.put(`/api/tickets/${id}/status`, {
        status: "Resolved",
      });

      if (!result.success) {
        if (result.status !== 401) {
          setToast({ message: result.message || "Failed to update ticket", type: "error" });
        }
        return;
      }

      setToast({ message: "Ticket marked as resolved!", type: "success" });
      fetchTickets();
      setSelectedTicket((prev) => (prev && prev._id === id ? { ...prev, status: "Resolved" } : prev));
    } catch (err) {
      console.error("Update status error:", err);
      setToast({ message: "Server error while updating ticket", type: "error" });
    }
  };

  const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  const sentimentWeight = { Angry: 4, Frustrated: 3, Neutral: 2, Positive: 1 };

  const filteredTickets = tickets
    .filter((ticket) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        ticket.category?.toLowerCase().includes(searchText) ||
        ticket.intent?.toLowerCase().includes(searchText) ||
        ticket.summary?.toLowerCase().includes(searchText) ||
        ticket.query?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "priority-desc") {
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      }
      if (sortBy === "priority-asc") {
        return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      }
      if (sortBy === "sentiment-desc") {
        return (sentimentWeight[b.sentiment] || 0) - (sentimentWeight[a.sentiment] || 0);
      }
      if (sortBy === "sentiment-asc") {
        return (sentimentWeight[a.sentiment] || 0) - (sentimentWeight[b.sentiment] || 0);
      }
      return 0;
    });

  // Pagination calculation
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const paginatedTickets = filteredTickets.slice(startIndex, startIndex + itemsPerPage);

  const getSLAInfo = (ticket) => {
    if (ticket.status === "Resolved") return null;

    const createdTime = new Date(ticket.createdAt || Date.now()).getTime();
    const now = Date.now();
    const diffMs = Math.max(0, now - createdTime);
    const diffHours = diffMs / (1000 * 60 * 60);

    if (ticket.priority === "Critical") {
      if (diffHours >= 2) {
        const hrs = Math.floor(diffHours);
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
          breached: true,
          label: `Breached (${hrs}h ${mins}m)`,
        };
      } else {
        const remainingMins = Math.ceil(120 - diffHours * 60);
        return {
          breached: false,
          label: `${remainingMins}m left`,
        };
      }
    }

    if (ticket.priority === "High") {
      if (diffHours >= 6) {
        const hrs = Math.floor(diffHours);
        return {
          breached: true,
          label: `Breached (${hrs}h)`,
        };
      }
    }

    return null;
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      case "Low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
    }
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  };

  const getSentimentClass = (sentiment) => {
    switch (sentiment) {
      case "Angry":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
      case "Frustrated":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "Positive":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* HEADER */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-normal">Support Tickets</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and resolve customer support requests
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={exportToCSV}
              disabled={loading || filteredTickets.length === 0}
              aria-label="Export tickets to CSV"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition text-xs font-semibold focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none flex-1 sm:flex-initial"
            >
              <Download size={15} />
              Export CSV
            </button>

            <button
              onClick={fetchTickets}
              disabled={loading}
              aria-label="Refresh ticket list"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg transition text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none flex-1 sm:flex-initial"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 md:p-8">
        {/* SEARCH & FILTERS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Search tickets by text"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter tickets by status"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter tickets by priority"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort tickets"
              className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
              <option value="priority-desc">Sort: Priority (Highest)</option>
              <option value="priority-asc">Sort: Priority (Lowest)</option>
              <option value="sentiment-desc">Sort: Sentiment (Most Negative)</option>
              <option value="sentiment-asc">Sort: Sentiment (Most Positive)</option>
            </select>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-3">
            <SkeletonTicket />
            <SkeletonTicket />
            <SkeletonTicket />
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-center rounded-xl p-8">
            <p className="text-rose-700 dark:text-rose-300 font-semibold text-sm">{error}</p>
            <button
              onClick={fetchTickets}
              className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredTickets.length === 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm">
            <TicketIcon size={36} className="mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold">No tickets found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm mx-auto">
              No matching tickets found for your search criteria.
            </p>
            {(search || statusFilter !== "All" || priorityFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setPriorityFilter("All");
                  setCurrentPage(1);
                }}
                className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* TICKETS TABLE WITH STICKY HEADER & ROW HOVER */}
        {!loading && !error && filteredTickets.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800/90 backdrop-blur-sm text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 z-10">
                  <tr>
                    <th scope="col" className="px-4 py-3">ID</th>
                    <th scope="col" className="px-4 py-3">Summary</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Priority</th>
                    <th scope="col" className="px-4 py-3">Sentiment</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">SLA</th>
                    <th scope="col" className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/70">
                  {paginatedTickets.map((ticket) => {
                    const sla = getSLAInfo(ticket);
                    return (
                      <tr
                        key={ticket._id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition duration-150"
                      >
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          {ticket.id || `#${ticket._id.slice(-6).toUpperCase()}`}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {ticket.summary || ticket.query}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {ticket.category}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getPriorityClass(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getSentimentClass(ticket.sentiment)}`}>
                            {ticket.sentiment}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusClass(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {sla ? (
                            <span
                              className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full flex items-center gap-1 w-fit ${
                                sla.breached
                                  ? "bg-rose-600 text-white animate-pulse"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                              }`}
                            >
                              <Clock size={11} />
                              {sla.label}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            aria-label="View ticket details"
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                          >
                            <Eye size={13} />
                            View
                          </button>
                          {ticket.status === "Pending" && (
                            <button
                              onClick={() => updateStatus(ticket._id)}
                              aria-label="Mark ticket as resolved"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                            >
                              <CheckCircle size={13} />
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-bold text-slate-900 dark:text-slate-100">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {Math.min(startIndex + itemsPerPage, filteredTickets.length)}
                </span>{" "}
                of <span className="font-bold text-slate-900 dark:text-slate-100">{filteredTickets.length}</span> tickets
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validPage === 1}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 font-semibold transition flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <span className="font-bold px-2">
                  Page {validPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validPage >= totalPages}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 font-semibold transition flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* VIEW TICKET DETAILS SIDE DRAWER */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedTicket(null)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Side Drawer */}
          <aside
            className="fixed inset-y-0 right-0 max-w-full flex pl-10 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
          >
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 id="drawer-title" className="text-lg font-bold">Ticket Details</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedTicket.id || `#${selectedTicket._id.slice(-6).toUpperCase()}`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  aria-label="Close details side drawer"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Customer Query</p>
                  <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs leading-relaxed font-medium">
                    {selectedTicket.query || "No query text"}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">AI Summary</p>
                  <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg p-3 text-xs leading-relaxed font-medium">
                    {selectedTicket.summary || "No summary available"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Category</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selectedTicket.category}</p>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Intent</p>
                    <p className="font-bold mt-0.5">{selectedTicket.intent}</p>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Priority</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getPriorityClass(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Sentiment</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getSentimentClass(selectedTicket.sentiment)}`}>
                      {selectedTicket.sentiment}
                    </span>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/80">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Close
                </button>

                {selectedTicket.status === "Pending" && (
                  <button
                    onClick={() => updateStatus(selectedTicket._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Tickets;