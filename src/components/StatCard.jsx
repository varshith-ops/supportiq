function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
}

export default StatCard;