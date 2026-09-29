import { AlertCircle, ArrowLeft, Home } from "lucide-react";

function NotFound({ setPage }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mb-5 border border-rose-200 dark:border-rose-900 shadow-sm">
        <AlertCircle size={32} />
      </div>

      <h1 className="text-4xl font-extrabold tracking-normal">404</h1>
      <h2 className="text-xl font-bold mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        The page you are looking for does not exist or has been moved. Check the URL or return to the dashboard.
      </p>

      <div className="flex items-center gap-3 mt-6">
        {setPage && (
          <button
            onClick={() => setPage("dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-lg text-xs font-semibold transition shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
          >
            <Home size={16} />
            Back to Dashboard
          </button>
        )}
      </div>
    </div>
  );
}

export default NotFound;
