import { useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

function Toast({ message, type = "info", onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message || !onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const typeStyles = {
    success: "bg-emerald-900/90 border-emerald-700 text-emerald-100",
    error: "bg-rose-900/90 border-rose-700 text-rose-100",
    info: "bg-slate-900/90 border-slate-700 text-slate-100",
  };

  const icons = {
    success: <CheckCircle className="text-emerald-400 shrink-0" size={18} />,
    error: <AlertTriangle className="text-rose-400 shrink-0" size={18} />,
    info: <Info className="text-blue-400 shrink-0" size={18} />,
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
        typeStyles[type] || typeStyles.info
      }`}
      role="alert"
      aria-live="polite"
    >
      {icons[type] || icons.info}
      <span className="text-sm font-medium pr-2">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          aria-label="Close notification"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default Toast;
