import { useEffect, useState } from "react";
import api from "../services/api";
import Toast from "../components/Toast";
import { SkeletonChart } from "../components/Skeleton";
import { useTheme } from "../context/ThemeContext";
import {
  RefreshCw,
  BarChart3,
  CheckCircle,
  Clock,
  Ticket,
  Calendar,
  TrendingUp,
  Sparkles,
  PieChart as PieIcon,
  AlertTriangle,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Analytics() {
  const { isDark } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Date range filter states
  const [dateRangePreset, setDateRangePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const chartGridColor = isDark ? "#1e293b" : "#e2e8f0";
  const chartAxisColor = isDark ? "#94a3b8" : "#64748b";
  const chartTooltipStyle = {
    backgroundColor: isDark ? "#0f172a" : "#ffffff",
    borderColor: isDark ? "#1e293b" : "#e2e8f0",
    color: isDark ? "#f8fafc" : "#0f172a",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await api.get("/api/tickets");

      if (result && result.success) {
        setTickets(Array.isArray(result.data) ? result.data : []);
      } else if (result && result.status !== 401) {
        setError(result.message || "Unable to load tickets.");
        setToast({ message: result.message || "Unable to load tickets", type: "error" });
      }
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Unable to connect to backend.");
      setToast({ message: "Unable to connect to backend", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeTickets = Array.isArray(tickets) ? tickets : [];

  // Filter tickets based on Date Range
  const filteredTickets = safeTickets.filter((t) => {
    if (!t || !t.createdAt) return true;
    const ticketDate = new Date(t.createdAt);
    if (isNaN(ticketDate.getTime())) return false;
    const now = new Date();

    if (dateRangePreset === "7days") {
      const past7 = new Date();
      past7.setDate(now.getDate() - 7);
      return ticketDate >= past7;
    }
    if (dateRangePreset === "30days") {
      const past30 = new Date();
      past30.setDate(now.getDate() - 30);
      return ticketDate >= past30;
    }
    if (dateRangePreset === "custom") {
      if (startDate && ticketDate < new Date(startDate)) return false;
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (ticketDate > end) return false;
      }
      return true;
    }
    return true;
  });

  // Dynamic stats
  const totalTickets = filteredTickets.length;
  const resolvedTickets = filteredTickets.filter((t) => t?.status === "Resolved").length;
  const pendingTickets = filteredTickets.filter((t) => t?.status === "Pending").length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
  const highPriorityTickets = filteredTickets.filter((t) => t?.priority === "High").length;
  const criticalTickets = filteredTickets.filter((t) => t?.priority === "Critical").length;

  // Category Distribution
  const categoryDist = {};
  filteredTickets.forEach((t) => {
    const cat = t?.category || "Other";
    categoryDist[cat] = (categoryDist[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryDist).map(([name, value]) => ({ name, value }));

  // Priority Distribution
  const priorityDist = {};
  filteredTickets.forEach((t) => {
    const prio = t?.priority || "Unknown";
    priorityDist[prio] = (priorityDist[prio] || 0) + 1;
  });
  const priorityData = Object.entries(priorityDist).map(([name, value]) => ({ name, value }));

  // Sentiment Distribution
  const sentimentDist = {};
  filteredTickets.forEach((t) => {
    const sent = t?.sentiment || "Unknown";
    sentimentDist[sent] = (sentimentDist[sent] || 0) + 1;
  });
  const sentimentData = Object.entries(sentimentDist).map(([name, value]) => ({ name, value }));

  // Tickets Created Per Day Line Chart with zero-filled dates
  const buildDailyTrendData = () => {
    if (filteredTickets.length === 0) return [];

    const counts = {};
    filteredTickets.forEach((t) => {
      if (!t || !t.createdAt) return;
      const d = new Date(t.createdAt);
      if (isNaN(d.getTime())) return;
      const ymd = d.toISOString().slice(0, 10);
      counts[ymd] = (counts[ymd] || 0) + 1;
    });

    let startDateObj = new Date();
    let endDateObj = new Date();

    if (dateRangePreset === "7days") {
      startDateObj.setDate(endDateObj.getDate() - 6);
    } else if (dateRangePreset === "30days") {
      startDateObj.setDate(endDateObj.getDate() - 29);
    } else if (dateRangePreset === "custom" && startDate) {
      startDateObj = new Date(startDate);
      if (endDate) endDateObj = new Date(endDate);
    } else {
      const dates = Object.keys(counts).sort();
      if (dates.length > 0) {
        startDateObj = new Date(dates[0]);
      } else {
        startDateObj.setDate(endDateObj.getDate() - 13);
      }
    }

    const result = [];
    const curr = new Date(startDateObj);
    curr.setHours(0, 0, 0, 0);
    const last = new Date(endDateObj);
    last.setHours(23, 59, 59, 999);

    while (curr <= last) {
      const ymd = curr.toISOString().slice(0, 10);
      const formattedDate = curr.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      result.push({
        date: formattedDate,
        rawDate: ymd,
        count: counts[ymd] || 0,
      });
      curr.setDate(curr.getDate() + 1);
    }

    return result;
  };

  const dailyTrendData = buildDailyTrendData();

  const mostCommonCategory =
    categoryData.length > 0
      ? categoryData.reduce((max, item) => (item.value > max.value ? item : max), { name: "", value: 0 })
      : null;

  const mostCommonSentiment =
    sentimentData.length > 0
      ? sentimentData.reduce((max, item) => (item.value > max.value ? item : max), { name: "", value: 0 })
      : null;

  const priorityColors = {
    Low: "#10b981",
    Medium: "#f59e0b",
    High: "#f97316",
    Critical: "#f43f5e",
  };

  const sentimentColors = {
    Positive: "#10b981",
    Neutral: "#64748b",
    Frustrated: "#f97316",
    Angry: "#f43f5e",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze customer support performance, priorities, and trends.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          aria-label="Refresh analytics data"
          className="flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-lg transition text-xs font-semibold shadow-sm disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none w-full sm:w-auto"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* DATE RANGE FILTER BAR */}
      {!loading && !error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#2563EB]" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Filter Date Range:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setDateRangePreset("all")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  dateRangePreset === "all"
                    ? "bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setDateRangePreset("7days")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  dateRangePreset === "7days"
                    ? "bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateRangePreset("30days")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  dateRangePreset === "30days"
                    ? "bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateRangePreset("custom")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  dateRangePreset === "custom"
                    ? "bg-white dark:bg-slate-900 text-[#2563EB] shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Custom Range
              </button>
            </div>

            {dateRangePreset === "custom" && (
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label="Start Date"
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
                <span className="text-slate-400 font-semibold">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label="End Date"
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
            <div className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
            <div className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
            <div className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
            <div className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
            <div className="h-24 bg-white dark:bg-slate-900 rounded-xl animate-pulse border border-slate-200 dark:border-slate-800"></div>
          </div>
          <SkeletonChart />
        </div>
      )}

      {/* ERROR STATE */}
      {!loading && error && (
        <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-center rounded-xl p-8">
          <p className="text-rose-700 dark:text-rose-300 font-semibold text-xs">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ANALYTICS CONTENT */}
      {!loading && !error && (
        <>
          {/* STATS SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Tickets</p>
                  <h2 className="text-xl font-bold mt-1">{totalTickets}</h2>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <Ticket size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Resolved</p>
                  <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedTickets}</h2>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <CheckCircle size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending</p>
                  <h2 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{pendingTickets}</h2>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <Clock size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Resolution Rate</p>
                  <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{resolutionRate}%</h2>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">High Priority</p>
                  <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">{highPriorityTickets}</h2>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <AlertTriangle size={18} />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Critical</p>
                  <h2 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalTickets}</h2>
                </div>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <BarChart3 size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* DAILY TICKETS TREND LINE CHART */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-bold">Tickets Created Per Day</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daily ticket volume trend over selected period.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 rounded-full w-fit flex items-center gap-1">
                <TrendingUp size={13} />
                {dailyTrendData.length} Day(s) Tracked
              </span>
            </div>

            {dailyTrendData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No data for this period
              </div>
            ) : (
              <div className="w-full h-72 sm:h-80 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="date" stroke={chartAxisColor} fontSize={11} />
                    <YAxis allowDecimals={false} stroke={chartAxisColor} fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Tickets Created"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* CATEGORY BAR CHART */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-base font-bold">Ticket Categories</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Distribution of support tickets by category.</p>

            {categoryData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-lg mt-4">
                No data for this period
              </div>
            ) : (
              <div className="w-full h-72 sm:h-80 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid stroke={chartGridColor} strokeDasharray="3 3" opacity={0.5} />
                    <XAxis dataKey="name" stroke={chartAxisColor} fontSize={11} />
                    <YAxis allowDecimals={false} stroke={chartAxisColor} fontSize={11} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="value" name="Tickets" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* PRIORITY & SENTIMENT PIE CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Priority Pie */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold">Priority Distribution</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Number of tickets by priority level.</p>

              {priorityData.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-lg mt-4">
                  No data for this period
                </div>
              ) : (
                <div className="w-full h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                        {priorityData.map((entry, index) => (
                          <Cell key={`priority-${index}`} fill={priorityColors[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Sentiment Pie */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-bold">Customer Sentiment</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customer emotional sentiment from analyzed tickets.</p>

              {sentimentData.length === 0 ? (
                <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold border border-dashed border-slate-200 dark:border-slate-800 rounded-lg mt-4">
                  No data for this period
                </div>
              ) : (
                <div className="w-full h-72 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                        {sentimentData.map((entry, index) => (
                          <Cell key={`sentiment-${index}`} fill={sentimentColors[entry.name] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* INSIGHTS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold">Support Insights</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Quick insights from filtered support ticket data.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Most Common Category</p>
                <h3 className="text-base font-bold mt-1">{mostCommonCategory?.name ? mostCommonCategory.name : "No data"}</h3>
                {mostCommonCategory?.name && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{mostCommonCategory.value} tickets</p>}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Resolution Performance</p>
                <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolutionRate}%</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">of tickets resolved</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Dominant Sentiment</p>
                <h3 className="text-base font-bold text-orange-600 dark:text-orange-400 mt-1">{mostCommonSentiment?.name ? mostCommonSentiment.name : "No data"}</h3>
                {mostCommonSentiment?.name && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{mostCommonSentiment.value} tickets</p>}
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg p-3.5">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Immediate Attention</p>
                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1">{criticalTickets} Critical</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Require immediate review</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;