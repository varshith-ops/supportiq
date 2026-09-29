import { useState } from "react";
import api from "../services/api";
import Toast from "../components/Toast";
import {
  Sparkles,
  Save,
  RefreshCw,
  MessageSquare,
  Copy,
  Check,
  Zap,
} from "lucide-react";

const EXAMPLE_QUERIES = [
  "My order #9482 was marked as delivered yesterday but I haven't received it!",
  "I was double charged on my monthly subscription invoice this morning.",
  "Cannot log in to my account due to an error during 2FA verification.",
];

const getClientFallbackAnalysis = (q) => {
  const text = q.toLowerCase();
  let category = "Other";
  let priority = "Medium";
  let sentiment = "Neutral";
  let intent = "Customer is requesting support regarding their issue.";
  let summary = "Customer reported an issue and is requesting assistance.";

  if (
    text.includes("delivery") ||
    text.includes("delivered") ||
    text.includes("ship") ||
    text.includes("order")
  ) {
    category = "Delivery";
    intent = "Customer reporting issue with order delivery or shipping.";
    summary = "Customer experiencing order delivery delay or tracking issue.";
  } else if (
    text.includes("payment") ||
    text.includes("paid") ||
    text.includes("charge") ||
    text.includes("bill")
  ) {
    category = "Payment";
    intent = "Customer reporting payment or billing issue.";
    summary = "Customer experiencing payment or duplicate billing problem.";
  } else if (
    text.includes("refund") ||
    text.includes("money back") ||
    text.includes("return")
  ) {
    category = "Refund";
    intent = "Customer inquiring about refund or return.";
    summary = "Customer requesting status or assistance with a refund.";
  } else if (
    text.includes("broken") ||
    text.includes("error") ||
    text.includes("bug") ||
    text.includes("crash") ||
    text.includes("not working")
  ) {
    category = "Technical";
    intent = "Customer reporting technical error or software issue.";
    summary = "Customer encountering software bug or technical glitch.";
  } else if (
    text.includes("account") ||
    text.includes("login") ||
    text.includes("password") ||
    text.includes("2fa")
  ) {
    category = "Account";
    intent = "Customer requesting account access or login assistance.";
    summary = "Customer experiencing account access or password issue.";
  } else if (
    text.includes("product") ||
    text.includes("damaged") ||
    text.includes("item")
  ) {
    category = "Product";
    intent = "Customer reporting issue with received product.";
    summary = "Customer reporting product defect or physical damage.";
  }

  if (
    text.includes("angry") ||
    text.includes("furious") ||
    text.includes("terrible") ||
    text.includes("worst") ||
    text.includes("asap")
  ) {
    sentiment = "Angry";
  } else if (
    text.includes("frustrated") ||
    text.includes("disappointed") ||
    text.includes("issue") ||
    text.includes("problem")
  ) {
    sentiment = "Frustrated";
  } else if (
    text.includes("thank") ||
    text.includes("great") ||
    text.includes("good") ||
    text.includes("happy")
  ) {
    sentiment = "Positive";
  }

  if (
    text.includes("urgent") ||
    text.includes("emergency") ||
    text.includes("critical") ||
    text.includes("immediately")
  ) {
    priority = "Critical";
  } else if (
    text.includes("wrong") ||
    text.includes("failed") ||
    text.includes("asap") ||
    text.includes("broken")
  ) {
    priority = "High";
  } else if (
    text.includes("when") ||
    text.includes("how") ||
    text.includes("info")
  ) {
    priority = "Low";
  }

  return {
    summary,
    category,
    intent,
    priority,
    sentiment,
    status: "Pending",
    isFallback: true,
  };
};

function Analyze() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!generatedResponse) return;
    navigator.clipboard.writeText(generatedResponse);
    setCopied(true);
    setToast({ message: "Response copied to clipboard!", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const analyzeQuery = async (queryToUse) => {
    const targetQuery = typeof queryToUse === "string" ? queryToUse : query;
    if (!targetQuery.trim()) {
      setToast({ message: "Please enter a customer query", type: "info" });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setSaved(false);
      setGeneratedResponse("");

      const data = await api.post("/api/analyze", { query: targetQuery });

      let analysisResult;
      if (data && data.success && data.data) {
        analysisResult = data.data;
      } else {
        analysisResult = getClientFallbackAnalysis(targetQuery);
      }
      setResult(analysisResult);

      // Auto generate suggested response
      fetchSuggestedResponse(targetQuery, analysisResult);
    } catch (err) {
      console.error("Analyze Error:", err);
      const fallback = getClientFallbackAnalysis(targetQuery);
      setResult(fallback);
      fetchSuggestedResponse(targetQuery, fallback);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedResponse = async (queryText, analysisData) => {
    try {
      setResponseLoading(true);
      const data = await api.post("/api/analyze/response", {
        query: queryText,
        summary: analysisData.summary,
        category: analysisData.category,
        intent: analysisData.intent,
        priority: analysisData.priority,
        sentiment: analysisData.sentiment,
      });

      if (data && data.success && data.data?.response) {
        setGeneratedResponse(data.data.response);
      } else {
        setGeneratedResponse(
          `Hello! Thank you for reaching out. We apologize for the inconvenience regarding your ${analysisData.category.toLowerCase()} query. Our support team is currently reviewing your issue and will update you shortly.`
        );
      }
    } catch (err) {
      console.error("Generate Response Error:", err);
      setGeneratedResponse(
        `Hello! Thank you for reaching out. We apologize for the inconvenience regarding your ${analysisData.category.toLowerCase()} query. Our support team is currently reviewing your issue and will update you shortly.`
      );
    } finally {
      setResponseLoading(false);
    }
  };

  const saveTicket = async () => {
    if (!result || !query.trim()) return;

    try {
      setSaving(true);

      const data = await api.post("/api/tickets", {
        query: query,
        summary: result.summary,
        category: result.category,
        intent: result.intent,
        priority: result.priority,
        sentiment: result.sentiment,
        status: "Pending",
      });

      if (!data.success) {
        if (data.status !== 401) {
          setToast({ message: data.message || "Failed to save ticket", type: "error" });
        }
        return;
      }

      setSaved(true);
      setToast({ message: "Saved as a new support ticket!", type: "success" });
    } catch (err) {
      console.error("Save Ticket Error:", err);
      setToast({ message: "Unable to connect to server", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const newAnalysis = () => {
    setQuery("");
    setResult(null);
    setSaved(false);
    setGeneratedResponse("");
  };

  const getPriorityClass = (priority) => {
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Analyze Customer Query</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Extract intent, category, priority, and AI suggested response.
          </p>
        </div>

        <button
          onClick={newAnalysis}
          aria-label="Start new query analysis"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-semibold focus-visible:ring-2 focus-visible:ring-blue-500 outline-none w-full sm:w-auto"
        >
          <RefreshCw size={15} />
          New Analysis
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: QUERY INPUT & EXAMPLE QUERIES */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <MessageSquare size={18} className="text-[#2563EB]" />
              <h2 className="text-base font-bold">Customer Query Input</h2>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter customer support ticket message..."
              rows={6}
              aria-label="Customer query text input"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-xs outline-none resize-none focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => analyzeQuery(query)}
                disabled={loading}
                aria-label="Analyze query with AI"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold transition disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none w-full sm:w-auto shadow-sm"
              >
                <Sparkles size={16} />
                {loading ? "Analyzing..." : "Analyze Query"}
              </button>
            </div>
          </div>

          {/* 3 CLICKABLE EXAMPLE QUERIES */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Example Queries (Click to fill)
            </p>

            <div className="space-y-2">
              {EXAMPLE_QUERIES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(ex);
                    analyzeQuery(ex);
                  }}
                  className="w-full text-left p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI RESULT OR LOADING SKELETON */}
        <div>
          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-lg"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-lg"></div>
                <div className="h-14 bg-slate-100 dark:bg-slate-800/60 rounded-lg"></div>
              </div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-lg"></div>
            </div>
          ) : result ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-[#2563EB]" />
                  <h2 className="text-base font-bold">Analysis Results</h2>
                </div>

                {result.isFallback && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                    <Zap size={10} /> Fallback Analysis
                  </span>
                )}
              </div>

              {/* SUMMARY */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Issue Summary</p>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs font-medium leading-relaxed">
                  {result.summary}
                </div>
              </div>

              {/* METADATA BADGES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Category</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 mt-0.5">{result.category}</p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Intent</p>
                  <p className="font-bold mt-0.5 truncate">{result.intent}</p>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Priority</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getPriorityClass(result.priority)}`}>
                    {result.priority}
                  </span>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Sentiment</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-semibold rounded-full ${getSentimentClass(result.sentiment)}`}>
                    {result.sentiment}
                  </span>
                </div>
              </div>

              {/* SUGGESTED RESPONSE */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Suggested Response</p>
                  {generatedResponse && (
                    <button
                      onClick={copyToClipboard}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition inline-flex items-center gap-1"
                    >
                      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>

                {responseLoading ? (
                  <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"></div>
                ) : (
                  <textarea
                    value={generatedResponse}
                    onChange={(e) => setGeneratedResponse(e.target.value)}
                    rows={4}
                    placeholder="AI generated response will appear here..."
                    aria-label="Editable AI suggested response"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-3 text-xs outline-none resize-none focus:ring-2 focus:ring-blue-500 font-medium leading-relaxed"
                  />
                )}
              </div>

              {/* SAVE AS TICKET BUTTON */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  onClick={saveTicket}
                  disabled={saving || saved}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-60 inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Save size={14} />
                  {saving ? "Saving..." : saved ? "Ticket Saved ✓" : "Save as Ticket"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center shadow-sm h-full flex flex-col items-center justify-center">
              <Sparkles size={36} className="text-slate-400 mb-3" />
              <h3 className="text-base font-bold">No query analyzed yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Enter a customer message on the left or select an example query to see AI analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analyze;