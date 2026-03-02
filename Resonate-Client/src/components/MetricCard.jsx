export default function MetricCard({ title, value }) {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-3">
      <p className="text-xs text-slate-400">{title}</p>
      <p className="text-lg font-semibold text-slate-50">
        {value ?? "--"}
      </p>
    </div>
  );
}

