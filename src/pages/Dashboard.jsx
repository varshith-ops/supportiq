import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Toast from "../components/Toast";
import { SkeletonCard, SkeletonTicket } from "../components/Skeleton";

import {
  Ticket,
  Clock,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function Dashboard({ setPage }) {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    highPriorityTickets: 0,
    criticalTickets: 0,
  });

  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await api.get("/api/dashboard/stats");

      if (result.success) {
        setStats(result.data);
        setRecentTickets(result.data.recentTickets || []);
      } else if (result.status !== 401) {
        setError(result.message || "Failed to fetch dashboard statistics.");
        setToast({ message: result.message || "Failed to fetch stats", type: "error" });
      }
    } catch (err) {
      console.error("Dashboard stats error:", err);
      setError("Unable to connect to backend.");
      setToast({ message: "Unable to connect to backend", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const resolutionRate =
    stats.totalTickets > 0
      ? Math.round((stats.resolvedTickets / stats.totalTickets) * 100)
      : 0;

  const getStatusStyle = (status) => {
    if (status === "Resolved") {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
    }
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
      case "High":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
      default:
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
    }
  };

  const getSentimentStyle = (sentiment) => {
    switch (sentiment) {
      case "Angry":
        return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800";
      case "Frustrated":
        return "bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-800";
      case "Positive":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* HEADER WITH ONE-LINE GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Welcome back, <span className="font-semibold text-slate-900 dark:text-slate-100">{user?.name || "Agent"}</span> • Support operations overview.
          </p>
        </div>

        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          aria-label="Refresh dashboard data"
          className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg transition text-sm font-semibold shadow-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none w-full sm:w-auto"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center justify-between gap-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle size={18} className="shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 COMPACT STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Tickets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tickets</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.totalTickets}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <Ticket size={20} />
                </div>
              </div>
            </div>

            {/* Pending Tickets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Tickets</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.pendingTickets}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <Clock size={20} />
                </div>
              </div>
            </div>

            {/* Resolved Tickets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolved Tickets</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{stats.resolvedTickets}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>

            {/* Resolution Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Resolution Rate</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{resolutionRate}%</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <BarChart3 size={20} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ATTENTION REQUIRED CARDS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-rose-600 dark:text-rose-400" />
            <h2 className="text-lg font-bold">Attention Required</h2>
          </div>
          {setPage && (
            <button
              onClick={() => setPage("tickets")}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md outline-none"
            >
              Review Tickets <ArrowRight size={14} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/60 rounded-lg text-rose-600 dark:text-rose-400 shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Critical Tickets</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immediate SLA action needed</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {loading ? "..." : stats.criticalTickets}
            </span>
          </div>

          <div className="bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/60 rounded-lg text-orange-600 dark:text-orange-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">High Priority</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Important pending queries</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {loading ? "..." : stats.highPriorityTickets}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS & WORKLOAD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold">Support Resolution Progress</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Workload status breakdown</p>
            </div>
            <TrendingUp size={18} className="text-slate-400" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Pending Workload ({stats.pendingTickets})</span>
                <span>{stats.totalTickets > 0 ? `${Math.round((stats.pendingTickets / stats.totalTickets) * 100)}%` : "0%"}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${stats.totalTickets > 0 ? Math.min((stats.pendingTickets / stats.totalTickets) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span>Resolved Workload ({stats.resolvedTickets})</span>
                <span>{stats.totalTickets > 0 ? `${Math.round((stats.resolvedTickets / stats.totalTickets) * 100)}%` : "0%"}</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${stats.totalTickets > 0 ? Math.min((stats.resolvedTickets / stats.totalTickets) * 100, 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-[#2563EB]" />
              <h2 className="text-base font-bold">AI Queue Focus</h2>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {stats.criticalTickets > 0 ? (
                <p>
                  You have <strong className="text-rose-600 dark:text-rose-400">{stats.criticalTickets} critical ticket(s)</strong> needing immediate response to prevent SLA breaches.
                </p>
              ) : stats.pendingTickets > 0 ? (
                <p>
                  You have <strong className="text-amber-600 dark:text-amber-400">{stats.pendingTickets} pending ticket(s)</strong> awaiting response. Maintain high resolution velocity.
                </p>
              ) : (
                <p>All clear! All support tickets are currently resolved.</p>
              )}
            </div>
          </div>

          {setPage && (
            <button
              onClick={() => setPage("tickets")}
              className="mt-4 w-full py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
            >
              Go to Tickets <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* COMPACT RECENT TICKETS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold">Recent Tickets</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest customer support requests</p>
          </div>

          {setPage && (
            <button
              onClick={() => setPage("tickets")}
              className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md outline-none"
            >
              View All <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonTicket />
            <SkeletonTicket />
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No recent tickets available.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentTickets.map((t) => (
              <div key={t._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-950/50 px-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <Ticket size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      #{t._id ? t._id.slice(-6).toUpperCase() : "1001"}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                      {t.category}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                      {t.summary || t.query}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getPriorityStyle(t.priority)}`}>
                    {t.priority}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getStatusStyle(t.status)}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;