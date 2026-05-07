export default function MetricBar({ label, value = 0, helper }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="text-mentisTextSecondary">{label}</span>
        <span className="font-semibold text-white">{safeValue}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mentisPrimary to-mentisSecondary transition-all duration-500"
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {helper && <p className="mt-1 text-xs text-mentisTextSecondary">{helper}</p>}
    </div>
  );
}
