export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 w-full">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3"></div>
          <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-2/3"></div>
        </div>
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
      </div>
    </div>
  );
}

export function SkeletonTicket() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
      </div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-full"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-1/4 mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 mb-6"></div>
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
    </div>
  );
}
